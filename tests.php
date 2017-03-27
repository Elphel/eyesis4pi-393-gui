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
		case "temperature"     : $temperature = true; break;
		case "cmd"             : $cmd = $value; break;
	}
}

// keys assign
$cams = array();
if (isset($_GET['rq'])){
  $pars = explode(",",$_GET['rq']);
  foreach($pars as $ip){
    array_push($cams,array('ip'=>$ip));
  }
}

$pc_time=@getdate();

if ($cmd=="ssds"){

    for($i=0;$i<count($cams);$i++) {
	$cf_contents = file_get_contents("http://{$cams[$i]['ip']}/camogm_interface.php?cmd=list_partitions");
	
	$cf_sda = preg_match("/sda/",$cf_contents);
	$cf_sdb = preg_match("/sdb/",$cf_contents);
	
	$res_xml .= "\t<cam>\n";
	$res_xml .= "\t\t<ip>{$cams[$i]['ip']}</ip>\n";
	$res_xml .= "\t\t<sda>$cf_sda</sda>\n";
	$res_xml .= "\t\t<sdb>$cf_sdb</sdb>\n";
	$res_xml .= "\t</cam>\n";
    }
    
    $res_xml = "<Document>\n".$res_xml."</Document>";

}

if ($cmd=="gps") {
    $res_xml = @file_get_contents("http://".($cams[0]['ip']).":2323/meta");
}

if ($cmd=="imu"){

    //$imu_contents = @file_get_contents("http://".($cam_ip[0])."/eyesis4pi_interface.php?cmd=check_imu");
    $imu_contents = @file_get_contents("http://".($cams[0]['ip'])."/i2c.php?cmd=fromEEPROM4&EEPROM_chn=3");

    echo $imu_contents;
}

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();


?>