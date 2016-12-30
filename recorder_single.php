<?php

include 'filesystem.php';
include 'functions_cams.php';

$root_path = $_GET['root_path'];
$subfolder  = $_GET['subfolder'];

$period = $_GET['period']+0;

$index=0;
$file_limit = 3000;

// keys assign
$cams = array();
$master = array();
if (isset($_GET['rq'])){
  $cams = get_cams($_GET['rq']);
  $master = get_master($cams);
}

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

if ($fp = simplexml_load_file("http://{$master['ip']}:{$master['port']}/trig/pointers")) {

    //elphel_set_P_value(2,ELPHEL_TRIG_PERIOD,0,ELPHEL_CONST_FRAME_IMMED);
    //usleep(200000);
    //elphel_set_P_value(2,ELPHEL_TRIG_PERIOD,1,ELPHEL_CONST_FRAME_IMMED);
    
    //$system_status = system("./images.sh $ip $n $path");
    for($i=0;$i<count($cams);$i++){
        exec("./get_image.sh \"{$cams[$i]['ip']}:{$cams[$i]['port']}/bimg\" \"${path}\" \"${i}.jp4\" \"${i}.log\" \"${i}\"> /dev/null 2>&1 &");
    }
    //why fopen?
    //$add_str = "http://{$master['ip']}/camogm_interface.php?cmd=set_parameter&pname=TRIG_PERIOD&pvalue=";
    $addr_str = "http://{$master['ip']}/parsedit.php?immediate&TRIG_PERIOD=";
    $fp = fopen($addr_str.($period+1)."*-2&sensor_port={$master['channel']}", 'r');
    $fp = fopen($addr_str.($period)."*-2&sensor_port={$master['channel']}", 'r');
    
    //printf($addr_str.($period+1)."*-2&sensor_port={$master['channel']}");
    
    //elphel_set_P_value(2,ELPHEL_TRIG_PERIOD,100000000,ELPHEL_CONST_FRAME_IMMED);
    
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