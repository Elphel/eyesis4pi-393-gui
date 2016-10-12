<?php

if (isset($_GET['path'])) $path = $_GET['path'];
else                      $path = "/data/footage";

$writable = 0;

if (is_writable($path)) $writable = 1;

$res_xml = "<Document>\n";
$res_xml .= "\t<writable>".$writable."</writable>\n";
$res_xml .= "</Document>";

header("Content-Type: text/xml");
header("Content-Length: ".strlen($res_xml)."\n");
header("Pragma: no-cache\n");
printf("%s", $res_xml);
flush();

?>