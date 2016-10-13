<?php
/*!***************************************************************************
*! FILE NAME  : eyesis4pi_controls.php
*! DESCRIPTION: change the settings of the 8 eyesis4pi cameras
*! Copyright (C) 2012 Elphel, Inc
*! -----------------------------------------------------------------------------**
*!  This program is free software: you can redistribute it and/or modify
*!  it under the terms of the GNU General Public License as published by
*!  the Free Software Foundation, either version 3 of the License, or
*!  (at your option) any later version.
*!
*!  This program is distributed in the hope that it will be useful,
*!  but WITHOUT ANY WARRANTY; without even the implied warranty of
*!  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*!  GNU General Public License for more details.
*!
*!  The four essential freedoms with GNU GPL software:
*!  * the freedom to run the program for any purpose
*!  * the freedom to study how the program works and change it to make it do what you wish
*!  * the freedom to redistribute copies so you can help your neighbor
*!  * the freedom to distribute copies of your modified versions to others
*!
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*! -----------------------------------------------------------------------------**
*!  $Log: eyesis4pi_controls.php,v $
*/

// Check location - should be launched on the PC websrver
$elp_const=get_defined_constants(true);


if (isset($elp_const["elphel"])) {
  $fp = fopen($_SERVER['SCRIPT_FILENAME'], 'rb');
  fseek($fp, 0, SEEK_END);  /// file pointer at the end of the file (to find the file size)
  $fsize = ftell($fp);      /// get file size
  fseek($fp, 0, SEEK_SET);  /// rewind to the start of the file
  /// send the headers
  header("Content-Type: application/x-php");
  header("Content-Length: ".$fsize."\n");
  fpassthru($fp);           /// send the script (this file) itself
  fclose($fp);
  exit (0);
}

//defaults
$res_xml = "";

// keys assign
$cams = array();
if (isset($_GET['rq'])){
  $pars = explode(",",$_GET['rq']);
  foreach($pars as $val){
    $ip = strtok($val,":");
    $channel = strtok(":");
    array_push($cams,array('ip'=>$ip,'channel'=>$channel));
  }
}

if (true) {
  $res_xml = "<Document>\n";
  for ($i=0;$i<count($cams);$i++) {
  
    $res_xml .= "\t<cam>\n";
    
    for ($j=0;$j<4;$j++) {    
      $error=0;
      $flag=1;

      if ($fp = @simplexml_load_file("http://{$cams[$i]['ip']}/i2c.php?cmd=fromEEPROM{$cams[$i]['channel']}&EEPROM_chn=$chn")) {
        if (isset($fp->error)) {
            $flag = 0;
        }
      }else{
          //double checking
          if ($fp = @simplexml_load_file("http://{$cams[$i]['ip']}/i2c.php?cmd=fromEEPROM{$cams[$i]['channel']}&EEPROM_chn=$chn")) {
              if (isset($fp->error)) {
                  $flag = 0;
              }
          }else{
              $error = 1;
          }
      }
            
      if (!$error) {
          $res_xml .= "\t\t<chn$j>$flag</chn$j>\n";
      }else{
          $res_xml .= "\t\t<error>$error</error>\n";
      }

      if ($j==0){
        if (isset($fp->model)){
          if ($fp->model=="10338") break;
        }
      }
      
      if ($error) break;
    }
    $res_xml .= "\t</cam>\n";
    }
    $res_xml .= "</Document>";

  header("Content-Type: text/xml");
  header("Content-Length: ".strlen($res_xml)."\n");
  header("Pragma: no-cache\n");
  printf("%s", $res_xml);
  flush();
}
?>