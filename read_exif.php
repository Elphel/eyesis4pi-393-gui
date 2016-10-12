<?php

$file = $_GET['file'];

echo "<pre>";

print_r(exif_read_data($file));

?>