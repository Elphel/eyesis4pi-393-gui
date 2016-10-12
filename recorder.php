#!/usr/bin/php -q
<?php

include 'filesystem.php';

$ip         = $argv[1];
$n          = $argv[2];
$interval   = $argv[3]*1000;
$mask       = $argv[4];
$root_path  = $argv[5];
$subfolder  = $argv[6];
$file_limit = $argv[7];
$index      = $argv[8];

if ($mask=="0x1ff") $skip = false;
else                $skip = true;

$odd = true;

while(true) {

    $time1 = microtime(true);

    //trigger
    if ($skip) {
	//fopen("http://192.168.0.$ip:8081/trig/pointers");
	//usleep($interval/2);
	//$odd = !$odd;
    }

    fopen("http://192.168.0.$ip:8081/trig/pointers");

    //usleep(1000);
    if ($odd) {
      $index = update_subsubdir("$root_path/$subfolder",$index,$file_limit,$index_max=100000);
      $path = "$root_path/$subfolder/$index";
      system("./images.sh $ip $n $path &");
    }

    $time2 = microtime(true);

    $time3 = 1000000*($time2-$time1);
    //echo $time2." - ".$time1." = ".$time3."\n";
    $delta = $interval-$time3;
    if ($delta<0) $delta=0;
    usleep($delta);
}

?>