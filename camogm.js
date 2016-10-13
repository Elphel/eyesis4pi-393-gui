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
  camogm_cmd("unmount",true);//replaced with sync
  clearInterval(intvl_hdd_free_space);
  clearInterval(intvl_camogm_status);
  intvl_hdd_free_space = false;
  intvl_camogm_status = false;
  green_the_bars();
}

function camogm_cmd(cmd,async,callback) {

    var url = "eyesis4pi_control.php?"+cmd+"&master_ip="+master_ip+"&n="+n+"&rec_delay="+camogm_rec_delay;
    
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
	table_html = "<tr>\n\t<td></td>\n\t<td align='center'>SSD free space</td>\n<td>&nbsp;&nbsp;Buffer (important when recording)</td></tr>";
        
	for (var i=0;i<cams.length;i++) {
	  table_html +=  "<tr>\n\t<td>channel "+(i+1)+"</td><td id='cam"+i+"_hdd' align='right'></td><td><div id='buffer"+i+"_sum' class='buffer'><div id='buffer"+i+"' style='width:200px;' class='buffer_free'>free</div></div></td></tr>";
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
      camogm_cmd("get_hdd_space&mount_point=/var/html/CF",true,camogm_parse_hdd_free_space);
      camogm_cmd("unmount",true);
}

function camogm_parse_hdd_free_space(data){
    var raw_data=0;
    var end = " KB";
    var random_color =  "rgba("+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+",1)";
    
    for (var i=0;i<n;i++) {
	raw_data = +$(data).find('cam'+(i+1)).find('hdd_free_space').text();
	end = " KB";
	for (var j=0;j<3;j++) {
	    raw_data = Math.round(10*raw_data/1024)/10;
	    if (j==1) end = " MB";
	    if (j==2) end = " GB";
	    
	    //emergency stop
	    if ((j==1)&&(raw_data<128)) {
	      status_message(false,"SSD: low free space");
	      camogm_rec_stop();
	    }
	    
	    if (raw_data<1024) break;
	}
	$("#cam"+(i+1)+"_hdd").html("<b style='color:"+random_color+";'>"+raw_data+end+"</b>");
    }
}

function camogm_status(async){
    camogm_cmd("status",async,camogm_parse_status);
}

function camogm_parse_status(data){
    var buf_free;
    var buf_used;
    var buf_sum;
    
    
    //$(data).find('cam')
    
    
    for (var i=0;i<cams.length;i++) {
        
	buf_free = +$(data).find('cam'+(i+1)).find('camogm_state').find('buffer_free').text();
	buf_used = +$(data).find('cam'+(i+1)).find('camogm_state').find('buffer_used').text();
	buf_sum = buf_free+buf_used;
	
	$("#buffer"+(i+1)).css({width:(Math.round(buf_free/buf_sum*$("#buffer"+(i+1)+"_sum").width()))+"px"});
    }    
    
    var state = "";
    for (var i=0;i<n;i++) {
	state = $(data).find('cam'+(i+1)).find('camogm_state').find('state').text();
	if (state!='"running"') break;
	state = "running";
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
    for (var i=0;i<n;i++) {
	tmp = $(data).find('cam'+(i+1)).find('camogm_state').text();
	if (tmp=="off") break;
    }
    
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
    for (var i=0;i<n;i++) {	
	$("#buffer"+(i+1)).css({width:$("#buffer"+(i+1)+"_sum").width()+"px"});
    }  
}

function camogm_launch_response(){
    console.log("camogm launch response");
    clearInterval(intvl_status);
    status_message(false,"camogm launched");
    camogm_cmd("mount",false);
    camogm_status(true);
    green_the_bars();
    camogm_get_hdd_free_space(true);
}