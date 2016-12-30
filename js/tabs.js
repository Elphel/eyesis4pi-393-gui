// TAB 1: begin
function tab1_init(mode){
  
    var tab1_contents = "";
  
    if (mode=="pc") {
      tab1_contents ='\
	  <div>\
	  <table>\
            <tr>\
              <td><b>Daemon</b></td>\
            </tr>\
	    <tr>\
	      <td><button id="launch" onclick="send_cmd(\'launch\')" >Start</button></td>\
	      <td><button id="die"    onclick="send_cmd(\'die\')"    >Stop</button></td>\
	      <td><button id="state"  onclick="send_cmd(\'state\')"  >State    </button></td>\
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
        <td><b>Footage</b></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >full path:</div></td>\
	  <td><div class="fixed_height" ><input id="footage_path" type="text" style="width:200px;" value="/data/footage" class="settings_paths" onchange="check_footage_path()"></div></td>\
	  <td><div id="footage_path_message"></div></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >subdir:&nbsp;</td>\
	  <td><div class="fixed_height" ><input id="footage_subfolder" type="text" style="width:200px;" value="20120412" class="settings_paths" onchange="update_log_name()"></div></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >file limit in subdir:&nbsp;</div></td>\
	  <td><div class="fixed_height" ><input id="footage_limit" type="text" style="width:100px;" value="1000" class="settings_paths"></div></td>\
      </tr>\
      <tr>\
	  <td><button onclick="set_recording_params()">Apply</button></td>\
      </tr>\
      </table>\
      <br/>\
      <table>\
      <tr>\
        <td><b>IMU log</b></td>\
      </tr>\
      <tr>\
	  <td><div class="fixed_height" >device <span style="font-size:12px;">(/dev/sda1)</span>:</div></td>\
	  <td><div class="fixed_height" ><input id="gpsimu_device_name" type="text" style="width:200px;" value="/dev/sda1" class="settings_paths"></div></td>\
	  <td></td>\
      </tr>\
      <tr>\
	  <td><button id="btn_fsgil" onclick="free_space_gps_imu_log()">Free space</button></td>\
	  <td><div id="cf_card_free_space"></div></td>\
      </tr>\
      <tr>\
	  <td colspan="1"><button id="btn_dl_logs" onclick="download_gps_imu_log()" title="Download imu logs to subdir">Download</button></td>\
      </tr>\
      <tr>\
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
// TAB 1: end

// TAB 2: begin
function white_balance_sliders_init(){  
  
    $( "#ae_radio" ).buttonset();
  
    $( "#radio" ).buttonset();

    $( "#red" ).slider({
	orientation: "horizontal",
	range: "min",
	min: 100,
	max: 1600,
	value: 282,
	slide: function( event, ui ) {
	    $("#red_gain").val(ui.value/100);
	    },
	change: set_red
    });

    $( "#green" ).slider({
	orientation: "horizontal",
	range: "min",
	min: 100,
	max: 1600,
	value: 200,
	slide: function( event, ui ) {
	    $("#green_gain").val(ui.value/100);
	    },
	change: set_green
    });

    $( "#blue" ).slider({
	orientation: "horizontal",
	range: "min",
	min: 100,
	max: 1600,
	value: 245,
	slide: function( event, ui ) {
	    $("#blue_gain").val(ui.value/100);
	    },
	change: set_blue
    });

    $("#red_gain").val($("#red" ).slider("values", 1)/100 );
    $("#green_gain").val($("#green" ).slider("values", 1)/100 );
    $("#blue_gain").val($("#blue" ).slider("values", 1)/100 );
}

function moveslider() {
    $("#red").slider( "value", 100*$("#red_gain").val());
    $("#green").slider( "value", 100*$("#green_gain").val());
    $("#blue").slider( "value", 100*$("#blue_gain").val());
}

function set_red(){set_gains("red");}
function set_green(){set_gains("green");}
function set_blue(){set_gains("blue");}

function set_default_gains(light) {
    if (light=="sunny") {
      $("#red_gain").val(2.82);
      $("#green_gain").val(2);
      $("#blue_gain").val(2.45);
      set_ae_window("all");
    }
    if (light=="cloudy") {
      $("#red_gain").val(2.82);
      $("#green_gain").val(2);
      $("#blue_gain").val(2.45);
      set_ae_window("center bot");
    }
    if (light=="fluorescent") {
      $("#red_gain").val(2.15);
      $("#green_gain").val(2);
      $("#blue_gain").val(3.82);
      set_ae_window("all");
    }

    moveslider();
    //set_gains();
}

function set_ae_window(mode){
  if      (mode=="all"){
    set_parameter(master_ip,'HISTWND_RLEFT'  ,65535,false);
    set_parameter(master_ip,'HISTWND_RTOP'   ,32768,false);
    set_parameter(master_ip,'HISTWND_RWIDTH' ,49152,false);
    set_parameter(master_ip,'HISTWND_RHEIGHT',65535,false);
  }else if(mode=="center top"){
    set_parameter(master_ip,'HISTWND_RLEFT'  ,    0,false);
    set_parameter(master_ip,'HISTWND_RTOP'   ,35967,false);
    set_parameter(master_ip,'HISTWND_RWIDTH' ,30265,false);
    set_parameter(master_ip,'HISTWND_RHEIGHT',19672,false);
  }else if(mode=="center bot"){
    set_parameter(master_ip,'HISTWND_RLEFT'  ,65536,false);
    set_parameter(master_ip,'HISTWND_RTOP'   ,36769,false);
    set_parameter(master_ip,'HISTWND_RWIDTH' ,30265,false);
    set_parameter(master_ip,'HISTWND_RHEIGHT',19672,false);
  }else if(mode=="top"){
    set_parameter(master_ip,'HISTWND_RLEFT'  ,65536,false);
    set_parameter(master_ip,'HISTWND_RTOP'   , 3700,false);
    set_parameter(master_ip,'HISTWND_RWIDTH' ,63000,false);
    set_parameter(master_ip,'HISTWND_RHEIGHT',16878,false);
  }else if(mode=="bot"){
    set_parameter(master_ip,'HISTWND_RLEFT'  ,65536,false);
    set_parameter(master_ip,'HISTWND_RTOP'   ,65536,false);
    set_parameter(master_ip,'HISTWND_RWIDTH' ,63000,false);
    set_parameter(master_ip,'HISTWND_RHEIGHT',16878,false);
  }
}

function set_gains(color) {
    console.log("set_gains('"+color+"')");
    if (color=="red"||color=="all") set_parameter(master_ip,'GAINR' ,Math.round(65536*$("#red_gain").val()),false); // *0x10000
    if (color=="green"||color=="all") {
      set_parameter(master_ip,'GAING' ,Math.round(65536*$("#green_gain").val()),false);
      set_parameter(master_ip,'GAINGB',Math.round(65536*$("#green_gain").val()),false);
    }
    if (color=="blue"||color=="all") set_parameter(master_ip,'GAINB' ,Math.round(65536*$("#blue_gain").val()),false);
    //setTimeout("refresh_images()",2000);
}
// TAB 2: end

// TAB 3: begin
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
  
  c += "<div style='padding:5px;'><b>Temperatures:</b></div><div id='temperatures_map'></div>";
    
  $("#tab3_contents").html(c);
}
// TAB 3: end

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
