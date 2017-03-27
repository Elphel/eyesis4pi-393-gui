function camogm_launch(init){

  if (init) camogm_create_table();
  camogm_cmd("run_camogm",true,camogm_launch_response);
  intvl_status = setInterval("status_message(true,'Launching camogm')",1000);
  console.log("camogm launch");
  
  //actions
//   if (camogm_en) {
//   }else{
//       clearInterval(intvl_camogm_status);
//       clearInterval(intvl_hdd_free_space);
//   }
}

function camogm_exit(){
  console.log("camogm exit");
  camogm_cmd("exit",true);
}

function camogm_rec_start(){
  console.log("camogm: begin recording");
  //camogm_cmd("mount",false);
  camogm_cmd("start",true);
  if (!disable_intervals) intvl_camogm_status = setInterval("camogm_status(true)",5000);
  if (!disable_intervals) intvl_hdd_free_space = setInterval("camogm_get_ssd_free_space(false)",5000);
}

function camogm_rec_stop(){
  console.log("camogm: stop recording");
  camogm_cmd("stop",false);
  //camogm_cmd("unmount",true);//replaced with sync
  setTimeout(function(){
    clearInterval(intvl_hdd_free_space);
    intvl_hdd_free_space = false;
  },10000);
  setTimeout(function(){
    clearInterval(intvl_camogm_status);
    intvl_camogm_status = false;
  },10000);
  green_the_bars();
}

function camogm_cmd(cmd,async,callback) {

    var rq_str = "rq="+get_unique_rq_str();
    
    var url = "eyesis4pi_control.php?"+cmd+"&"+rq_str+"&rec_delay="+camogm_rec_delay;
    
    $.ajax({
      url: url,
      async: async,
      success: function(data){
	//$("#status").html(data);
	if (typeof callback != 'undefined') callback(data);
      }
    }); 
    
}

function camogm_create_table(){
    var table_html = "";
    
    if (camogm_en) {
	table_html = "<tr>\n\t<td align='center'>IP</td>\n\t<td colspan='2' align='center'>SSD free space</td>\n<td>channel</td><td>&nbsp;&nbsp;Buffer (important when recording)</td><td>Errors</td></tr>";
        //table_html += "<tr><td></td><td align='center' style='font-size:0.8em;'>sda1</td><td align='center' style='font-size:0.8em;'>sda2</td></tr>";
        
        var unique = get_unique_cams();
        var j = 0;
        
	for (var i=0;i<cams.length;i++) {
          
          if (unique.indexOf(cams[i])!=-1){
              tmpstr = cams[i].ip;
              ssdid1 = "cam"+j+"_sda1";
              ssdid2 = "cam"+j+"_sda2";
              j++;
          }else{
              tmpstr = "";
              ssdid1 = "";
              ssdid2 = "";
          } 
          
          camogm_err = "camogm_error_"+i;
          
	  table_html +=  "<tr>\n\t\
            <td>"+tmpstr+"</td>\
            <td id='"+ssdid1+"' align='right'></td>\
            <td id='"+ssdid2+"' align='right'></td>\
            <td align='center'>"+(i+1)+"</td>\
            <td><div id='buffer"+i+"_sum' class='buffer'><div id='buffer"+i+"' style='width:200px;' class='buffer_free'>free</div></div></td>\
            <td align='left'><div id='"+camogm_err+"'></div></td>\
            </tr>";
	}
    }
    $("#ssd_free_space").html(table_html);
    
}

function camogm_get_ssd_free_space(mount_en){
//     if (mount_en){
// 	//camogm_cmd("mount",false);
// 	camogm_cmd("get_hdd_space&mount_point=/var/html/CF",false,camogm_parse_hdd_free_space);
// 	//camogm_cmd("unmount",true);
//     }else{
// 	camogm_cmd("get_hdd_space&mount_point=/var/html/CF",true,camogm_parse_hdd_free_space);
//     }
      camogm_cmd("get_free_space&mount_point=/mnt/sda1",true,camogm_parse_hdd_free_space);
      //camogm_cmd("unmount",true);
}

function camogm_parse_hdd_free_space(data){
    var raw_data=0;
    var random_color =  "rgba("+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+",1)";
    
    var i=0;
    $(data).find("result").each(function(){
        raw_data = $(this).text();
        raw_data = raw_data.replace(/"/gm,'');
        data_arr = raw_data.split(" ");
        if (data_arr.length==2){
          $("#cam"+(i)+"_sda1").html("<b style='color:"+random_color+";'>&nbsp;"+data_arr[0]+" </b>");
          $("#cam"+(i)+"_sda2").html("<b style='color:"+random_color+";'>&nbsp;"+data_arr[1]+" </b>");
        }
        i++;
    });
}

function camogm_status(async){
    camogm_cmd("status",async,camogm_parse_status);
}

function camogm_parse_status(data){
    var buf_free;
    var buf_used;
    var buf_sum;
    
    //state
    var state = "running";
    $(data).find('camogm_state').each(function(){
        tmp_state = $(this).find('state').text();
        if (tmp_state!='"running"') state = tmp_state;
    });
    
    
    var camogm_states = $(data).find('camogm_state');
    
    /*
    var unique_cams = get_unique_cams();
    
    for(var i=0;i<unique_cams.length;i++){
      ucam_index = get_unique_cams_index(unique_cams[i]);
      last_error = $(camogm_states[i]).find("last_error_code").text();
      console.log("index: "+i+" last_error="+last_error);
      if (last_error!=0){
        $("#camogm_error_"+i).append($("<span style='color:red;'>"+last_error+",&nbsp</span>"));
      }
    }
    */
    
    for(var i=0;i<cams.length;i++){
      ucam_index = get_unique_cams_index(cams[i]);
      cam_port = cams[i].channel;
      buf_free = $(camogm_states[ucam_index]).find("sensor_port_"+cam_port).find("buffer_free").text();
      buf_used = $(camogm_states[ucam_index]).find("sensor_port_"+cam_port).find("buffer_used").text();

      buf_free = parseInt(buf_free);
      buf_used = parseInt(buf_used);

      if ((buf_used==-1)||(state=="\"stopped\"")) {
        buf_used = 0;
      }

      buf_sum  = +buf_free+buf_used;

      $("#buffer"+i).css({width:(Math.round(buf_free/buf_sum*$("#buffer"+i+"_sum").width()))+"px"});
    }
    
    for(var i=0;i<cams.length;i++){
      ucam_index = get_unique_cams_index(cams[i]);
      cam_port = cams[i].channel;
      
      var tmp_xml = $(camogm_states[ucam_index]).find("sensor_port_"+cam_port);
      
      if (tmp_xml.length!=0){
        var errors = Array(
          parseInt($(tmp_xml).find("frame_not_ready").text()),
          parseInt($(tmp_xml).find("frame_invalid").text()),
          parseInt($(tmp_xml).find("frame_nextfile").text()),
          parseInt($(tmp_xml).find("frame_changed").text()),
          parseInt($(tmp_xml).find("frame_broken").text()),
          parseInt($(tmp_xml).find("frame_file_err").text()),
          parseInt($(tmp_xml).find("frame_malloc").text()),
          parseInt($(tmp_xml).find("frame_too_early").text()),
          parseInt($(tmp_xml).find("frame_other").text()),
          parseInt($(tmp_xml).find("frame_nospace").text())     
        );
        
        //not errors
        errors[0] = 0;
        errors[3] = 0;
        
        var camogm_error = "";
        
        for(var j=0;j<errors.length;j++){
          if (errors[j]!=0) camogm_error += "err"+(j+1)+"("+errors[j]+"),&nbsp";
        }
        
        $("#camogm_error_"+i).html($("<span style='color:red;'>"+camogm_error+"</span>"));
      }
    }
    
    if (camogm_en) {
	//status_update(state);
	$("#status").html(state);
    }
    if (update_state_en) {
	if (state=="running") {
	  restore_parameters_en = false;
	  if (!disable_intervals&&!intvl_camogm_status){
	    camogm_status(true);
	    intvl_camogm_status = setInterval("camogm_status(true)",10000);
	  }
	  if (!disable_intervals&&!intvl_hdd_free_space){
	    camogm_get_ssd_free_space(false);
	    intvl_hdd_free_space = setInterval("camogm_get_ssd_free_space(false)",10000);
	  }
	}
	if (restore_parameters_en) restore_parameters();
	status_update(state);
	console.log("camogm state: "+state);
    }
}

function camogm_parse_state(data){
    var tmp;
    $(data).find("camogm_state").each(function(){
        if ($(this).text()=="off") tmp = $(this).text();
    });
    
    if (tmp!="off") {
	camogm_create_table();
	camogm_status(true);
	camogm_cmd("mount",false);
	green_the_bars();
	camogm_get_ssd_free_space(true);
    }else{
	camogm_launch(true);
    }
}

function green_the_bars() {
    for (var i=0;i<cams.length;i++) {	
	$("#buffer"+i).css({width:$("#buffer"+i+"_sum").width()+"px"});
    }  
}

function camogm_launch_response(){
    console.log("camogm launch response");
    clearInterval(intvl_status);
    status_message(false,"camogm launched");
    //camogm_cmd("mount",false);
    camogm_status(true);
    green_the_bars();
    camogm_get_ssd_free_space(true);
}