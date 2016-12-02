<?php

include 'functions_cams.php';

$cmd = "do_nothing";

if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
if (isset($_GET['interval'])) $interval = $_GET['interval'];

//skip mask is not needed
if (isset($_GET['mask'])) $mask = $_GET['mask'];
$mask = "0x1ff";

// keys assign
//example: rq=192.168.0.161:2323:0:0,192.168.0.162:2324:1:1
$cams = array();
$master = array();
if (isset($_GET['rq'])){
  $cams = get_cams($_GET['rq']);
  $master = get_master($cams);
}

if ($cmd=="launch") {
    launch();
}else if ($cmd=="set_path"){
    set_path($cmd,$_GET['path'],$mask,$_GET['subfolder'],$_GET['limit']);
}else{
    get_state($cmd,$interval,$mask);
}

function launch(){
    $status = system("./eyesis_daemon.php > /data/footage/daemon_log.txt &");
    echo "Daemon started";

//     if (!$status) {
//       $response = "fail";
//       echo "daemon started: ".$response;    
//     }else{
//       echo "daemon started";
//     }

//     $port = 10009;
//     $address = '127.0.0.1';
// 
//     $socket = stream_socket_client("tcp://$address:$port", $errno, $errstr, 30);
// 
//     if (!$socket) $response = "fail";
//     echo "daemon started: ".$response;
// 
//     fclose($socket);

}

function get_camstr(){
    global $cams;
    $msg = "<cams>".cams_to_str($cams)."</cams>";
    return $msg;
}

function get_state($cmd,$interval,$mask){
    $cmd = "<msg><cmd>$cmd</cmd><interval>$interval</interval>".get_camstr()."<mask>$mask</mask></msg>";
    send_msg($cmd);
}

function set_path($cmd,$path,$mask,$subfolder,$limit){
    $msg  = "<msg>\n";
    $msg .= "<cmd>$cmd</cmd>\n";
    $msg .= get_camstr();
    $msg .= "<mask>$mask</mask>\n";
    $msg .= "<path>$path</path>\n";
    $msg .= "<subfolder>$subfolder</subfolder>\n";
    $msg .= "<limit>$limit</limit>\n";
    $msg .= "</msg>";
    send_msg($msg);
}

function send_msg($msg){
    $port = 10009;
    $address = '127.0.0.1';
    $out = "";

    $msg .= "\r\n\r\n";

    $socket = stream_socket_client("tcp://$address:$port", $errno, $errstr, 30);
    if (!$socket) {
	$out = "$errstr ($errno)<br />\n";
    } else {

	fwrite($socket, $msg);

	//somehow feof works only with the client side.
	while (!feof($socket)) {
	    $out .= fgets($socket, 1024);
	}

	fclose($socket);
    }
    echo $out;
}

?>