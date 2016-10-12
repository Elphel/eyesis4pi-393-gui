<?php

if (isset($_GET['file'])) $file = $_GET['file'];
else die("-1");
                     
if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
else die("-2");

//if (($file!="settings.xml")&&($file!="settings_default.xml")) die("-3");
if (substr($file,-4)!=".xml") die(-3);

if      ($cmd=="save") {
    file_put_contents($file,file_get_contents("php://input"));
}elseif ($cmd=="read") {
    $content = file_get_contents($file);
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($content)."\n");
    header("Pragma: no-cache\n");
    echo $content;
}

?>