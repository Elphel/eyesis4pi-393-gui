<?php
/*!***************************************************************************
*! FILE NAME  : eyesis4pi_controls.php
*! DESCRIPTION: change the settings of the 8 eyesis4pi cameras
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
*!  $Log: tests.php,v $
*/

// defaults
$i2c = false;
$master_ip = 221;
$n = 1;
$temperature = false;
$set_parameter = false;
$get_parameter = false;
$test=false;
$res_xml = "";
$cmd = "cf_cards";

// keys assign
foreach($_GET as $key=>$value) {
	switch($key) {
		case "master_ip"       : $master_ip = $value+0; break;
		case "n"               : $n = $value+0; break;
		case "temperature"     : $temperature = true; break;
		case "cmd"             : $cmd = $value; break;
	}
}

$pc_time=@getdate();

// calculate cameras ip addresses based on $master_ip & $n - simple increment from the master camera.
for ($i=0;$i<$n;$i++) {
	$cam_ip[$i] = "192.168.0.".($master_ip+$i);
}

if ($cmd=="cf_cards"){

    $cf_hda1 = @preg_match("/hda1/",$cf_contents);
    $cf_hdb1 = @preg_match("/hdb1/",$cf_contents);

    for($i=0;$i<$n;$i++) {
	$cf_contents = @file_get_contents("http://".($cam_ip[$i])."/phpshell.php?command=cat%20/proc/partitions%20|%20grep%20'hd'");
	$cf_hda1 = @preg_match("/hda1/",$cf_contents);
	$cf_hdb1 = @preg_match("/hdb1/",$cf_contents);
	$res_xml .= "\t<cam$i>\n";
	$res_xml .= "\t\t<ip>".$cam_ip[$i]."</ip>\n";
	$res_xml .= "\t\t<hda1>$cf_hda1</hda1>\n";
	$res_xml .= "\t\t<hdb1>$cf_hdb1</hdb1>\n";
	$res_xml .= "\t</cam$i>\n";
    }
    
    $res_xml = "<Document>\n".$res_xml."</Document>";

}

if ($cmd=="gps") {
    $res_xml = @file_get_contents("http://".($cam_ip[0]).":8081/meta");
}

if ($cmd=="imu"){

    $imu_contents = @file_get_contents("http://".($cam_ip[0])."/phpshell.php?command=dmesg%20|%20grep%20'IMU'");

    $imu = @preg_match("/IMU_ctl_open/",$imu_contents);

    if ($imu>0) $imu = 1;

    $res_xml = "<Document>\n";
    $res_xml .= "\t<imu>".$imu."</imu>\n";
    $res_xml .= "</Document>";
}

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();


?>