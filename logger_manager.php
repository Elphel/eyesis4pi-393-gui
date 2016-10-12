<?php

if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
else die("-1");

if (isset($_GET['ip'])) $ip = $_GET['ip'];
else die("-2");

if ($cmd=="start") {
    if (isset($_GET['file'])) $file = $_GET['file'];
    else die("-3");

    if (isset($_GET['index'])) $index = $_GET['index'];
    else die("-4");

    if (isset($_GET['n'])) $n = $_GET['n'];
    else die("-5");

    if ($fp = fopen("http://$ip/logger_launcher.php?cmd=start&file=$file&index=$index&n=$n", 'r')) 
      die("started");
    else 
      die("no connection"); 

}

if ($cmd=="stop") {
    if ($fp = fopen("http://$ip/logger_launcher.php?cmd=stop", 'r')) 
      die("stopped");
    else 
      die("no connection");
}

if ($cmd=="mount"){

    if (isset($_GET['device'])) $device = $_GET['device'];
    else                        $device = "/dev/hda1";

    $fp = fopen("http://$ip/phpshell.php?command=mkdir%20/var/html/CF",'r'); 

    if ($fp = fopen("http://$ip/phpshell.php?command=mount%20$device%20/var/html/CF", 'r')) 
      die("mounted");
    else 
      die("no connection");
}

if ($cmd=="umount") {
    //if ($fp = fopen("http://$ip/phpshell.php?command=umount%20/var/html/CF", 'r'))
    if ($fp = fopen("http://$ip/phpshell.php?command=sync", 'r'))  
      die("unmounted");
    else 
      die("no connection");
}

if ($cmd=="free_space") {
    if (isset($_GET['mountpoint']))
	    $mountpoint = $_GET['mountpoint'];
    else
	    $mountpoint = '/var/html/CF';

    if ($fp = file_get_contents("http://$ip/camogmgui/camogm_interface.php?cmd=get_hdd_space&mountpoint=$mountpoint")) {
      die($fp);
    }else{
      die("no connection");
    }
}

if ($cmd=="clean") {
    if (isset($_GET['mountpoint']))
	    $mountpoint = $_GET['mountpoint'];
    else
	    $mountpoint = '/var/html/CF';

    $fp = fopen("http://$ip/phpshell.php?command=rm%20-r%20/var/html/CF/*",'r'); 
}

if ($cmd=="download") {

    $path = "/var/html/CF";
    $fc = file_get_contents("http://$ip/camogmgui/camogm_interface.php?cmd=list&path=$path");
    $xml = new SimpleXMLElement($fc);
    //echo "<pre>";
    $test_arr = $xml->list->f;
    //print_r(count($test_arr));

    foreach($test_arr as $elem) {

	if (isset($_GET['destination']))
		$destination = $_GET['destination'];
	else
		$destination = 'data/footage';

	$tmp_pos = strpos($elem,"html")+4;
	$path_from_html = substr($elem,$tmp_pos-strlen($elem)+1,strrpos($elem,"/")-strlen($elem));
	$filename = substr($elem,strrpos($elem,"/")-strlen($elem)+1);

	exec("wget http://$ip/$path_from_html/$filename -O $destination/$filename");
    }
    //echo $xml->command;
}

if ($cmd=="scandir") {
    if (isset($_GET['mountpoint']))
	    $mountpoint = $_GET['mountpoint'];
    else
	    $mountpoint = '/var/html/CF';

    $fc = file_get_contents("http://$ip/camogmgui/camogm_interface.php?cmd=list&path=$mountpoint");

    PrintXML($fc);
}

function PrintXML($xml) {
	header("Content-Type: text/xml\n");
	header("Content-Length: ".strlen($xml)."\n");
	header("Pragma: no-cache\n");
	echo $xml;
}

?>