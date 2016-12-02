<?php
/*!***************************************************************************
*! FILE NAME  : logger_launcher.php
*! DESCRIPTION: launches the event logger (IMU/GPS/External trigger/Other sensor) a dies
*! Copyright (C) 2012 Elphel, Inc
*! -----------------------------------------------------------------------------**
*!
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
*! -----------------------------------------------------------------------------**
*!  $Log: logger_launcher.php,v $
*!  Revision 1.3  2012/07/09 23:49:26  dzhimiev
*!  1. added mount/umount options
*!
*!  Revision 1.2  2012/04/13 00:49:59  dzhimiev
*!  1. added 'starting index' to logger
*!
*!
*!  Revision 1.1  2012/04/13 00:22:51  dzhimiev
*!  1. added logger_launcher.php
*!
*!
*/

//default parameters
$cmd = "start";
$file = "/mnt/sda1/imu_log.log";
$index = 1;
$n = 5000000;
$mount_point = "/mnt/sda1";
$force_dev = false;


$xml = "<Document>\n";

//get parameters
if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];

if (isset($_GET['file'])) $file = $_GET['file'];
if (isset($_GET['index'])) $index = $_GET['index'];
if (isset($_GET['n'])) $n = $_GET['n'];
if (isset($_GET['mount_point'])) $mount_point = $_GET['mount_point'];

if (isset($_GET['dev'])) {
   $dev = $_GET['dev'];
   $force_dev = true;
}

if ($cmd=="start") {

    if (!is_dir($mount_point)) mkdir($mount_point);

    if (!$force_dev) {
	$sda1 = exec("cat /proc/diskstats | grep 'sda1'");

	if      (strlen($sda1)>0) $dev = "/dev/sda1";
	else {
	  $xml .= "\t<error>CF cards not found</error>\n";
	  send_response($xml);
	}
    }

    exec("mount $dev $mount_point");
    exec("/usr/local/bin/log_imu $file $index $n >/dev/null 2>&1 &");
    $xml .= "\t<result>ok</result>\n";
}

if ($cmd=="stop") {

    exec("killall -1 log_imu");
    //unmount
    exec("umount $mount_point");
    $xml .= "\t<result>ok</result>\n";
}


$xml .= "</Document>";

send_response($xml);

function send_response($xml){
    header("Content-Type: text/xml");
    header("Content-Length: ".strlen($xml)."\n");
    header("Pragma: no-cache\n");
    printf("%s", $xml);
    flush();
}

?>