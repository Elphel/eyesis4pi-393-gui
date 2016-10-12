<?php

//echo "<pre>";
//echo update_subsubdir("footage/folder2",0,0);

function check_subdir($path,$subdir){
    if (is_dir("$path")) {
	if (is_writable("$path")) {
	    if (is_dir("$path/$subdir")) {
		if (is_writable("$path/$subdir")) 
		    return 0;
		else
		    return -2;
	    }else{
		$old = umask(0);
		mkdir("$path/$subdir",0777);
		umask($old);

		if (!is_dir("$path/$subdir")) return -3;
		else                          return 0;
	    }
	}
    }else{
	return -1;
    }
}

function update_subsubdir($path,$index,$limit,$index_max=100000){
    if ($index<=$index_max) {
      if (!is_dir("$path/$index")) {
// 	if (!@mkdir("$path/$index",0777)) return -2;
// 	else                              return $index;
	$old = umask(0);
	if (!@mkdir("$path/$index",0777)) return -2;
	umask($old);
	return $index;
      }else{
	$files = scandir("$path/$index");
	if (count($files)>=$limit+2) return update_subsubdir($path,$index+1,$limit);
	else                       return $index;
      }
    }else{
      return -1;
    }
}

function get_free_space($path){
    return disk_free_space($path);
}

?>