function save_settings(){
      console.log("save_settings(): "+master_ip);
      var tmp="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Document>\n";
      tmp += "<master_ip>"+master_ip+"</master_ip>\n";
      
      if (camogm_en) tmp += "<rec_mode>camogm</rec_mode>\n";
      else           tmp += "<rec_mode>pc</rec_mode>\n";
      
      $(".settings_paths").each(function(){
	  if ($(this).attr("type")=="text")     tmp += "<"+$(this).attr('id')+">"+$(this).val()+"</"+$(this).attr('id')+">\n";
      });
      $(".settings_pars").each(function(){
	  if ($(this).attr("type")=="checkbox") tmp += "<"+$(this).attr('id')+">"+$(this).attr("checked")+"</"+$(this).attr('id')+">\n";
	  if ($(this).attr("type")=="text")     tmp += "<"+$(this).attr('id')+">"+$(this).val()+"</"+$(this).attr('id')+">\n";
      });
      tmp += "</Document>";

      postSettings(settings_file,"save",tmp);
      
}

function restore_settings(text,which){
      console.log("restore_settings()");
      var restore_paths_en = (which=="all"||which=="paths")?(true):(false);
      var restore_pars_en  = (which=="all"||which=="pars" )?(true):(false);
      var restore_master_ip  = (which=="all"||which=="master_ip" )?(true):(false);
      var restore_mode  = (which=="all")?(true):(false);
  
      var data = $(text).find("Document");

      if (restore_mode) {
	  if (data.find("rec_mode").text()=="camogm") {
	      $("#rec_mode").attr("checked",false);
	      camogm_en = true;
	  }else{
	      $("#rec_mode").attr("checked",true);
	      camogm_en = false;
	  }
      }
      
      if (restore_master_ip) master_ip = data.find("master_ip").text();      
      
      if (restore_paths_en) {
	  $(".settings_paths").each(function(){
	      if ($(this).attr("type")=="text")     $(this).val(data.find($(this).attr('id')).text());
	  });
	  if (imu_logger_en) update_cf_index();
      }

      if (restore_pars_en) {
	  $(".settings_pars").each(function(){
	      if ($(this).attr("type")=="checkbox") $(this).attr("checked",data.find($(this).attr('id')).text());
	      if ($(this).attr("type")=="text")     $(this).val(data.find($(this).attr('id')).text());
	  });
	  
	  $('#radio1').click();
	  $('#radio').button("refresh");
          $('#ae_radio').button("refresh");
      }
      
}

function getSettings(file,which) {
    console.log("getSettings("+file+","+which+")");
    $.ajax({
	url: "settings.php?file="+file+"&cmd=read",
	type: "GET",
	async: false,
	complete: function(response){
	      restore_settings(response.responseXML,which);
	},
	contentType: "text/xml; charset=\"utf-8\""
    });
}

function postSettings(file, cmd, xml) { 
    $.ajax({
	url: "settings.php?file="+file+"&cmd="+cmd,
	type: "POST",
	dataType: "xml",
	data: xml,
	async:false,
	complete: function(response){parse_settings_response(response.responseText);},
	contentType: "text/xml; charset=\"utf-8\""
    });
}

function parse_settings_response(text) {
    $("#test").html(text);
}