#!/usr/bin/env python

# Download Eyesis4Pi footage from:
# * standalone SSDs connected using a docking station or enclosure or else, raw partition, camera can be powered off
#   ** All information is in the Exif headers, so no need to match SSDs to subcameras
# * camera's internal SSD, raw partition, camera is powered on.
#

__author__ = "Elphel"
__copyright__ = "Copyright 2016, Elphel, Inc."
__license__ = "GPL"
__version__ = "3.0+"
__maintainer__ = "Oleg K Dzhimiev"
__email__ = "oleg@elphel.com"
__status__ = "Development"

import argparse
import os
import sys
import time

import x393

# TODO: Download imu logs

ssd_detect_timeout = 20

cams = [
    {"user":"root","ip":"192.168.0.38","imu_log":0},
  ]

dirs = []

#http://stackoverflow.com/questions/287871/print-in-terminal-with-colors-using-python
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[38;5;214m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    BOLDWHITE = '\033[1;37m'
    UNDERLINE = '\033[4m'

usage = """

help:

1. To locate a newly connected SSD device, run:

  $ dmesg
  
[] scsi 0:0:0:0: Direct-Access     ATA      Crucial_CT250MX2 MU02 PQ: 0 ANSI: 5
[] ata1.00: Enabling discard_zeroes_data
[] sd 0:0:0:0: Attached scsi generic sg0 type 0
[] sd 0:0:0:0: [sdb] 488397168 512-byte logical blocks: (250 GB/232 GiB)
[] sd 0:0:0:0: [sdb] 4096-byte physical blocks
[] sd 0:0:0:0: [sdb] Write Protect is off
[] sd 0:0:0:0: [sdb] Mode Sense: 00 3a 00 00
[] sd 0:0:0:0: [sdb] Write cache: enabled, read cache: enabled, doesn't support DPO or FUA
[] ata1.00: Enabling discard_zeroes_data
[]  sdb: sdb1 sdb2
[] ata1.00: Enabling discard_zeroes_data
[] sd 0:0:0:0: [sda] Attached SCSI disk

2. To locate a raw partition on the disk, run:
  
  $ sudo blkid
  
/dev/sdb1: UUID="ffffffff-ffff-ffff-ffff-ffffffffffff" TYPE="ext4" PARTUUID="ffffffff-ffff-ffff-ffff-ffffffffffff"
/dev/sdb2: PARTUUID="ffffffff-ffff-ffff-ffff-ffffffffffff"

* raw partition will have PARTUUID only 


examples:\n

I.
* SSD is connected to PC using a docking station/enclosure/etc.
* The data is on the raw partition /dev/sdb2
* Destination path: /data/footage/test
  Download:
  * Whole partition in 10GB chunks:
    {1}${0} -p /dev/sdb2 /data/footage/test{2}
  * Whole partition in 1GB chunks:
    {1}${0} -p /dev/sdb2 -bc 50 /data/footage/test{2}
  * 5GB in 1GB chunks, skip the first 3GBs:
    {1}${0} -p /dev/sdb2 -bc 50 -s 3 -n 5 /data/footage/test{2}

Note: Repeat for any other SSDs of the multi-camera system

II.
* internal SSD, camera is powered on
* The data is on the raw partition /dev/sdb2
* Destination path: /data/footage/test
  Download:
  * Whole partition in 10GB chunks:
    {1}${0} --internalSSD -c root@192.168.0.9 -p /dev/sdb2 /data/footage/test{2}
  * Whole partition in 1GB chunks:
    {1}${0} --internalSSD -c root@192.168.0.9 -p /dev/sdb2 -bc 50 /data/footage/test{2}
  * 5GB in 1GB chunks, skip the first 3GBs:
    {1}${0} --internalSSD -c root@192.168.0.9 -p /dev/sdb2 -bc 50 -s 3 -n 5 /data/footage/test{2}

""".format(sys.argv[0],bcolors.OKGREEN,bcolors.ENDC)

parser = argparse.ArgumentParser(description=usage,formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument("-c","--camera", default="root@192.168.0.9", help="provide camera ip address if downloading data from internal SSD, default = root@192.168.0.9")
parser.add_argument("-p","--partition",help="partition name, example: /dev/sdb2")
parser.add_argument("-s","--skip",type=int,default=0, help="Number of chunks to skip from the beginning")
parser.add_argument("-n","--n",type=int,default=0,help="Number of chunks to download")
parser.add_argument("-bs",type=int,default=20,help="block size in MB, default = 20")
parser.add_argument("-bc",type=int,default=512,help="Number of blocks of size [bs] in a single chunk, default = 512, so the default chunk size is 10GB")
parser.add_argument("dest",help="desitnation directory: /data/footage/test")

args = parser.parse_args()

# init checks all connections
for cam in cams:
  cam['obj'] = x393.Camera(cam['user'],cam['ip'])

pc = x393.PC()

# get raw partitions
for cam in cams:
  d = cam['obj'].first_found_raw_partition_name()
  if d!="undefined":
    dirs.append(d)
  else:
    raise Exception(cam['user']+"@"+cam['ip']+" : error: already switched or raw partition not found")
  print(cam['user']+"@"+cam['ip']+": raw partition name: "+d)

# switch ssd to pc for all (not caring which cable is in)
for cam in cams:
  cam['obj'].ssd_to_pc()

# download

plist = []
all_downloaded = False

for i in range(len(cams)):
  raw_input(bcolors.OKGREEN+"Connect camera(eSATA) to PC. Press Enter to continue..."+bcolors.ENDC)
  t = 0
  while not all_downloaded:
    plist = pc.list_partitions()
    for d in dirs:
      for p in plist:
        if d==p[0]:
          pc.download(args.dest,"/dev/"+p[1],d,args.bs,args.bc,args.skip,args.n)
          dirs.delete(d)
          if len(dirs)!=0:
            print("wait for the next ssd")
          else:
            all_downloaded = True
          break
    print("Waiting for disks to show up:")
    print(dirs)
    t = t + 1
    time.sleep(1)
    if t>ssd_detect_timeout:
      print(bcolors.FAIL+"PC: Error: Disks were not found:")
      print(dirs)
      print(bcolors.ENDC)
      break
    #cam['rp_name'].ssd_to_pc()

# ssd to camera for all
for cam in cams:
  cam['obj'].ssd_to_camera()

x393.Download(args.dest,args.partition,args.bs,args.bc,args.skip,args.n)




























