<?php

if (isset($_GET['path'])) $path = $_GET['path'];
else                      $path = "/";

echo disk_free_space($path);

?>