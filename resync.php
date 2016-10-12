#!/usr/bin/php -q
<?php

if (isset($_GET['n'])) $n = $_GET['n'];
else                   $n = 9;

//no need to sync the master camera to itself
$out = "<pre>";
for ($i=222;$i<(221+$n);$i++) {
  $out .= trim(file_get_contents("http://192.168.0.221/sync_other2this.php?ip=192.168.0.$i"))."\n";  
}
echo $out;

?>