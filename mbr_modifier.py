#!/usr/bin/env python3

import math
import argparse

import sys
import subprocess

import re

parser = argparse.ArgumentParser(description='EXTREME CARE MUST BE TAKEN',usage='sudo python mbr_modifier.py <device>')

parser.add_argument('device',help='full device name, e.g: /dev/sdb')

args = parser.parse_args()

try:
    args.device
except NameError:
    device = ""
else:
    device = args.device

print("Will modify the Master Boot Record of %s device"%device)

print("Read device ID and Serial number")

def remove_special_characters(s):
    for i in s:
        if (not re.match("[a-zA-Z0-9_]",i)):
            if (i==" "):
                return remove_special_characters(s.replace(i,"_"))
            else:
                return remove_special_characters(s.replace(i,""))
    return s 

hdparm = subprocess.check_output(['hdparm','-I',device])

hdparm = hdparm.splitlines()

Model=""
SerialNo=""

for l in hdparm:
    if (l.find("Model Number")!=-1):
        tmp_Model = l.split(":")
        Model = tmp_Model[1].strip()
        Model = remove_special_characters(Model)
    if (l.find("Serial Number")!=-1):
        tmp_SerialNo = l.split(":")
        SerialNo = tmp_SerialNo[1].strip()
        SerialNo = remove_special_characters(SerialNo)


print(Model)
print(SerialNo)

device_name = device[device.rfind("/")+1:]

#Model = subprocess.check_output(['cat','/sys/block/%s/device/model'%device_name])
#Model = Model.strip()
#Model = remove_special_characters(Model)
#print(Model)
   
#SerialNo = subprocess.check_output(['cat','/sys/block/%s/device/vpd_pg80'%device_name])
#SerialNo = SerialNo.strip()
#SerialNo = remove_special_characters(SerialNo)
#print(SerialNo)

physical_block_size = subprocess.check_output(['cat','/sys/block/%s/queue/physical_block_size'%device_name])
physical_block_size = physical_block_size.strip()

logical_block_size = subprocess.check_output(['cat','/sys/block/%s/queue/logical_block_size'%device_name])
logical_block_size = logical_block_size.strip()

print("%s/%s"%(logical_block_size,physical_block_size))

if (physical_block_size==logical_block_size):
    sys.exit("logical block equals physical block - no need for MBR modification")

lp_ratio = int(physical_block_size)/int(logical_block_size)
print(lp_ratio)

print("Backup original MBR")

import time

ts = (str(int(time.time())))

mbr_backup_name = "MBR_original_"+Model + "_" + SerialNo + "__" + ts + ".img"
mbr_modified_name = "MBR_modified_"+Model + "_" + SerialNo + "__" + ts + ".img"

print("Backup name: " + mbr_backup_name)
print("New name   : " + mbr_modified_name)

subprocess.check_output(['dd','if='+device,'of='+mbr_backup_name,'bs=512','count=1'])

p1_offset = 0x1BE
p2_offset = 0x1CE

f2 = open(mbr_modified_name, "wb")
f1 = open(mbr_backup_name, "rb")
try:
    a = 0
    byte = f1.read(1)
    while byte != "":
        #print(str(hex(a)) + ":" + binascii.hexlify(byte))
        
        # Do stuff with byte.
        # Do the 1st partition
        # (copy) P1 status
        if (a==(p1_offset+0)): 
            p1_status = ord(byte)
            print("=== P1 Status: "+str(hex(p1_status)))
        
        if (a==(p1_offset+1)):
            p1_chs_first = 0
            p1_chs_first = p1_chs_first|((ord(byte)<<16)&0xff0000)
        if (a==(p1_offset+2)):
            p1_chs_first = p1_chs_first|((ord(byte)<<8 )&0x00ff00)
        if (a==(p1_offset+3)):
            p1_chs_first = p1_chs_first|((ord(byte)<<0 )&0x0000ff)
            print("=== P1 CHS first: "+str(hex(p1_chs_first)))
            
        if (a==(p1_offset+4)):
            p1_partition_type = ord(byte)
            print("=== P1 Partition Type: "+str(hex(p1_partition_type)))
        
        if (a==(p1_offset+5)):
            p1_chs_last = 0
            p1_chs_last = p1_chs_last|((ord(byte)<<16)&0xff0000)
        if (a==(p1_offset+6)):
            p1_chs_last = p1_chs_last|((ord(byte)<<8 )&0x00ff00)
        if (a==(p1_offset+7)):
            p1_chs_last = p1_chs_last|((ord(byte)<<0 )&0x0000ff)
            print("=== P1 CHS last: "+str(hex(p1_chs_last)))
        
        if (a==(p1_offset+8)):
            p1_lba_first = 0
            p1_lba_first = p1_lba_first|((ord(byte)<<0 )&0x000000ff)
        if (a==(p1_offset+9)):
            p1_lba_first = p1_lba_first|((ord(byte)<<8 )&0x0000ff00)
        if (a==(p1_offset+10)):
            p1_lba_first = p1_lba_first|((ord(byte)<<16)&0x00ff0000)
        if (a==(p1_offset+11)):
            p1_lba_first = p1_lba_first|((ord(byte)<<24)&0xff000000)
            p2_lba_first = lp_ratio*p1_lba_first
            print("=== P1 LBA first: "+str(hex(p1_lba_first)))
        
        if (a==(p1_offset+12)):
            p1_sectors_in_partition = 0
            p1_sectors_in_partition = p1_sectors_in_partition|((ord(byte)<<0 )&0x000000ff)
        if (a==(p1_offset+13)):
            p1_sectors_in_partition = p1_sectors_in_partition|((ord(byte)<<8 )&0x0000ff00)
        if (a==(p1_offset+14)):
            p1_sectors_in_partition = p1_sectors_in_partition|((ord(byte)<<16)&0x00ff0000)
        if (a==(p1_offset+15)):
            p1_sectors_in_partition = p1_sectors_in_partition|((ord(byte)<<24)&0xff000000)
            
            p2_sectors_in_partition = lp_ratio*p1_sectors_in_partition
            print("=== P1 Number of Sectors: "+str(hex(p1_sectors_in_partition)))
        
        if   (a==(p2_offset+0 )): f2.write(chr(p1_status))
        elif (a==(p2_offset+1 )): f2.write(chr((p1_chs_first>>16)&0xff))
        elif (a==(p2_offset+2 )): f2.write(chr((p1_chs_first>>8 )&0xff))
        elif (a==(p2_offset+3 )): f2.write(chr((p1_chs_first>>0 )&0xff))            
        elif (a==(p2_offset+4 )): f2.write(chr((p1_partition_type>>0)&0xff))    
        elif (a==(p2_offset+5 )): f2.write(chr((p1_chs_last>>16)&0xff))
        elif (a==(p2_offset+6 )): f2.write(chr((p1_chs_last>>8 )&0xff))
        elif (a==(p2_offset+7 )): f2.write(chr((p1_chs_last>>0 )&0xff))
        elif (a==(p2_offset+8 )): f2.write(chr((p2_lba_first>>0 )&0xff))
        elif (a==(p2_offset+9 )): f2.write(chr((p2_lba_first>>8 )&0xff))
        elif (a==(p2_offset+10)): f2.write(chr((p2_lba_first>>16)&0xff))
        elif (a==(p2_offset+11)): f2.write(chr((p2_lba_first>>24)&0xff))
        elif (a==(p2_offset+12)): f2.write(chr((p2_sectors_in_partition>>0 )&0xff))
        elif (a==(p2_offset+13)): f2.write(chr((p2_sectors_in_partition>>8 )&0xff))
        elif (a==(p2_offset+14)): f2.write(chr((p2_sectors_in_partition>>16)&0xff))
        elif (a==(p2_offset+15)): f2.write(chr((p2_sectors_in_partition>>24)&0xff))
        else:
            f2.write(byte)
        
        a = a + 1        
        byte = f1.read(1)
finally:
    f2.close()
    f1.close()

print("Modifying MBR")

subprocess.check_output(['dd','if='+mbr_modified_name,'of='+device,'bs=512','count=1'])

sys.exit("Success")

#chs as in original mbr
chs_first = 0x000200
chs_last  = 0x11BF20

lba_first = 0x00000001

sectors_in_partition = 0x03A38B2D

#sectors per track
Nsec = 63
#number of heads
Nh = 16

def chs2lba(chs,nh,ns):
    #c = ((((chs>>8)&0xE0)<<8)&0x300)|(chs&0xff);
    c = (((chs>>8)&0xC0)<<2)|(chs&0xff)
    h = (chs>>16)&0xff;
    s = (chs>>8)&0x3f;
    print("chs2lba(): c= %s h= %s s= %s"%(hex(c),hex(h),hex(s)))
    lba = (nh*c+h)*ns+(s-1)
    return lba

def lba2chs(lba,nh,ns):
    c = int(lba/ns/nh)
    lba = lba - c*ns*nh
    h = int(lba/ns)
    lba = lba - h*ns
    s = lba+1
    print("lba2chs(): c= %s h= %s s= %s"%(hex(c),hex(h),hex(s)))
    h_byte = h
    s_byte = ((c&0x300)>>2)|(s&0x3f)
    c_byte = c
    chs = ((h_byte<<16)&0xff0000)|((s_byte<<8)&0xff00)|(c_byte&0xff)
    #chs = ((h<<16)&0xff0000)|(((((c&0x300)>>2)|s&0x3f)<<8)&0xff00)|(c&0xff)
    return chs


lba_first_calced = chs2lba(chs_first,Nh,Nsec)
lba_last_calced = chs2lba(chs_last,Nh,Nsec)

lba_first_calced = 8*lba_first_calced
lba_last_calced = 8*lba_last_calced

chs_first_calced = lba2chs(lba_first_calced,Nh,Nsec)
chs_last_calced = lba2chs(lba_last_calced,Nh,Nsec)

print("First lba: %s"%(hex(chs_first_calced)))
print("Last  lba: %s"%(hex(chs_last_calced)))
print("Sectors in partition: %s"%(hex(sectors_in_partition*8)))



    
    
    