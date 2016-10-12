<?php

rename_image($argv[1],$argv[2],$argv[3]);

function rename_image($path,$file,$index){
	//read exif & rename
	$ext = pathinfo("$path/$file", PATHINFO_EXTENSION);
	$exif_data = exif_read_data("$path/$file");
	//converting GMT a local time GMT+7
	$DateTimeOriginal_local=@strtotime($exif_data['DateTimeOriginal']);/*-25200;*/
	$new_file_name = $DateTimeOriginal_local."_".$exif_data['SubSecTimeOriginal']."_$index.".$ext;
	rename("$path/$file","$path/$new_file_name");
}

?>