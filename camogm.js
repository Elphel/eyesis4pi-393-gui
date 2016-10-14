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
  if (!disable_intervals) intvl_camogm_status = setInterval("camogm_status(true)",10000);
  if (!disable_intervals) intvl_hdd_free_space = setInterval("camogm_get_hdd_free_space(false)",10000);
}

function camogm_rec_stop(){
  console.log("camogm: stop recording");
  camogm_cmd("stop",false);
  //camogm_cmd("unmount",true);//replaced with sync
  setTimeout("clearInterval(intvl_hdd_free_space)",10000);
  setTimeout("clearInterval(intvl_camogm_status)",10000);
  intvl_hdd_free_space = false;
  intvl_camogm_status = false;
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
	table_html = "<tr>\n\t<td align='center'>IP</td>\n\t<td align='center'>SSD free space</td>\n<td>channel</td><td>&nbsp;&nbsp;Buffer (important when recording)</td></tr>";
        
        var unique = get_unique_cams();
        var j = 0;
        
	for (var i=0;i<cams.length;i++) {
          
          if (unique.indexOf(cams[i])!=-1){
              tmpstr = cams[i].ip;
              hddid = "cam"+j+"_hdd";
              j++;
          }else{
              tmpstr = "";
              hddid = "";
          } 
          
	  table_html +=  "<tr>\n\t\
            <td>"+tmpstr+"</td>\
            <td id='"+hddid+"' align='right'></td>\
            <td align='center'>"+(i+1)+"</td>\
            <td><div id='buffer"+i+"_sum' class='buffer'><div id='buffer"+i+"' style='width:200px;' class='buffer_free'>free</div></div></td>\
            </tr>";
	}
	
    }
    $("#hdd_free_space").html(table_html);
    
}

function camogm_get_hdd_free_space(mount_en){
//     if (mount_en){
// 	//camogm_cmd("mount",false);
// 	camogm_cmd("get_hdd_space&mount_point=/var/html/CF",false,camogm_parse_hdd_free_space);
// 	//camogm_cmd("unmount",true);
//     }else{
// 	camogm_cmd("get_hdd_space&mount_point=/var/html/CF",true,camogm_parse_hdd_free_space);
//     }
      camogm_cmd("get_hdd_space&mount_point=/mnt/sda1",true,camogm_parse_hdd_free_space);
      //camogm_cmd("unmount",true);
}

function camogm_parse_hdd_free_space(data){
    var raw_data=0;
    var end = " KB";
    var random_color =  "rgba("+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+",1)";
    
    var i=0;
    $(data).find("hdd_free_space").each(function(){
        raw_data = +$(this).text();
        end = " KB";
	for (var j=0;j<3;j++) {
	    raw_data = Math.round(10*raw_data/1024)/10;
	    if (j==1) end = " MB";
	    if (j==2) end = " GB";
	    
            //IGNORE!
	    //emergency stop
// 	    if ((j==1)&&(raw_data<128)) {
// 	      status_message(false,"SSD: low free space");
// 	      camogm_rec_stop();
// 	    }
	    
	    if (raw_data<1024) break;
	}
	$("#cam"+(i)+"_hdd").html("<b style='color:"+random_color+";'>"+raw_data+end+"</b>");
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
    
    var i=0;
    $(data).find('camogm_state').each(function(){
        buf_free = +$(this).find("sensor_port_0").find('buffer_free').text();
        buf_used = +$(this).find("sensor_port_0").find('buffer_free').text();
        buf_sum  = buf_free+buf_used;
        //ignore
        //$("#buffer"+i).css({width:(Math.round(buf_free/buf_sum*$("#buffer"+i+"_sum").width()))+"px"});
        i++;
    });
    
    var state = "running";
    
    $(data).find('camogm_state').each(function(){
        tmp_state = $(this).find('state').text();
        if (tmp_state!='"running"') state = tmp_state;
    });
    
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
	    camogm_get_hdd_free_space(false);
	    intvl_hdd_free_space = setInterval("camogm_get_hdd_free_space(false)",10000);
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
	camogm_get_hdd_free_space(true);
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
    camogm_get_hdd_free_space(true);
}