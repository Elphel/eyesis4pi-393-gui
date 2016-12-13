#!/usr/bin/env python

__author__ = "Elphel"
__copyright__ = "Copyright 2016, Elphel, Inc."
__license__ = "GPL"
__version__ = "3.0+"
__maintainer__ = "Oleg K Dzhimiev"
__email__ = "oleg@elphel.com"
__status__ = "Development"

import sys
import os
import x393_downloader

usage = """Help:
1. Power on Eyesis4Pi
2. Plug in any of Eyesis4Pi's ESATA cable to PC
3. From PC, run: python {0} /data/footage/test
4. Repeat 2 & 3 for other ESATA cables
""".format(sys.argv[0])

if len(sys.argv)>1:
  print("Downloading footage from Eyesis4Pi internal SSDs to "+sys.argv[1])
  
else:
  print usage
  
sys.exit()

C1 = x393_downloader.x393_downloader(ip="192.168.0.163")
#C1.get_serialno("local")
C1.download()

sys.exit()
