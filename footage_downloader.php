#!/usr/local/sbin/php -q
<?php
/*!*******************************************************************************
*! FILE NAME  : footage_downloader.php
*! DESCRIPTION: downloads file from Eyesis4Pi internal SSDs
*! Copyright (C) 2013 Elphel, Inc
*! -----------------------------------------------------------------------------**
*!  This program is free software: you can redistribute it and/or modify
*!  it under the terms of the GNU General Public License as published by
*!  the Free Software Foundation, either version 3 of the License, or
*!  (at your option) any later version.
*!
*!  This program is distributed in the hope that it will be useful,
*!  but WITHOUT ANY WARRANTY; without even the implied warranty of
*!  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*!  GNU General Public License for more details.
*!
*!  The four essential freedoms with GNU GPL software:
*!  * the freedom to run the program for any purpose
*!  * the freedom to study how the program works and change it to make it do what you wish
*!  * the freedom to redistribute copies so you can help your neighbor
*!  * the freedom to distribute copies of your modified versions to others
*!
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*! -----------------------------------------------------------------------------**
*! 
*/
echo "<pre>\n";

$n=9;
$master_ip=221;

$muxes = Array();
$muxes[0] = "192.168.0.224";
$muxes[1] = "192.168.0.228";

$srcs = Array();
$srcs[0] = "sdc";
$srcs[1] = "sdd";

$dest = "";

if (isset($_GET['dest'])) $dest = $_GET['dest'];
else if (isset($argv[1])) $dest = $argv[1];

if (isset($_GET['file'])) $file = $_GET['file'];
else if (isset($argv[2])) $file = $argv[2];

if (!isset($file)) die("filename is not set");

//get "SerialNo"
$ssds = Array();
$request = "phpshell.php?command=hdparm%20-i%20/dev/hda|grep%20'SerialNo'";

for ($i=0;$i<$n;$i++){  
  fopen("http://192.168.0.".($master_ip+$i)."/phpshell.php?command=umount%20/var/html/CF",'r');
  if ($fp=fopen("http://192.168.0.".($master_ip+$i)."/$request",'r')){
    $content = '';
    while ($line = fread($fp, 1024)) {
      $content .= $line;
    }  
  }
  //various disks have serial number of various length
  $ssd_tmp = explode("<",substr($content,strrpos($content,"SerialNo=")+strlen("SerialNo="),20));
  $ssds[$i] = $ssd_tmp[0];
}

print_r($ssds);
 
if (!is_dir("$dest")) mkdir($dest);//data/footage/dest_path
if (!is_dir("$dest/mov")) mkdir("$dest/mov");//data/footage/dest_path

download_footage($muxes,"ssd1",$srcs,$file,$dest);
download_footage($muxes,"ssd2",$srcs,$file,$dest);
download_footage($muxes,"ssd3",$srcs,$file,$dest);
download_footage($muxes,"ssd4",$srcs,$file,$dest);
download_footage($muxes,"ssd5",$srcs,$file,$dest);

// download_footage($mux1,"ssd2","2",$src1,$argv[1]);
// download_footage($mux1,"ssd3","5",$src1,$argv[1]);
// download_footage($mux1,"ssd4","6",$src1,$argv[1]);
// 
// // download_footage($mux2,"ssd1","3",$src2,$argv[1]);
// // download_footage($mux2,"ssd2","4",$src2,$argv[1]);
// // download_footage($mux2,"ssd3","7",$src2,$argv[1]);
// // download_footage($mux2,"ssd4","8",$src2,$argv[1]);
// // download_footage($mux2,"ssd5","9",$src2,$argv[1]);
// 
// echo "Done\n";

//back to default states
fopen("http://192.168.0.224/eyesis_ide.php","r");
fopen("http://192.168.0.228/eyesis_ide.php","r");

function download_footage($muxes,$ssd,$srcs,$file,$dest){
  global $ssds;
  //switch IDE_MUX
  fopen("http://".$muxes[0]."/103697.php?c:host4=$ssd","r");
  fopen("http://".$muxes[1]."/103697.php?c:host4=$ssd","r");
  sleep(30);
  //exec("dmesg");
  //mount

  echo "\nChecking sdc\n";
  //$result = exec("hdparm -i /dev/sdc | grep 'SerialNo' | awk '{print substr($0,45,20)}'");
  $result_tmp = explode("SerialNo",exec("hdparm -i /dev/${srcs[0]} | grep 'SerialNo'"));
  $result = trim(trim($result_tmp[1],"="));

  $index = array_search($result,$ssds);
  echo "The index is ".$index."\n";
  $index++;
  if ($index!=false) {
    //sdc1
    echo system("mount /mnt/${srcs[0]}1");
    if (!is_dir("$dest/mov/$index")) mkdir("$dest/mov/$index");
    echo "rsync -a /mnt/".$srcs[0]."1/$file $dest/mov/$index;umount /mnt/".$srcs[0]."1\n";
    system("rsync -a /mnt/".$srcs[0]."1/$file $dest/mov/$index;umount /mnt/".$srcs[0]."1");
    //sdc2
    echo system("mount /mnt/${srcs[0]}2");
    if (!is_dir("$dest/mov/$index")) mkdir("$dest/mov/$index");
    echo "rsync -a /mnt/".$srcs[0]."2/$file $dest/mov/$index;umount /mnt/".$srcs[0]."2\n";
    system("rsync -a /mnt/".$srcs[0]."2/$file $dest/mov/$index;umount /mnt/".$srcs[0]."2");
  }

  echo "\nChecking sdd\n";
  //$result = exec("hdparm -i /dev/sdd | grep 'SerialNo' | awk '{print substr($0,45,20)}'");
  $result_tmp = explode("SerialNo",exec("hdparm -i /dev/sdd | grep 'SerialNo'"));
  $result = trim(trim($result_tmp[1],"="));

  $index = array_search($result,$ssds);
  echo "The index is ".$index."\n";
  $index++;
  if ($index!=false) {
    //sdd1
    echo system("mount /mnt/${srcs[1]}1");
    if (!is_dir("$dest/mov/$index")) mkdir("$dest/mov/$index");
    echo "rsync -a /mnt/".$srcs[1]."1/$file $dest/mov/$index;umount /mnt/".$srcs[1]."1\n";
    system("rsync -a /mnt/".$srcs[1]."1/$file $dest/mov/$index;umount /mnt/".$srcs[1]."1");
    //sdd2
    echo system("mount /mnt/${srcs[1]}2");
    if (!is_dir("$dest/mov/$index")) mkdir("$dest/mov/$index");
    echo "rsync -a /mnt/".$srcs[1]."2/$file $dest/mov/$index;umount /mnt/".$srcs[1]."2\n";
    system("rsync -a /mnt/".$srcs[1]."2/$file $dest/mov/$index;umount /mnt/".$srcs[1]."2");
  }


  //echo "\nChecking sde\n";
  //echo exec("hdparm -i /dev/sdd | grep 'SerialNo' | awk '{print substr($0,45,20)}'");
  //copy
  //system("cp $src/* $dest");
//   $files = scandir($src);
//   foreach($files as $file){
//     if (is_file($src."/".$file)) {
//       $file_prefix = pathinfo($file, PATHINFO_FILENAME);
//       $file_ending = pathinfo($file, PATHINFO_EXTENSION);
//       $new_file = $file_prefix."_".$index.".".$file_ending;
//       //place for rsync
//       //system("cp $src/$file $dest/$new_file &");
//       //echo $new_file."\n";
//     }
//     
//   }
  //unmount
  //system("umount /mnt/".$srcs[0]);
}

?>