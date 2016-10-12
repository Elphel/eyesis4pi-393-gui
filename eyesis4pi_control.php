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
*!  $Log: eyesis4pi_controls.php,v $
*/

// Check location - should be launched on the PC websrver
$elp_const=get_defined_constants(true);


if (isset($elp_const["elphel"])) {
  $fp = fopen($_SERVER['SCRIPT_FILENAME'], 'rb');
  fseek($fp, 0, SEEK_END);  /// file pointer at the end of the file (to find the file size)
  $fsize = ftell($fp);      /// get file size
  fseek($fp, 0, SEEK_SET);  /// rewind to the start of the file
  /// send the headers
  header("Content-Type: application/x-php");
  header("Content-Length: ".$fsize."\n");
  fpassthru($fp);           /// send the script (this file) itself
  fclose($fp);
  exit (0);
}

// defaults
$i2c = false;
//$master_ip = 221;
$master_ip = "";
$n = 1;
$temperature = false;
$set_parameter = false;
$get_parameter = false;
$test=false;
$res_xml = "";

$debug=true;

$run_camogm=false;
$start = false;
$stop = false;
$mount = false;
$unmount = false;
$get_hdd_space = false;
$status = false;
$exit = false;
$run_status = false;

// keys assign
foreach($_GET as $key=>$value) {
	switch($key) {
		case "master_ip"       : $master_ip = $value+0; break;
		case "n"               : $n = $value+0; break;

		case "set_parameter"   : $set_parameter = true; break;
		case "get_parameter"   : $get_parameter = true; break;
		case "pname"           : $pname  = $value; break;
		case "pvalue"          : $pvalue = $value+0; break;

		case "i2c"             : $i2c = true; break;
		case "i2c_width"       : $i2c_width = $value; break;
		case "i2c_bus"         : $i2c_bus = $value; break;
		case "i2c_adr"         : $i2c_adr = $value; break;
		case "i2c_data"        : $i2c_data = $value; break;

		case "test"            : $test=true; break;
		
		case "run_camogm"      : $run_camogm = true; break;
		case "exit"            : $exit = true; break;
		case "start"           : $start = true; break;
		case "stop"            : $stop = true; break;
		case "status"          : $status=true; break;
		case "run_status"      : $run_status=true; break;

		//camogm
		case "split"           : $split = true; break;
		case "duration"        : $split_duration= $value+0; break;
		case "size"            : $split_size= $value+0; break;
		case "max_frames"      : $split_max_frames= $value+0; break;
		case "rec_delay"       : $rec_delay=$value+0; break;
		case "set_prefix"      : $set_prefix=true; break;
		case "prefix"          : $prefix = $value; break;

		case "mount"           : $mount=true; break;
		case "unmount"         : $unmount=true; break;
		
		case "get_hdd_space"   : $get_hdd_space=true; break;
		case "mount_point"     : $mount_point = $value; break;
		
		//case "debug"           : $debug = $value; break;
		case "debuglev"        : $debuglev = $value+0; break;
		//end camogm
	}
}

//overrides
$debuglev = 0;

$pc_time=@getdate();

// calculate cameras ip addresses based on $master_ip & $n - simple increment from the master camera.
for ($i=0;$i<$n;$i++) {
	$cam_ip[$i] = "192.168.0.".($master_ip+$i);
}

//perform some tests
if ($test) {
}

if ($i2c) {

	$res_xml = "<?xml version='1.0' standalone='yes'?>\n<camogm_multiple>\n";

        if ($i2c_data) $i2c_data_rq = "&data=$i2c_data";
	else           $i2c_data_rq = "";

	for ($i=0;$i<count($cam_ip);$i++) {

		if ($fp = fopen("http://".$cam_ip[$i]."/i2c.php?width=$i2c_width&bus=$i2c_bus&adr=$i2c_adr".$i2c_data_rq, 'r')) {
		    $content = '';
		    while ($line = fread($fp, 1024)) {
			    $content .= $line;
		    }
		    $content = substr($content,21);
		    $message_IP[$i] = $content;

		} else {
		    $message_IP[$i] = "no connection";
		}
	}

	for ($i=0;$i<count($cam_ip);$i++) {
		$res_xml .= "<camera_{$cam[$i]}>\n";
		$res_xml .= $message_IP[$i];
		$res_xml .= "</camera_{$cam[$i]}>\n";
	}

	$res_xml .= "</camogm_multiple>\n";
  
	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();
}

if ($set_parameter) {
	for ($i=0;$i<$n;$i++) {
	    if ($pname=="SET_SKIP") $fp = fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_skip&skip_mask=".dechex($pvalue), 'r');
	    else                    $fp = fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_parameter&pname=$pname&pvalue=$pvalue", 'r');

	    if ($fp) {
	    $content = '';
	    while ($line = fread($fp, 1024)) {
		    $content .= $line;
	    }
	    //$content = substr($content,21);
	    $message_IP[$i] = $content;
	    } else {
		    $message_IP[$i] = "no connection";
	    }
	    $res_xml .= $message_IP[$i];
	}

	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();

}

if ($get_parameter) {
	for ($i=0;$i<$n;$i++) {
		if ($fp = fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=get_parameter&pname=$pname", 'r')) {
		$content = '';
		while ($line = fread($fp, 1024)) {
			$content .= $line;
		}
		//$content = substr($content,21);
		$message_IP[$i] = $content;
		} else {
			$message_IP[$i] = $cam_ip[$i];
		}

		$res_xml .= $message_IP[$i];
	}

	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();

}

//CAMOGM
if ($run_camogm) {
	echo "<pre>";
	for ($i=0;$i<$n;$i++) {
	    // start camogm
	    if (!$debug) fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=run_camogm", 'r');
	    else         fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=run_camogm&debug=$debug&debuglev=$debuglev", 'r');

	    // set debug level
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_debuglev&debuglev=$debuglev", 'r');

	    // set "/var/0" prefix
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_prefix&prefix=/var/html/CF/", 'r');

	    //mount
	    //fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=mount&partition=/dev/hda1&mountpoint=/var/html/CF", 'r');

	    // set .mov format
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=setmov", 'r');
	    // set frames_per_chunk in exif to 1
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_frames_per_chunk&frames_per_chunk=1", 'r');
	    // set default split parameters
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_duration&duration=1000", 'r');
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_size&size=1800000000", 'r');
	    
	    //debugging
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_max_frames&max_frames=1000", 'r');
	    //fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_max_frames&max_frames=100", 'r');
	    
	    //create dir
	    fopen("http://".$cam_ip[$i]."/phpshell.php?command=mkdir%20/var/html/CF", 'r');
	    //set prefix?!
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_prefix&prefix=/var/html/CF/", 'r');

	}

}

if ($exit) {
	for ($i=0;$i<$n;$i++) fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=exit", 'r');
}

if ($start) {
	if ($rec_delay<>0) {
		// get time from master camera
		if ($fp = fopen("http://".$cam_ip[0]."/camogmgui/camogm_interface.php?cmd=gettime", 'r')) {
			$content = '';
			while ($line = fread($fp, 1024)) {
				$content .= $line;
			}
			$xml = new SimpleXMLElement($content);
			$current_time=$xml -> gettime;
		} else {
			// just PC time
			$pc_time=getdate();
			$current_time = $pc_time[0];
		}

	  $start_timestamp=$current_time+$rec_delay;

	  //was commented for testing
	  //for ($i=0;$i<$n;$i++) fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=set_start_after_timestamp&start_after_timestamp=$start_timestamp", 'r');
	}

	for ($i=0;$i<$n;$i++) {
	    file_get_contents("http://".$cam_ip[0].":8081/bimg");
	    //file_get_contents("http://".$cam_ip[0].":8081/bimg");
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=start", 'r');
	}
}

if ($stop) {
	for ($i=0;$i<$n;$i++) fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=stop", 'r');
}

if ($mount) {
	for ($i=0;$i<$n;$i++) {
	    fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=mount&partition=/dev/hda1&mountpoint=/var/html/CF", 'r');
	}
}

if ($unmount) {
	for ($i=0;$i<$n;$i++) {
	    //fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=unmount&mountpoint=/var/html/CF", 'r');
	    fopen("http://".$cam_ip[$i]."/phpshell.php?command=sync", 'r');
	}
}

if ($get_hdd_space) {
	for ($i=0;$i<$n;$i++) {
		if ($fp = fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=get_hdd_space&mountpoint=$mount_point", 'r')) {

			$content = '';
			while ($line = fread($fp, 1024)) {
				$content .= $line;
			}

			$xml = new SimpleXMLElement($content);
			$free_space = $xml -> get_hdd_space;
			$message_IP[$i] = $free_space;
		} else {
			$message_IP[$i] = "no connection";
		}
	}
		$res_xml = "<?xml version='1.0' standalone='yes'?>\n<camogm_multiple>\n";

		for ($i=0;$i<count($cam_ip);$i++) {
			$res_xml .= "<cam".($i+1).">\n";
			$res_xml .= "<hdd_free_space>\n";
			$res_xml .= $message_IP[$i];
			$res_xml .= "</hdd_free_space>\n";
			$res_xml .= "</cam".($i+1).">\n";
		}

		$res_xml .= "</camogm_multiple>\n";

		header("Content-Type: text/xml");
		header("Content-Length: ".strlen($res_xml)."\n");
		header("Pragma: no-cache\n");
		printf("%s", $res_xml);
		flush();
}

if ($status) {
	for ($i=0;$i<$n;$i++) {
		if ($fp = fopen("http://".$cam_ip[$i]."/camogmstate.php", 'r')) {
			$content = '';
			while ($line = fread($fp, 1024)) {
				$content .= $line;
			}
			$content = substr($content,21);
			$message_IP[$i] = $content;
			/*
			if (strpos($content,"<state>\"stopped\"</state>"))
				$message_IP[$i] = "recording stopped";
			if (strpos($content,"<state>\"running\"</state>"))
				$message_IP[$i] = "recording running";
			*/
		} else {
			$message_IP[$i] = "<span style=\"color:#f00;\">no connection</span>";
		}
	}

	//add get_hdd_space here

	$res_xml = "<?xml version='1.0' standalone='yes'?>\n<camogm_multiple>\n";

	for ($i=0;$i<$n;$i++) {
		$res_xml .= "<cam".($i+1).">\n";
		$res_xml .= $message_IP[$i];
		$res_xml .= "</cam".($i+1).">\n";
	}

	$res_xml .= "</camogm_multiple>\n";
  
	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();
}

if ($run_status) {
	for ($i=0;$i<$n;$i++) {
		if ($fp = fopen("http://".$cam_ip[$i]."/camogmgui/camogm_interface.php?cmd=run_status", 'r')) {
			$content = '';
			while ($line = fread($fp, 1024)) {
				$content .= $line;
			}
			$content = new SimpleXMLElement($content);
			//$content = substr($content,21);
			$message_IP[$i] = "\n\t<camogm_state>".($content->state)."</camogm_state>\n";
			/*
			if (strpos($content,"<state>\"stopped\"</state>"))
				$message_IP[$i] = "recording stopped";
			if (strpos($content,"<state>\"running\"</state>"))
				$message_IP[$i] = "recording running";
			*/
		} else {
			$message_IP[$i] = "<span style=\"color:#f00;\">no connection</span>";
		}
	}

	//add get_hdd_space here

	$res_xml = "<?xml version='1.0' standalone='yes'?>\n<camogm_multiple>\n";

	for ($i=0;$i<$n;$i++) {
		$res_xml .= "<cam".($i+1).">\n";
		$res_xml .= $message_IP[$i];
		$res_xml .= "</cam".($i+1).">\n";
	}

	$res_xml .= "</camogm_multiple>\n";
  
	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();
}
?>