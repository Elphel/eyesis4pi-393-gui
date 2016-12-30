<?php

rename_image($argv[1],$argv[2],$argv[3]);

function rename_image($path,$file,$index){
	//read exif & rename
	$ext = pathinfo("$path/$file", PATHINFO_EXTENSION);
	$exif_data = exif_read_data("$path/$file");
	//converting GMT a local time GMT+7
	$DateTimeOriginal_local=@strtotime($exif_data['DateTimeOriginal']);/*-25200;*/
	
        $tmp = explode("_",$exif_data['Model']);
        
        if (count($tmp)==2){
          $model = intval(trim($tmp[1]));
          $chn = intval($exif_data['PageNumber'])+1;
          if        ($model==1001) {
            $k=$chn;
          }else  if ($model==1002) {
            $k=$chn+4;
          }else  if ($model==1003) {
            $k=$chn+6;
          }
          $new_file_name = $DateTimeOriginal_local."_".$exif_data['SubSecTimeOriginal']."_$k.".$ext;
          rename("$path/$file","$path/$new_file_name");
	}
}

?>