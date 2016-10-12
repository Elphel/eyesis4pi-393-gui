<?php

$cmd = "do_nothing";

if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
if (isset($_GET['interval'])) $interval = $_GET['interval'];
if (isset($_GET['master_ip'])) $master_ip = $_GET['master_ip'];
else                           $master_ip = "221";
if (isset($_GET['n'])) $n = $_GET['n'];
if (isset($_GET['mask'])) $mask = $_GET['mask'];

if      ($cmd=="launch")   launch();
else if      ($cmd=="set_path") set_path($cmd,$_GET['path'],$master_ip,$n,$mask,$_GET['subfolder'],$_GET['limit']);
else                            get_state($cmd,$interval,$n,$mask,$master_ip);


function launch(){
    $status = system("./eyesis_daemon.php >> /data/footage/daemon_log.txt &");

    echo "daemon started";

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

function get_state($cmd,$interval,$n,$mask,$ip){
    $cmd = "<msg><cmd>$cmd</cmd><interval>$interval</interval><ip>$ip</ip><n>$n</n><mask>$mask</mask></msg>";
    send_msg($cmd);
}

function set_path($cmd,$path,$ip,$n,$mask,$subfolder,$limit){
    $msg  = "<msg>\n";
    $msg .= "<cmd>$cmd</cmd>\n";
    $msg .= "<n>$n</n>\n";
    $msg .= "<ip>$ip</ip>\n";
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