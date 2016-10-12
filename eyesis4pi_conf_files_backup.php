<?php
/*!***************************************************************************
*! FILE NAME  : eyesis4pi_backup.php
*! DESCRIPTION: backup some important files
*! Copyright (C) 2012 Elphel, Inc
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
*!  $Log: eyesis4pi_backup.php,v $
*/



$BaseIP=221;
$N=9;
$BACKUP_DIR = "EYESIS4PI_BKP_".time();

$pattern = array(
    "<textarea rows=20 cols=80 name=content>",
    "</textarea>"
);

//full path only
$list = array(
    "/etc/autocampars.xml",
    "/etc/conf.d/hostname",
    "/etc/conf.d/net.eth0",
    "/etc/conf.d/mac",
    "/usr/html/eyesis_ide.php",
    "/etc/imu_logger.xml",
    "/etc/10364.config",
);

backup($BaseIP,$N,$BACKUP_DIR,$list);

function backup($ip,$n,$bkp_dir,$list){
    if (!is_dir($bkp_dir)) mkdir($bkp_dir);
    $RQ = "/admin-bin/editcgi.cgi?file";
    
    for ($i=$ip;$i<($ip+$n);$i++) {
	$final_dir = $bkp_dir."/".$i;
	if (!is_dir($final_dir)) mkdir($final_dir);
	foreach ($list as $file){
	    create_tree($file,$final_dir);
	    $content = file_get_contents("http://192.168.0.$i".$RQ."=".$file);
	    $tmp_arr = get_positions($content);
	    $content = substr($content,$tmp_arr[0],$tmp_arr[1]-$tmp_arr[0]);
	    // no need for "/" between names
	    file_put_contents($final_dir.$file,$content);
	}
    }
}

function create_tree($file,$path){
    $tmp_path = $path;
    $arr = explode("/",trim($file,"/"));
    for ($i=0;$i<(count($arr)-1);$i++){
      $tmp_path .= "/".$arr[$i];
      if (!is_dir($tmp_path)) mkdir($tmp_path);
    }
}

function get_positions($str){
  global $pattern;
  $arr[0] = strpos($str,$pattern[0])+strlen($pattern[0])+1;
  $arr[1] = strrpos($str,$pattern[1]);
  return $arr;
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
?>