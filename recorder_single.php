<?php

include 'filesystem.php';


$ip = $_GET['ip'];
$n  = $_GET['n'];
$root_path = $_GET['root_path'];
$subfolder  = $_GET['subfolder'];
$index=0;
$file_limit = 3000;

$path = $root_path."/".$subfolder;
$error = false;

if (!is_dir($path)) {
    $old = umask(0);
    mkdir($path,0777);
    umask($old);
}

$index = update_subsubdir("$root_path/$subfolder",$index,$file_limit,$index_max=100000);
$path = "$root_path/$subfolder/$index";

if (!is_dir($path)) {
    $old = umask(0);
    mkdir($path,0777);
    umask($old);
}

if ($fp = @simplexml_load_file("http://192.168.0.$ip:8081/trig/pointers")) {
    $system_status = system("./images.sh $ip $n $path");
    $fp = fopen("http://192.168.0.$ip/camogmgui/camogm_interface.php?cmd=set_parameter&pname=TRIG_PERIOD&pvalue=192000001", 'r');
    $fp = fopen("http://192.168.0.$ip/camogmgui/camogm_interface.php?cmd=set_parameter&pname=TRIG_PERIOD&pvalue=192000000", 'r');
    //$fp = fopen("http://192.168.0.221:8081/trig/pointers",'r');
    //$fp = fopen("http://192.168.0.221:8081/trig/pointers",'r');
    //$fp = fopen("http://192.168.0.221:8081/trig/pointers",'r');
}else{
    $error = true;
}


$res_xml = "<Document>\n";
$res_xml .= "\t<root>$root_path</root>\n";
$res_xml .= "\t<path>$path</path>\n";
if ($error){
  $res_xml .= "\t<error>error</error>\n";
}
$res_xml .= "</Document>";

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();

?>