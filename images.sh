#!/bin/bash
IP=$1
N=$2
PATH1=$3

for ((i=0; i < N; i++))
do
   SUM=$((i+IP))
   INDEX=$((i+1))
   ./get_image.sh "http://192.168.0.$SUM:8081/bimg" "$PATH1" "$INDEX.jp4" "$INDEX.log" "$INDEX" &
done
