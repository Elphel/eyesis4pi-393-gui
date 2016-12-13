#!/usr/bin/php -q
<?php

include 'filesystem.php';
include 'functions_cams.php';

$cams_str   = $argv[1];
$interval   = $argv[2]*1000;
$mask       = $argv[3];
$root_path  = $argv[4];
$subfolder  = $argv[5];
$file_limit = $argv[6];
$index      = $argv[7];

$cams = array();
$master = array();
$cams = get_cams($cams_str);
$master = get_master($cams);

/*
if ($mask=="0x1ff") $skip = false;
else                $skip = true;
*/
$skip = false;
$odd = true;

while(true) {

    $time1 = microtime(true);

    //trigger
    if ($skip) {
	//fopen("http://192.168.0.$ip:8081/trig/pointers");
	//usleep($interval/2);
	//$odd = !$odd;
    }

    file_get_contents("http://{$master['ip']}:{$master['port']}/trig/pointers");

    //usleep(1000);
    if ($odd) {
      $index = update_subsubdir("$root_path/$subfolder",$index,$file_limit,$index_max=100000);
      $path = "$root_path/$subfolder/$index";
      //system("./images.sh $ip $n $path &");
      for($i=0;$i<count($cams);$i++){
          system("./get_image.sh \"{$cams[$i]['ip']}:{$cams[$i]['port']}/bimg\" \"${path}\" \"${i}.jp4\" \"${i}.log\" \"${i}\">/dev/null 2>&1 &");
      }
    }

    $time2 = microtime(true);

    $time3 = 1000000*($time2-$time1);
    //echo $time2." - ".$time1." = ".$time3."\n";
    $delta = $interval-$time3;
    if ($delta<0) $delta=0;
    usleep($delta);
}

?>