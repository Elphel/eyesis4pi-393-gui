#!/usr/bin/php -q
<?php

include 'filesystem.php';

// Allow the script to hang around waiting for connections.
set_time_limit(0);

$CAMOGM = true;

$footage_root_path = "footage";
$footage_subfolder = "folder2";
$footage_index = "0";
$footage_file_limit = 1000;

$address = '127.0.0.1';
$port = 10009;
$out = "";

$socket = stream_socket_server("tcp://$address:$port", $errno, $errstr);

$status = "idle";

$ip = 221;
$interval = 1000;

$old_status_en = true;

if (!$socket) {
  echo "$errstr ($errno)<br />\n";
} else {
  // -1 sets stream_socket_accept timeout to 1 year
  while ($conn = stream_socket_accept($socket,-1)) {
    // Read until double CRLF, cause feof & stream_get_meta_data don't work
    while( !preg_match('/\r?\n\r?\n/', $out) ) {
	$out .= fgets($conn, 1024);
    }
    $out = substr($out,0,strrpos($out,"\r\n\r\n"));

    $xml = new SimpleXMLElement($out);

    //echo $out;

    $cmd = $xml->cmd;
    $interval = $xml->interval;
    $ip = $xml->ip;
    $n = $xml->n;
    $mask = $xml->mask;

    if ($cmd=="set_path") {
	$footage_root_path = $xml->path;
	$footage_subfolder = $xml->subfolder;
	$footage_file_limit = $xml->limit;
	$footage_index = 0;

	if (check_subdir($footage_root_path,$footage_subfolder)<0) {
	    if ($old_status_en) $old_status = $status;
	    $old_status_en = false;
	    $status = "Please, check the footage root directory. error code: ".check_subdir($footage_root_path,$footage_subfolder);
	}else{
	    $status = "Path parameters are set to path=$footage_root_path subfolder=$footage_subfolder limit=$footage_file_limit";
	}

    }

    if ($cmd=="start") $status = "running";

    if ($cmd=="stop")  {
	system("killall -9 recorder.php");
	$ci = $interval*96000;
	$fp = fopen("http://192.168.0.$ip/camogmgui/camogm_interface.php?cmd=set_parameter&pname=TRIG_PERIOD&pvalue=".($ci+1), 'r');
	$fp = fopen("http://192.168.0.$ip/camogmgui/camogm_interface.php?cmd=set_parameter&pname=TRIG_PERIOD&pvalue=".($ci), 'r');
	$status = "idle";
    }

    if ($cmd=="die") {
      $status = "The daemon is dead";
      system("killall -9 recorder.php");
      fputs($conn, "$status\n");
      fclose($conn);
      break;
    }

    //fputs($conn, date('n/j/Y g:i:s a').": Command: '$out'. Status: '$status'.\n");    

    if ($cmd=="check"){
	if (check_subdir($footage_root_path,$footage_subfolder)<0) {
	    if ($old_status_en) $old_status = $status;
	    $status = "Please, check the footage root directory. error code: ".check_subdir($footage_root_path,$footage_subfolder);
	    $old_status_en = false;
	}else{
	    if (!$old_status_en) $status = $old_status;
	    $old_status_en = true;
	}
    }

    //send reply
    fputs($conn, "$status\n");
    fclose($conn);

    //if ($status=="running") {
    if ($cmd=="start") {

	echo "$ip $n $interval $mask $footage_root_path $footage_subfolder";

	$footage_index = update_subsubdir("$footage_root_path/$footage_subfolder",$footage_index,$footage_file_limit,$index_max=1);
	if ($footage_index>=0) {
	    passthru("./recorder.php ".$ip." ".$n." ".$interval." ".$mask." ".$footage_root_path." ".$footage_subfolder." ".$footage_file_limit." ".$footage_index." >> /dev/null 2>&1 &");
	}

    }

    $cmd = "";
    $out = "";
  }
  fclose($socket);
}

?>