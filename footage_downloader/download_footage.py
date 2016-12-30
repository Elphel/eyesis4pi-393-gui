__author__ = "Elphel"
__copyright__ = "Copyright 2016, Elphel, Inc."
__license__ = "GPL"
__version__ = "3.0+"
__maintainer__ = "Oleg K Dzhimiev"
__email__ = "oleg@elphel.com"
__status__ = "Development"

import os
import subprocess

class Download:
  
  def __init__(self,partition,skip=0,n=0):
    
    self.partition = partition    
    
    self.dl_ssd_switch_timeout = 20 #seconds
    self.dl_blocksize = 20 #Megabytes
    self.dl_blockcount = 500
    self.dl_skip = skip
    self.dl_chunks = n
    
  def shout(self,cmd):
    #subprocess.call prints to console
    #subprocess.call(cmd,shell=True)
    ret_str = ""
    try:
      ret_str = subprocess.check_output(cmd,shell=True)
    except subprocess.CalledProcessError as e:
      ret_str = str(e.returncode)
      self.disable = True
    return ret_str
    
  def get_dir_name(self):
    print(self.partition[-4:])

    pattern = "ata-"

    cmd = "ls /dev/disk/by-id/ -all | grep '"+pattern+"' | grep '"+self.partition[-4:]+"'"
    res = self.shout(cmd)
    
    for name in res.split(" "):
      if name[0:len(pattern)]==pattern:
        return name[len(pattern):]
    
    return ""  
    
  def run(self):
    dirname = self.get_dir_name()
    print(dirname)
    
    if not os.path.isdir(dirname):
      os.mkdir(dirname)