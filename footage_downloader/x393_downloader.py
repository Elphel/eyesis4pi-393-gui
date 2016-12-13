__author__ = "Elphel"
__copyright__ = "Copyright 2016, Elphel, Inc."
__license__ = "GPL"
__version__ = "3.0+"
__maintainer__ = "Oleg K Dzhimiev"
__email__ = "oleg@elphel.com"
__status__ = "Development"

import subprocess
import time
import re
import os
import sys

class x393_downloader:
  
  def __init__(self,user="root",ip="192.168.0.9"):
    self.ip = ip
    self.serialno = ""
    self.sshcmd = "ssh "+user+"@"+ip
    
    self.disable = False
    
    self.dl_ssd_switch_timeout = 20 #seconds
    self.dl_blocksize = 20 #Megabytes
    self.dl_blockcount = 50
    self.dl_chunks = 10
    
    #ping and check access
    self.check_connection()

  def shout(self,cmd):
    if not self.disable:
      #subprocess.call prints to console
      #subprocess.call(cmd,shell=True)
      ret_str = ""
      try:
        ret_str = subprocess.check_output(cmd,shell=True)
      except subprocess.CalledProcessError as e:
        ret_str = str(e.returncode)
        self.disable = True
      return ret_str

  def check_connection(self):
    check = self.shout(self.sshcmd+" 'dmesg'")
    if check.strip() == str(255):
      print("Error: No route to host")
      self.disable = True


  def get_serialno(self,mode):
    if not self.disable:
            
      rq1 = "ls /dev/disk/by-id/ -all"
      rq2 = "blkid"
      
      if mode=="remote":
        rq1 = self.sshcmd+" '"+rq1+"'"
        rq2 = self.sshcmd+" '"+rq2+"'"
      else:
        #rq2 = "sudo "+rq2
        # don't sudo
        rq2 = rq2
        
      s1 = self.shout(rq1)
      s2 = self.shout(rq2)
      
      ret = ("","")
      serialno=""
      dev = ""
      
      blkid_list = self.parse_blkid(s2)
      
      #print("blkid list: "+str(blkid_list))
      
      lines = s1.splitlines()
      
      # record the whole devices first
      dev_list = []
      for line in lines:
        line = re.sub(' +',' ',line)
        pars = line.split(" ")
        if len(pars)>0:
          m0 = re.search('sd[a-z]$',pars[-1])
          if m0:
            m1 = re.search('^ata-',pars[-3])
            if m1:
              dev_list.append((m0.group(0),pars[-3]))

      #print(dev_list)

      # partitions (the first not formatted)
      for line in lines:
        line = re.sub(' +',' ',line)
        pars = line.split(" ")
        if len(pars)>0:
          m0 = re.search('sd[a-z][0-9]',pars[-1])
          if m0:
            m1 = re.search('^ata-',pars[-3])
            if m1:
              # remove the whole device if a partition is found
              for item in dev_list:
                if item[0] in m0.group(0):
                  dev_list.remove(item)

              if  not "/dev/"+m0.group(0) in blkid_list:
                print("("+mode+") raw partition: /dev/"+m0.group(0))
                dev = "/dev/"+m0.group(0)      
                if self.serialno=="" or self.serialno==pars[-3]:
                  ret = (dev,pars[-3])
                break

      #print(dev_list)

      if dev=="":
        if (len(dev_list)>0):
          if dev_list[0][1]==self.serialno:
            print("Exiting @ "+dev_list[0][0]+" "+dev_list[0][1])
            return (dev_list[0][0],dev_list[0][1])
        
        #if dev=="":
        #  print("Warning: Device not found")
    
      return ret

  def parse_blkid(self,s):
    ret = []
    lines = s.splitlines()
    for line in lines:
      line = re.sub(' +',' ',line)
      pars = line.split(":")
      if len(pars)>0:
        ret.append(pars[0])
    return ret

  def get_mountpoints(self,s,device):
    mountpoints = []
    lines = s.splitlines()
    for line in lines:
      pars = line.split(" ")
      if (len(pars)>3):
        if device in pars[0]:
          print("Found mountpoint "+pars[2])
          mountpoints.append(pars[2])
    return mountpoints 

  def unmount(self):
    mountpoints = self.get_mountpoints(self.shout(self.sshcmd+" 'mount'"),self.dev)
    for mp in mountpoints:
      print("Unmounting "+mp)
      self.shout(self.sshcmd+" 'umount "+mp+"'")
    mountpoints = self.get_mountpoints(self.shout(self.sshcmd+" 'mount'"),self.dev)
    for mp in mountpoints:
      print("Error: failed to unmount "+mp)
      self.disable = True


  def download(self):
    # read device and serial of a disk
    self.dev, self.serialno = self.get_serialno("remote")
    if not self.disable:
      
      # unmount all of the mounted partitions
      self.unmount()
      # unload driver
      #self.shout(self.sshcmd+" 'rmmod ahci_elphel'")
      # switch the switch to PC
      self.shout(self.sshcmd+" '/usr/local/bin/x393sata_control.py set_esata_ssd'")
      # check my serialno - not instant? 10 seconds?
      timeout = self.dl_ssd_switch_timeout
      t = 0
      mydev, myserialno = ("","")
      
      while mydev=="":
        # get local device and serialno of a disk
        mydev, myserialno = self.get_serialno("local")
        t = t + 1
        time.sleep(1)
        if t>timeout:
          print("Error: Disk not found")
          self.disable = True
          break

      print("local device="+mydev+", local serial="+myserialno)
      
      # dd
      if not os.path.isdir(myserialno):
        os.mkdir(myserialno)
      bs = self.dl_blocksize
      count = self.dl_blockcount
      for i in range(0,self.dl_chunks):
        fname = myserialno+"/"+"file_"+str(i)+".img"
        skip = i*(count-1)
        self.shout("sudo dd if="+mydev+" "+" of="+fname+" bs="+str(bs)+"M count="+str(count)+" skip="+str(skip))
        #iflag=skip_bytes
      
      self.shout(self.sshcmd+" '/usr/local/bin/x393sata_control.py set_zynq_ssd'")
      
      # load the driver
      #subprocess.call(self.sshcmd+" 'modprobe ahci_elphel &'",shell=True)
      #time.sleep(1)
      #self.shout(self.sshcmd+" 'echo 1 > /sys/devices/soc0/amba@0/80000000.elphel-ahci/load_module'")
      # switch back the switch to Zynq
      