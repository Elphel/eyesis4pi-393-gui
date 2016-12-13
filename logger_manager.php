<?php
/*
*!***************************************************************************
*! FILE NAME  : logger_manager.php
*! DESCRIPTION: command interface for event logger
*! Copyright (C) 2016 Elphel, Inc.
*! --------------------------------------------------------------------------
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
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*! --------------------------------------------------------------------------
*/

$cmd = "donothing";

if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
if (isset($_GET['ip'])) $ip = $_GET['ip'];

switch($cmd){

  case "start":
    if (isset($_GET['file'])) $file = $_GET['file'];
    else die("-3");

    if (isset($_GET['index'])) $index = $_GET['index'];
    else die("-4");

    if (isset($_GET['n'])) $n = $_GET['n'];
    else die("-5");

    if ($fp = fopen("http://$ip/logger_launcher.php?cmd=start&file=$file&index=$index&n=$n", 'r')) 
      die("started");
    else 
      die("no connection");     
    break;
    
  case "stop":
    if ($fp = fopen("http://$ip/logger_launcher.php?cmd=stop", 'r')) 
      die("stopped");
    else 
      die("no connection");
    break;
    
  case "mount":
    // TODO: rename later to symlink
    $fp = fopen("http://$ip/eyesis4pi_interface.php?cmd=symlink",'r');
    die("already mounted");
    break;
    
  case "umount":
    // TODO: remove later or rename to sync
    if ($fp = fopen("http://$ip/autocampars.py?cmd=shell&include=sync", 'r'))
      die("unmounted");
    else 
      die("no connection");
    break;
  
  case "free_space":
    $mountpoint = '/mnt/sda1';
    if (isset($_GET['mountpoint'])) $mountpoint = $_GET['mountpoint'];
    
    if ($fp = file_get_contents("http://$ip/eyesis4pi_interface.php?cmd=free_space&mountpoint=$mountpoint")){
      die($fp);
    }else{
      die("no connection");
    }
    break;
    
  case "scandir":
    $mountpoint = '/mnt/sda1';
    if (isset($_GET['mountpoint'])) $mountpoint = $_GET['mountpoint'];

    $fc = file_get_contents("http://$ip/camogm_interface.php?cmd=list&path=$mountpoint");

    PrintXML($fc);
    break;
  case "download":
    //$path = "/mnt/sda1";
    $path = "/www/pages/ssd";
    $html_path = "ssd";
    
    file_get_contents("http://$ip/eyesis4pi_interface.php?cmd=symlink");
    
    $fc = file_get_contents("http://$ip/camogm_interface.php?cmd=list&path=$path");
    $xml = new SimpleXMLElement($fc);
    $test_arr = $xml->list->f;

    foreach($test_arr as $elem) {
      if (isset($_GET['destination']))
        $destination = $_GET['destination'];
      else
        $destination = 'data/footage';
      $filename = substr($elem,strrpos($elem,"/")-strlen($elem)+1);
      exec("wget http://$ip/$html_path/$filename -O $destination/$filename");
    }
    break;
  case "clean":
    file_get_contents("http://$ip/autocampars.py?cmd=shell&include=rm%20-rf%20/mnt/sda1/*");
    die("ok");
    break;
  default:
    die("bad command");
}

die(0);

if ($cmd=="free_space") {
  if (isset($_GET['mountpoint']))
    $mountpoint = $_GET['mountpoint'];
  else
    $mountpoint = '/mnt/sda1';

  if ($fp = file_get_contents("http://$ip/camogm_interface.php?cmd=get_hdd_space&mountpoint=$mountpoint")) {
    die($fp);
  }else{
    die("no connection");
  }
}

if ($cmd=="download") {

    $path = "/mnt/sda1";
    $fc = file_get_contents("http://$ip/camogm_interface.php?cmd=list&path=$path");
    $xml = new SimpleXMLElement($fc);
    //echo "<pre>";
    $test_arr = $xml->list->f;
    //print_r(count($test_arr));

    foreach($test_arr as $elem) {

	if (isset($_GET['destination']))
		$destination = $_GET['destination'];
	else
		$destination = 'data/footage';

	$tmp_pos = strpos($elem,"html")+4;
	$path_from_html = substr($elem,$tmp_pos-strlen($elem)+1,strrpos($elem,"/")-strlen($elem));
	$filename = substr($elem,strrpos($elem,"/")-strlen($elem)+1);

	exec("wget http://$ip/$path_from_html/$filename -O $destination/$filename");
    }
    //echo $xml->command;
}

if ($cmd=="scandir") {
    if (isset($_GET['mountpoint']))
	    $mountpoint = $_GET['mountpoint'];
    else
	    $mountpoint = '/mnt/sda1';

    $fc = file_get_contents("http://$ip/camogm_interface.php?cmd=list&path=$mountpoint");

    PrintXML($fc);
}

function PrintXML($xml) {
	header("Content-Type: text/xml\n");
	header("Content-Length: ".strlen($xml)."\n");
	header("Pragma: no-cache\n");
	echo $xml;
}

?>