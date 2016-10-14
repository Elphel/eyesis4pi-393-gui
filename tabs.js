function tab1_init(mode){
  
    var tab1_contents = "";
  
    if (mode=="pc") {
      tab1_contents ='\
	  <div>\
	  <table>\
	    <tr>\
	      <td><button id="launch" onclick="send_cmd(\'launch\')" >Launch Daemon</button></td>\
	      <td><button id="die"    onclick="send_cmd(\'die\')"    >Kill Daemon  </button></td>\
	      <td><button id="state"  onclick="send_cmd(\'state\')"  >Get state    </button></td>\
	      <!--<button id="check"    onclick="send_cmd(\'check\')"    >Check  </button>-->\
	    </tr>\
	  </table>\
	  <br/>\
	  <div style="font-size:0.8em">\
	    Daemon state: <b id="daemon_state"></b>\
	  </div>\
      </div>\
      <br/>\
      <table>\
      <tr>\
	  <td><div class="fixed_height" >Absolute footage path:</div></td>\
	  <td><div class="fixed_height" ><input id="footage_path" type="text" style="width:200px;" value="/data/footage" class="settings_paths" onchange="check_footage_path()"></div></td>\
	  <td><div id="footage_path_message"></div></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >Series subfolder:&nbsp;</td>\
	  <td><div class="fixed_height" ><input id="footage_subfolder" type="text" style="width:200px;" value="20120412" class="settings_paths" onchange="update_log_name()"></div></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >Files limit in a subsubfolder:&nbsp;</div></td>\
	  <td><div class="fixed_height" ><input id="footage_limit" type="text" style="width:100px;" value="1000" class="settings_paths"></div></td>\
      </tr>\
      <tr>\
	  <td><button onclick="set_recording_params()">Apply</button></td>\
      </tr>\
      </table>\
      <br/>\
      <table>\
      <tr>\
	  <td><div class="fixed_height" >Device name <span style="font-size:12px;">(/dev/hda1,&nbsp;/dev/hdb1)</span>:</div></td>\
	  <td><div class="fixed_height" ><input id="gpsimu_device_name" type="text" style="width:200px;" value="/dev/hda1" class="settings_paths"></div></td>\
	  <td>\
	      <button id="btn_cf_mount" onclick="cf_mount()">Mount</button>\
	      <button id="btn_cf_unmount" onclick="cf_unmount()">Unmount</button>\
	  </td>\
      </tr>\
      <tr>\
	  <td><button id="btn_fsgil" onclick="free_space_gps_imu_log()">Device free space</button></td>\
	  <td><div id="cf_card_free_space"></div></td>\
      </tr>\
      <tr>\
	  <td colspan="2"><button id="btn_dl_logs" onclick="download_gps_imu_log()">Download contents to the absolute footage path</button></td>\
	  <td>\
	      <button id="btn_clean_cd" onclick="clean_cf_card()">Clean</button>\
	  </td>\
      </tr>\
      <tr>\
	  <!--<td><button onclick="update_cf_index()">update</button></td>-->\
	  <td colspan="3">\
	      <div id="cf_status">&nbsp;</div>\
	  </td>\
      </tr>\
      </table>';
    }else if (mode=="camogm") {
      tab1_contents ='\
      <input id="footage_path" type="text" style="width:200px;display:none;" value="/data/footage" class="settings_paths" onchange="check_footage_path()">\
      <input id="footage_subfolder" type="text" style="width:200px;display:none;" value="20120412" class="settings_paths" onchange="update_log_name()">\
      <input id="footage_limit" type="text" style="width:100px;display:none;" value="1000" class="settings_paths">\
      <input id="gpsimu_device_name" type="text" style="width:200px;display:none;" value="/dev/hda1" class="settings_paths">';      
    }
    
    $("#tab1_contents_").html(tab1_contents);
    getSettings(settings_file,'paths');
}

function tab3_init(){
  var c = "<table>\n";
  var tmp = "";
  
  for (var i=0;i<cams.length;i++) {
      //reset tmp
      tmp  = "<tr>\n";
      tmp += "\t<td><div class='fixed_height'>Channel "+(i+1)+"</div></td>";
      tmp += "\t<td><div class='fixed_height'><input id='address_field"+i+"' type='text' style='width:150px;' value='"+(cams[i].ip)+"' disabled><input id='address_field_chn"+i+"' type='text' style='width:150px;' value='"+(cams[i].channel)+"' disabled></div></td>\n";
      tmp += "\t<td><div id='cam"+i+"_parameters'></div></td>\n";
      c += tmp;
  }
  c += "</table>";
  
  c += "<div style='padding:5px;'>Temperatures map:</div><div id='temperatures_map'></div>";
    
  $("#tab3_contents").html(c);
  
}

function previews_init(){
  
  console.log("number of previews is "+cams.length);
  
  var c = $("#previews").html();
  var hist_front = "";
  
  c += "<div style='padding:2px 5px 2px 5px;width:310px;'><button id='btn_refresh' onclick='refresh_previews()' >refresh</button>&nbsp;(disabled while recording)</div>\n<table id='prevs_images' >\n";
  
  c +="<tr valign=top>\n";
  for (var i=0;i<cams.length;i++) {
      c += "<td><img id='cam"+i+"_hist' class='histograms' width='150' height='75'></td>";
      hist_front += "<td style='padding:0px;'><img id='cam"+i+"_hist_front' class='histograms' width='70' height='35'></td>";
  }
  c +="</tr>\n<tr valign=top>\n";
  for (var i=0;i<cams.length;i++) {
      c += "<td><canvas id='cam"+i+"_canvas' class='prevs'></canvas></td>";
  }
  c +="</tr>\n<tr valign=top>\n";
  for (var i=0;i<cams.length;i++) {
      var extra = "";
      //if (i==9) extra = " (stereo)";
      c += "<td align='center'>"+(i+1)+extra+"</td>";
  }
  c += "</tr></table>";
  //draw a close window cross
  c += "<div style='position:absolute;top:3px;right:3px;'><button id='close_previews' onclick='close_previews()'><img id='close_previews_cross' src='pictures/cross_white.gif' style='width:8px;height:8px;' /></button></div>";
  
  $("#previews").html(c);
  $("#histograms_front").html("<table><tr>"+hist_front+"</tr></table>");
  
}