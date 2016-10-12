#!/usr/bin/env python

__author__ = "Elphel"
__copyright__ = "Copyright 2016, Elphel, Inc."
__license__ = "GPL"
__version__ = "3.0+"
__maintainer__ = "Oleg K Dzhimiev"
__email__ = "oleg@elphel.com"
__status__ = "Development"

import sys
import x393_downloader

C1 = x393_downloader.x393_downloader(ip="192.168.0.38")
C1.download()

sys.exit()
