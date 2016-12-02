<?php

function get_cams($str){
  $cams = array();
  $pars = explode(",",$_GET['rq']);
  foreach($pars as $val){
    $ip = strtok($val,":");
    $port = strtok(":");
    $channel = strtok(":");
    $master = strtok(":");
    $logger = strtok(":");
    array_push($cams,array('ip'=>$ip,'port'=>$port,'channel'=>$channel,'master'=>$master,'logger'=>$logger));
  }
  return $cams;
}

function get_master($cams){
  foreach($cams as $cam){
    if ($cam['master']=="1") return $cam;
  }
  return array();
}

function get_logger($cams){
  foreach($cams as $cam){
    if ($cam['logger']=="1") return $cam;
  }
  return array();
}

function get_unique_cams($cams){
  $ress = array();
  foreach($cams as $cam){
    $found = false;
    foreach($ress as $res){
      if ($cam['ip']==$res['ip']) $found = true;
    }
    if (!$found) array_push($ress,$cam);
  }
  return $ress;
}

function cams_to_str($cams){
  $str = "";
  foreach($cams as $cam){
    $str = implode(":",$cam).",";
  }
  return trim($str,",");
}

?>
