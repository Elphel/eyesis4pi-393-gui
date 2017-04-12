//debug
disable_intervals = false;

//global vars
var free_space_interval = false;
var master_ip = "161";

var settings_file = "settings.xml";

var daemon_restart_en = true;

var interval_time = 5000;

var intvl_temperatures;
var intvl_histograms;
var intvl_camogm_status;
var intvl_hdd_free_space;
var intvl_status;

var n = 3;
var np = 10;
var mask = "0x1ff";

var camogm_en = true;

// TODO: enable logger
var imu_logger_en = true;
//var imu_logger_en = false;

// systems
var eyesis4pi_en = true;
var triclops_en = false;
var phg21_en = false;

//updated once on page reload
var update_state_en = true;
var restore_parameters_en = true;

var pc_footage_path = "";
var pc_footage_subfolder = "";
var pc_footage_limit = 3000;
var pc_gps_imu_device_name = "/dev/sda1";

// TODO: reduce?
var camogm_rec_delay = 1;

var cams = [
  {"ip":"192.168.0.161","port":2326,"channel":3,"master":0,"logger":0},
  {"ip":"192.168.0.161","port":2325,"channel":2,"master":0,"logger":0},
  {"ip":"192.168.0.161","port":2323,"channel":0,"master":0,"logger":1},
  {"ip":"192.168.0.161","port":2324,"channel":1,"master":0,"logger":0},
  {"ip":"192.168.0.162","port":2326,"channel":3,"master":0,"logger":0},
  {"ip":"192.168.0.162","port":2325,"channel":2,"master":0,"logger":0},
  {"ip":"192.168.0.162","port":2323,"channel":0,"master":0,"logger":0},
  {"ip":"192.168.0.162","port":2324,"channel":1,"master":0,"logger":0},
  {"ip":"192.168.0.163","port":2325,"channel":2,"master":1,"logger":0},
  {"ip":"192.168.0.163","port":2326,"channel":3,"master":0,"logger":0}
];

// for PC recording
function check_footage_path(){
    $.ajax({
      url: "rights.php?path="+$("#footage_path").val(),
      async: false,
      success: function(response){
	check_footage_path_response(response);
      },
      contentType: "text/xml; charset=\"utf-8\""
    });
}

// for PC recording (response)
function check_footage_path_response(text){
    var data = $(text).find("Document");
    var writable = data.find("writable").text();
    
    if (writable=="0") $("#footage_path_message").html("<font color='red'>not writable</font>");
    else               $("#footage_path_message").html("");
}

// INIT
function init(){
    console.log("init()");
    
    ////parseURL();
    
    //getSettings('settings.xml','pars');
    getSettings(settings_file,'all');
    
    // TAB 1 init
    if (camogm_en) tab1_init("camogm");
    else           tab1_init("pc");
  
    // TAB 2 init
    //No need - it's already in index.html
    //init sliders here
    white_balance_sliders_init();
    
    // TAB 3 init
    tab3_init();
        
    // Select default TAB 1
    select_tab(1);
    
    ////rewriteURL();
    
    // for PC
    get_free_space("/data/footage");
    
    console.log("previews_init()");
    
    previews_init();
    // init hidden canvases
    for(var i=0;i<cams.length;i++){
      append_hidden_div(i);
    }
    
    
    init_temperatures_table();
    
  
    //apply parameters
    if (!disable_intervals) intvl_temperatures = setInterval("read_temperatures()",60000);
    if (!disable_intervals) intvl_histograms = setInterval("refresh_histograms()",interval_time);
    refresh_histograms();
    refresh_images();
   
    send_cmd('state');
    
    if (camogm_en) {
      update_state_en = true;
      camogm_cmd("run_status",false,camogm_parse_state);
    }
    //master_ip = $("#address_field1").val().substr(-3,3);
    var tmp = cams[get_master_index()].ip;
    master_ip = tmp.substr(-3,3);
    
    for (var i=0;i<cams.length;i++) {
        var param_string="/parsedit.php?title=Parameters&sensor_port="+cams[i].channel+"&COLOR&AUTOEXP_ON&EXPOS&AUTOEXP_EXP_MAX&AEXP_LEVEL&AEXP_FRACPIX&QUALITY&CORING_INDEX&MULTI_MODE&MULTI_SELECTED&MULTI_FLIPH&MULTI_FLIPV&TRIG&TRIG_PERIOD&HISTWND_RLEFT&HISTWND_RTOP&HISTWND_RWIDTH&HISTWND_RHEIGHT&HDR_DUR&HDR_VEXPOS&EXP_AHEAD'>Parameters page</a>&nbsp";
        $("#cam"+i+"_parameters").html("&nbsp<a href='http://"+(cams[i].ip)+param_string);
    }
    
    $("#input_skip_frames").attr('title',"Lower 8-bits set the mask, where 1=enabled, 0=disabled (the sequence period is 8 frames). For example, to skip every second frame apply 0x155");
    $("#input_hdrvexpos").attr('title',"Second exposure setting in alternating frames HDR mode. if it is less than 0x10000 - number of lines of exposure, >=10000 - relative to 'normal' exposure");
    $("#input_autoexp_max").attr('title',"Maximum exposure time allowed to autoexposure daemon  (in milliseconds)");
    $("#input_autoexp_lvl").attr('title',"Target output level, 0-255");
    $("#input_autoexp_fracpix").attr('title',"Fraction of all pixels in the exposure wondow that should be below AutoExp_Level");
    $("#input_autoexp_frames_ahead").attr('title',"Number of frames ahead of the current frame write exposure to the sensor");
    
    $("#input_trigger_period").change(function(){$("#chk_trigger_period").attr('checked',true);});
    $("#input_skip_frames").change(function(){$("#chk_skip_frames").attr('checked',true);});
    $("#input_hdrvexpos").change(function(){$("#chk_hdrvexpos").attr('checked',true);});
    $("#input_autoexp_max").change(function(){$("#chk_autoexp_max").attr('checked',true);});
    $("#input_autoexp_lvl").change(function(){$("#chk_autoexp_lvl").attr('checked',true);});
    $("#input_autoexp_fracpix").change(function(){$("#chk_autoexp_fracpix").attr('checked',true);});
    $("#input_autoexp_frames_ahead").change(function(){$("#chk_autoexp_frames_ahead").attr('checked',true);});
    
    $(".window").draggable({handle:".window_handle"});
    
    $(".window").each(function(){
	$(this).mousedown(function(){
	    $(".window").each(function(){
		$(this).css({'z-index':1});
	    });
	    $(this).css({'z-index':2});
	});
    });
    
    //setTimeout("refresh_images()",1000);

    //update_cf_index();
    //master_ip_change_init();
    
    //single shots init
    $("#single_shots_div").attr("href","single.html?rq="+cams_to_str()+"&mode=5"+"&period="+($("#input_trigger_period").val()*100000));
    
    $("#system_tests_div").attr("href","tests.html?master_ip="+master_ip+"&n="+n);
    
    //resync();
}

function status_update(status) {
    var state_str = "running";
    
    if (!free_space_interval&&camogm_en) {
        free_space_interval = setInterval("check_status()",interval_time);
    }else{
	clearInterval(free_space_interval);
	free_space_interval = false;
    }
    
    if (status=="running") {
	$("#stop").attr('disabled', false);
	$("#rec").attr('disabled', true);
	$("#btn_refresh").attr('disabled', true);
    }else{
	$("#stop").attr('disabled', true);
	$("#rec").attr('disabled', false);
	$("#btn_refresh").attr('disabled', false);
    }
    update_state_en = false;
}

function get_dl_period(){
//    var period = $("#input_trigger_period").val();
//    var mask = $("#input_skip_frames").val();   
// 
//    mask = +mask & 0xff;
//    
//    var tmp = 0;
//    var d = 0;
//    var min = 9;
//    var circ1 = false;
//    var circ2 = false;
//    
//    var circ_d = 0;
//    
//    for (var i=0;i<8;i++){
//       tmp = mask & (0x80>>i);
//       if (tmp!=0) {
// 	if (i==7) {
// 	    circ1 = false;
// 	    circ2 = false;
// 	    if (circ_d<min) min = circ_d;
// 	}
// 	if (d<min) { 
// 	    if (!circ2) min = d;
// 	    
// 	    if (circ1) {
// 		if (circ2) circ_d = d;
// 		circ2 = false;
// 	    }
// 	}
// 	d=0;
//       }else{
// 	if (i==0) {
// 	    circ1 = true;
// 	    circ2 = true;
// 	}
// 	d++;
//       }
//       console.log(i+" "+tmp+" "+d+" "+min+" "+circ_d);
//    }
//    if (circ1 && ((d+circ_d)<min)) min = d+circ_d;
//    if (min==9) min = 0;
//    
//    period = Math.round(period/(min+1));
//    console.log("The Periodus is "+period);
//    
//    //set cams period
   mask = $("#input_skip_frames").val();
   
   return $("#input_trigger_period").val();
}

function send_cmd(cmd){
	var download_interval = get_dl_period();
	
	//alert("DL Period is: "+download_interval);
      
	if (cmd=="stop") {
	    if (camogm_en) {
		camogm_rec_stop();
	    }
	    if (imu_logger_en) {
	      stop_gps_imu_log();
	      update_cf_index();
	    }
	    clearInterval(free_space_interval);
	    free_space_interval = false;
	}
	if (cmd=="start") {
	  
	    //set the parameters
	    //set_skip_frames_mask();
	    //set_hdr_vexpos();
	    //set_autoexp_max();
	    //set_autoexp_level();
	    //set_autoexp_fracpix();
	    //set_autoexp_ahead();
	    //set_trigger_period();
	    
	    save_settings();
	    //launch the logger
	    if (imu_logger_en) start_gps_imu_log();
	    if (camogm_en) camogm_rec_start();
	    else {
	      console.log("free_space_interval = "+free_space_interval);
	      if (!free_space_interval) {
		  free_space_interval = setInterval("check_status()",interval_time);
	      }
	    }
	}
	
	if (cmd=="die") daemon_restart_en = false;
	
	if (cmd=="launch") {
	    daemon_restart_en = true;
	}
	
	if (camogm_en&&(cmd!="state")&&(cmd!="launch")) {
	    //status_update();
	    //var status = camogm_status();
	    //$("#status").html(status);
	    //status_update(status);
	}else{
	    console.log("Trigger interval is "+download_interval);
	    $.ajax({
	      url: "client.php?cmd="+cmd+"&rq="+cams_to_str()+"&interval="+download_interval+"&mask="+mask,
	      success: function(data){
		$("#status").html(data);
		$("#daemon_state").html(data);
		if (update_state_en) {
		    status_update(data.substring(0,data.length-3));
		    console.log("daemon status: "+data.substring(0,data.length-3));
		    if (data.substring(0,data.length-3)=="running") {
		      $("#rec_mode").attr("checked",true);
		      if (restore_parameters_en) rec_mode(false);
		      restore_parameters_en = false;
		    }
		}
		if ((data.indexOf("Connection refused")!=-1)&&daemon_restart_en) {
		  send_cmd("launch");
		  update_state_en = true;
		}
	      },
	      async: false
	    });
	}
}

function settings_activate() {
    if (!$("#settings").is(":visible")) {
	$("#settings").css({top:'50px',left:'10px','z-index':3}).fadeToggle(300,function(){
	    $(this).toggleClass("window");
	    $(".window").each(function(){
		    $(this).css({'z-index':1});
	    });
	    $(this).toggleClass("window");
	    $(this).css({'z-index':2});
	});
    }else{
	$("#settings").fadeToggle(300);
    }
}

function previews_activate() {
    if (!$("#previews").is(":visible")) {
	$("#previews").css({top:'50px',left:'10px','z-index':3}).fadeToggle(300,function(){
	    $(this).toggleClass("window");
	    $(".window").each(function(){
		    $(this).css({'z-index':1});
	    });
	    $(this).toggleClass("window");
	    $(this).css({'z-index':2});
	});
    }else{
	$("#previews").fadeToggle(300);
    }
}

function check_status(){
    get_free_space('/data/footage');
    send_cmd('state');
}

function get_free_space(path){
  $.ajax({
    url: "free_space.php?path="+path,
    success: function(data){
      var end = "KB";
      for (var i=0;i<3;i++) {
	  data = Math.round(10*data/1024)/10;
	  
	  if (i==1) end = "MB";
	  if (i==2) end = "GB";
	  
	  if (data<1024) break;
      }
      
      $("#free_space").html(data+" "+end);
      $("#free_space").css({color:"rgba("+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+","+Math.floor(Math.random()*128)+",1)"});
    },
    async: false
  });  
}

function refresh_previews(){
  refresh_histograms();
  refresh_images();
}

// set parameters
function apply_parameters(){
  if ($("#chk_trigger_period").attr('checked'))       set_trigger_period(false);
  if ($("#chk_autoexp_max").attr('checked'))          set_autoexp_max(false);
  if ($("#chk_autoexp_lvl").attr('checked'))          set_autoexp_level(false);
  if ($("#chk_autoexp_fracpix").attr('checked'))      set_autoexp_fracpix(false);
  if ($("#chk_autoexp_frames_ahead").attr('checked')) set_autoexp_ahead(false);
  //if ($("#chk_skip_frames").attr('checked'))          set_skip_frames_mask(false);  
  if ($("#chk_hdrvexpos").attr('checked'))            set_hdr_vexpos(false);
  save_settings();
}

function restore_parameters(){
    console.log("restore_parameters()");
    intvl_status = setInterval("status_message(true,'Applying parameters')",1000);
    //set_skip_frames_mask(true,rp_set_hdr_vexpos());
    rp_set_hdr_vexpos();
}
function rp_set_hdr_vexpos(){set_hdr_vexpos(true,rp_set_autoexp_max());}
function rp_set_autoexp_max()     {set_autoexp_max(true,rp_set_autoexp_level());}
function rp_set_autoexp_level()   {set_autoexp_level(true,rp_set_autoexp_fracpix());}
function rp_set_autoexp_fracpix() {set_autoexp_fracpix(true,rp_set_autoexp_ahead());}

function rp_set_autoexp_ahead()   {set_autoexp_ahead(true,rp_set_trigger_period());}
// no skipping
//function rp_set_autoexp_ahead()   {set_autoexp_ahead(true,rp_set_skip_frames_mask());}
//function rp_set_skip_frames_mask(){set_skip_frames_mask(true,rp_set_trigger_period());}

function rp_set_trigger_period()  {set_trigger_period(true,rp_done());}
function rp_done(){
  clearInterval(intvl_status);
  status_message(false,"Parameters set");
}

function set_quality(direction){
  if (direction=="+") $("#input_quality").val(+$("#input_quality").val()+1);
  else                $("#input_quality").val(+$("#input_quality").val()-1);
    
  set_parameter(master_ip,"QUALITY",$("#input_quality").val(),false);
  save_settings();
}

function set_trigger_period(async,callback)  {
    set_parameter(master_ip,"TRIG_PERIOD",    +$("#input_trigger_period").val()*100000,async,callback);
    send_cmd('set_period');
}
function set_skip_frames_mask(async,callback){set_parameter(master_ip,"SET_SKIP",        $("#input_skip_frames").val(),async,callback);}
function set_hdr_vexpos(async,callback)      {set_parameter(master_ip,"HDR_VEXPOS",      $("#input_hdrvexpos").val(),async,callback);}
function set_autoexp_max(async,callback)     {set_parameter(master_ip,"AUTOEXP_EXP_MAX",+$("#input_autoexp_max").val()*1000,async,callback);}
function set_autoexp_level(async,callback)   {set_parameter(master_ip,"AEXP_LEVEL",     +$("#input_autoexp_lvl").val()*256,async,callback);}
function set_autoexp_fracpix(async,callback) {
    var ratio = +$("#input_autoexp_fracpix").val()/100;
    var hexvalue = Math.round(ratio*parseInt('0xffff',16));
    hexvalue = "0x"+hexvalue.toString(16);
    set_parameter(master_ip,"AEXP_FRACPIX",hexvalue,async,callback);
}
function set_autoexp_ahead(async,callback)   {set_parameter(master_ip,"EXP_AHEAD",      +$("#input_autoexp_frames_ahead").val(),async,callback);}

function hdr_mode(mode) {
    if (mode=='on') {
	    $("#btn_hdr_on").attr('disabled',true);
	    $("#btn_hdr_off").attr('disabled',false);
	    //$("#input_skip_frames").attr('disabled',false);
	    set_parameter(master_ip,"HDR_DUR",1,false);
    }
    if (mode=='off') {
	    $("#btn_hdr_on").attr('disabled',false);
	    $("#btn_hdr_off").attr('disabled',true);
	    set_parameter(master_ip,"HDR_DUR",0,false);
    }
}

function autoexp(mode) {
    if (mode=='on')  set_parameter(master_ip,"AUTOEXP_ON",1,false);
    if (mode=='off') set_parameter(master_ip,"AUTOEXP_ON",0,false);
}

function set_manual_exposure(){
    var exposure = $("#manual_exposure").val()*1000;
    set_parameter(master_ip,"EXPOS",exposure,false);
}

function color_bars(mode) {
    if (mode=='on')  set_parameter(master_ip,"TESTSENSOR",65544,false);
    if (mode=='off') set_parameter(master_ip,"TESTSENSOR",0,false);
    setTimeout("refresh_previews()",3000);
}

function set_color_mode(mode,callback) {
    set_parameter(master_ip,"COLOR",+mode,false,callback);
    setTimeout("refresh_images()",3000);
}

function record(){
  $("#stop").attr('disabled', false);
  $("#rec").attr('disabled', true);
  if ($("#box_force_jp4").attr('checked')) {
    set_parameter(master_ip,"COLOR",5,false,send_cmd('start'));
  }else{
 	send_cmd('start');
  }
}

function stop(){
  $("#stop").attr('disabled', true);
  $("#rec").attr('disabled', false);
  send_cmd('stop');
}

function set_parameter(ip,par,val,async,callback){
  //console.log("n is "+n);
  var url = "eyesis4pi_control.php?set_parameter&rq="+cams_to_str()+"&pname="+par+"&pvalue="+val;
  
  $.ajax({
    url: url,
    async: async,
    success: function(data){
      //$("#status").html(data);
      if (typeof callback != 'undefined') callback();
    }
  }); 
}

function get_parameter(ip,par){
  var url = "eyesis4pi_control.php?get_parameter&rq="+cams_to_str()+"&pname="+par;
  
  $.ajax({
    url: url,
    success: function(data){
      console.log(data);
      $("#input_quality").html(data.get_parameter);
    },
    async: false
  }); 
}

function select_tab(tab){
      for(var i=0;i<4;i++){
	  if (tab==(i+1)) {
	      $("#tab"+(i+1)+"_contents").show();
	      $("#tab"+(i+1)).css({background:'rgba(230,230,230,0.95)'});
	  }else{
	      $("#tab"+(i+1)+"_contents").hide();
	      $("#tab"+(i+1)).css({background:'rgba(200,200,200,0.95)'});
	  }
      }
}

function refresh_images(){
    if (triclops_en) 
      refresh_images_triclops();
    else
      refresh_images_eyesis();
}

function refresh_images_eyesis(){
  
  for (var i=0;i<cams.length;i++){
      remove_hidden_div(i);
      append_hidden_div(i);
      $("#div_"+i).jp4({ip:cams[i].ip,port:cams[i].port,width:200,fast:true});
  }
  
}

function draw_single_image_eyesis(img,index){
  
  var w = 200;
  var h = 150;
  
  index = +index;
  
  var cnv = document.getElementById("cam"+index+"_canvas");
  var cContext = cnv.getContext('2d');
  cnv.setAttribute('width',h);
  cnv.setAttribute('height',3*w);

  //eyesis4pi specific
  var dx = Array(0,1,4);
  var dw = Array(0,0,4);
  
  cContext.rotate(90*Math.PI/180);
  if (index%2==0) {
    cContext.drawImage(img,  0,0*h+dx[0],  w,h-dw[0],  0*w,-1*h,  w,h);
    cContext.drawImage(img,  0,1*h+dx[1],  w,h-dw[1],  1*w,-1*h,  w,h);
    cContext.scale(-1,1);
    cContext.drawImage(img,  0,2*h+dx[2],  w,h-dw[2],  -3*w, -1*h,  w,h);
  }else{
    cContext.scale(1,-1); //mirror is needed
    cContext.drawImage(img,  0,0*h+dx[0],  w,h-dw[0],  0*w,0*h,  w,h);
    cContext.drawImage(img,  0,1*h+dx[1],  w,h-dw[1],  1*w,0*h,  w,h);
    cContext.scale(-1,1);
    cContext.drawImage(img,  0,2*h+dx[2],  w,h-dw[2],  -3*w,h*(0),  w,h);
  }
  
}

function append_hidden_div(index){
  el = $("<div>",{
    id: "div_"+index
  }).css({
    display: "none"
  });
    
  el.attr("index",index);
  
  el.on("canvas_ready",function(){
      //can draw on main canvas
      var cnv = $(this).find("#display")[0];
      var index = $(this).attr("index");
    
      draw_single_image_eyesis(cnv,index);
  });
  
  $("body").append(el);
}

function remove_hidden_div(index){
  $("#div_"+index).off("canvas_ready");
  $("#div_"+index).remove();
}

function refresh_images_triclops(){
  
  $(".prevs").css({width:"455px",height:"340px"});

  var pic = new Object();
    
  for(i=0;i<n;i++) {
    pic[i] = new Image();
    //add ip increment here
    pic[i].src="http://192.168.0."+(+master_ip+i)+":8081/bimg?"+Date.now();
    pic[i].index = i;

    pic[i].onload = function(){
      
      var w = 455;
      var h = 340;
      
      var cnv = document.getElementById('cam'+(this.index+1)+'_canvas');
      var cContext = cnv.getContext('2d');
      cnv.setAttribute('width',w);
      cnv.setAttribute('height',h);
      
      cContext.drawImage(this, 0,0,this.width,this.height,0,0,w,h);//,W,H,0,0,w,h);
    };
  } 
}

function refresh_histograms(){
  
  for (var i=0;i<cams.length;i++){
    var src = "http://"+cams[i].ip+"/pnghist.cgi?sensor_port="+cams[i].channel+"&sqrt=1&scale=5&average=5&height=128&fillz=1&linterpz=0&draw=2&colors=41&_time="+Date.now();
    $("#cam"+i+"_hist").attr("src", src);
    $("#cam"+i+"_hist_front").attr("src", src);
  }
  
}

function uncheck_all(){
  $("#chk_trigger_period").attr('checked',false);
  $("#chk_skip_frames").attr('checked',false);
  $("#chk_hdrvexpos").attr('checked',false);
  $("#chk_autoexp_max").attr('checked',false);
  $("#chk_autoexp_lvl").attr('checked',false);
  $("#chk_autoexp_fracpix").attr('checked',false);
  $("#chk_autoexp_frames_ahead").attr('checked',false);
  
}

function close_previews(){
  $("#previews").fadeOut(300);
}

function close_settings(){
  $("#settings").fadeOut(300);
}

// For PC
function set_recording_params(){
  var footage_path = $("#footage_path").val();
  var footage_subfolder = $("#footage_subfolder").val();
  var footage_limit = $("#footage_limit").val();
  
  $.ajax({
      url: "client.php?cmd=set_path&path="+footage_path+"&subfolder="+footage_subfolder+"&limit="+footage_limit,
      success: function(data){
 	$("#status").html(data);
 	$("#daemon_state").html(data);
 	//status_update(data.substring(0,data.length-3));
	send_cmd("check");
	save_settings();
      },
      async:false
  });
  
}


function start_gps_imu_log(){
  logger_index = get_logger_index();
  //control stop
  stop_gps_imu_log();
  //restart
  var d = new Date();
  var gpsimu_log_filename = "/mnt/sda1/"+d.getTime()+".log";
  var gpsimu_log_index = 1;
  var gpsimu_log_records = 10000000;
  $.ajax({url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=start&file="+gpsimu_log_filename+"&index="+gpsimu_log_index+"&n="+gpsimu_log_records,type: "GET",async: false});
  
  console.log("logger started");
}

function stop_gps_imu_log(){
  logger_index = get_logger_index();
  $.ajax({url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=stop",type: "GET",async: false});
  console.log("logger stopped");
}

function free_space_gps_imu_log(){
  console.log("free_space_gps_imu_log()");
  logger_index = get_logger_index();
  $.ajax({url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=free_space&mountpoint=/mnt/sda1",type: "GET",async: false, success: function(data){parse_free_space(data);}});
}

function parse_free_space(data){
  var raw_data = $(data).find('result').text();
  raw_data = raw_data.replace(/"/gm,'');
  $("#cf_card_free_space").html(raw_data);
}

var tmp_intv;

function download_gps_imu_log(){
    tmp_intv = setInterval("cf_status_blink('Downloading')",1000);
    download_logs();
}

function cf_status_blink(msg){
    var d = new Date();
    var curr_sec = d.getSeconds();
    if      (curr_sec%4==0) $("#cf_status").html("<b style='font-size:12px;'>"+msg+".</b>");
    else if (curr_sec%4==1) $("#cf_status").html("<b style='font-size:12px;'>"+msg+"..</b>");
    else if (curr_sec%4==2) $("#cf_status").html("<b style='font-size:12px;'>"+msg+"...</b>");
    else if (curr_sec%4==3) $("#cf_status").html("<b style='font-size:12px;'>"+msg+"</b>");
}

function download_logs(){
    logger_index = get_logger_index();
    $.ajax({
	url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=download&destination="+$("#footage_path").val()+"/"+$("#footage_subfolder").val(),
	type: "GET",
	async: true
    }).done(function(){
	clearInterval(tmp_intv);
	$("#cf_status").html("<b style='font-size:12px;'>Done<b>");
    });
}

function clean_cf_card(){
    tmp_intv = setInterval("cf_status_blink()",1000);
    //cf_mount();
    //clean here
    cf_clean();
}

function cf_clean(){
    logger_index = get_logger_index();   
    $.ajax({
	url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=clean&mountpoint=/mnt/sda1",
	type: "GET",
	async: true
    }).done(function(){
	clearInterval(tmp_intv);
	$("#cf_status").html("<b style='font-size:12px;'>Cleaning done.<b>");
    });
}

function update_log_name(){
  console.log("update_log_name()");
  var logname = "/mnt/sda1/"+$('#footage_subfolder').val()+".log";
  $('#gpsimu_log_filename').val(logname);
  //update_cf_index();
}

function update_cf_index(){
    logger_index = get_logger_index();
    //console.log("update_cf_index()");
    //save_settings();
    //cf_mount();
    
    $.ajax({
	url:"logger_manager.php?ip="+cams[logger_index].ip+"&cmd=scandir&mountpoint=/mnt/sda1",
	type: "GET",
	dataType: "xml",
	complete: function(response){udpate_index(response.responseXML);},
	async: false
    });    
}

function udpate_index(xml){
    var needle = $("#gpsimu_log_filename").val();
    var max_index = 0;
    
    $(xml).find('f').each(function(){
	var tmp_str = $(this).text();
	
	if (tmp_str.indexOf(needle)!=-1) {
	    if ((tmp_str.length-needle.length)==6) {
		var tmp_index = tmp_str.substr(-5);
		if (!isNaN(tmp_index)) {
		    tmp_index = parseInt(tmp_index);
		    if (tmp_index>=max_index) max_index = tmp_index;
		}
	    }
	}
	
    });
    
    $("#gpsimu_starting_index").val(max_index+1);
}

function parseURL() {
  var parameters=location.href.replace(/\?/ig,"&").split("&");
  for (var i=0;i<parameters.length;i++) parameters[i]=parameters[i].split("=");
  
  for (var i=1;i<parameters.length;i++) {
    switch (parameters[i][0]) {
      case "n": n = parseInt(parameters[i][1]);break;
      case "triclops" : triclops_en = true;break;
      case "phg21" : phg21_en = true;break;
      case "disable_imu" : imu_logger_en = false; break;
      case "master_ip" : master_ip = parseInt(parameters[i][1]);
                         //save_settings();
                         break;
      case "settings" : settings_file = parameters[i][1];break;
    }
  }
  
  if (triclops_en) triclops_init();
  if (phg21_en) phg21_init();
  
  if (n!=8&&n!=9) {eyesis4pi_en = false;}

}

function rewriteURL(){
  var set_triclops=false;
  var disable_imu=false;
  var baseURL = "";
  var newURL = "";
  
  var parameters=location.href.replace(/\?/ig,"&").split("&");
  for (var i=0;i<parameters.length;i++) parameters[i]=parameters[i].split("=");
  
  for (var i=1;i<parameters.length;i++) {
    switch (parameters[i][0]) {
      case "triclops" : set_triclops = true; break;
      case "disable_imu" : disable_imu = true; break;
      case "master_ip" : master_ip = parseInt(parameters[i][1]);
    }
  }
  
  console.log("MASTER IP "+master_ip);
  
  if (location.href.lastIndexOf("?")==-1) {
    baseURL = location.href;
    newURL="?master_ip="+master_ip+"&n="+n+"&settings="+settings_file;
  }else{
    baseURL = location.href.substring(0,location.href.lastIndexOf("?"));
    if (set_triclops)  newURL="?master_ip="+master_ip+"&triclops";
    else if (phg21_en) newURL="?master_ip="+master_ip+"&phg21";
    else               newURL="?master_ip="+master_ip+"&n="+n;
    
    newURL += "&settings="+settings_file;
    
    if (disable_imu) newURL += "&disable_imu";
  }
  
  window.history.pushState('index.html', 'Title', baseURL+newURL);
  
}

function triclops_init(){
  n = 3;
  imu_logger_en = false;
  eyesis4pi_en = false;
}

function phg21_init(){
  n = 7;
  imu_logger_en = false;
  eyesis4pi_en = false;
}

function rec_mode(refresh){
  if ($("#rec_mode").attr("checked")) {
      camogm_en = false;
      tab1_init("pc");
      if (refresh) setTimeout("camogm_exit()",1);
  }else{
      camogm_en = true;
      tab1_init("camogm");
      setTimeout("camogm_launch(true)",1);
  }
  save_settings();
}

function master_ip_change_init(){
  $("#address_field1").attr("disabled",false);
  $("#address_field1").change(function(){
      var tmp = $("#address_field1").val();
      var tmp_arr = tmp.split(".");
      if (tmp_arr.length!=4) $("#address_field1").val("192.168.0."+master_ip);
      else{
	  for(var i=1;i<n;i++) {
	      master_ip = tmp_arr[tmp_arr.length-1];
	      tmp_arr[tmp_arr.length-1]++;
	      update_address_field("#address_field"+(i+1),tmp_arr);
	  }
	  setTimeout("init()",0);
      }
  });
}

function update_address_field(id,arr){
  var tmp = "";
  for(var i=0;i<arr.length;i++){
      tmp += arr[i];
      if (i!=(arr.length-1)) tmp += ".";
  }
  $(id).val(tmp);
}

function status_message(en,msg){
  var d = new Date();
  var curr_sec = d.getSeconds();
  
  if (en){
    if      (curr_sec%3==1) $("#status").html(msg+".");
    else if (curr_sec%3==2) $("#status").html(msg+"..");
    else                    $("#status").html(msg+"...");
  }else{
	  $("#status").html(msg);
  }
}

// no need
function resync(){
  console.log("resync()");
  $.ajax({url:"resync.php?ip=192.168.0."+master_ip,type: "GET",async: true});
}