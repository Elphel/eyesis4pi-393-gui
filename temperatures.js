function init_temperatures_table(){
    var table_contents ="<table class='temperature_tables'>\n<tr>\n";
    var str = "";
    //sensors
    
    if (eyesis4pi_en) {
	for(var i=+master_ip;i<(+master_ip+n-1);i++) {
	    //reset str
	    str = "<td>\n\t<table class='temperature_tables'>\n";
	    for (var j=1;j<4;j++) {
		str += "<tr><td><div id='c"+i+"t_"+j+"' class='ts_cells'></div></td></tr>\n";
	    }
	    table_contents += str+"</table>\n</td>";
	}
	table_contents += "</tr>\n<tr><td colspan=8 align='center'><table class='temperature_tables'>";
	//369s
	for(var i=+master_ip;i<(+master_ip+4);i++) {
	    str  = "<tr>\n";
	    str += "\t<td><div id='c"+i+"t_0'     class='t369_cells'></div></td>\n";
	    str += "\t<td><div id='c"+(i+4)+"t_0' class='t369_cells'></div></td>\n";
	    str += "<tr>\n";
	    table_contents += str;
	}
	table_contents += "</table>\n</td></tr><tr><td align='center' colspan='8'>\n";

	if (n==9) {
	    //229
	    table_contents += "<table>";      
	    table_contents += "<tr>";
	    table_contents += "\t<td><div id='c229t_1' class='ts_cells'></div></td>\n";
	    table_contents += "\t<td><div id='c229t_0' class='t369_cells'></div></td>\n";
	    table_contents += "\t<td><div id='c229t_2' class='ts_cells'></div></td>\n";
	    table_contents += "</tr>";

	    table_contents += "</table>\n</td></tr></table>";
	}
    }else{
	for(var i=+master_ip;i<(+master_ip+n);i++) {
	    //reset str
	    str = "<td>\n\t<table class='temperature_tables'>\n";
	    for (var j=1;j<4;j++) {
		str += "<tr><td><div id='c"+i+"t_"+j+"' class='ts_cells'></div></td></tr>\n";
	    }
	    table_contents += str+"</table>\n</td>";
	}
	table_contents += "</tr>\n<tr><td colspan=8 align='center'><table class='temperature_tables'>";
	//369s
	str  = "<tr>\n";
	for(var i=+master_ip;i<(+master_ip+n);i++) {
	    str += "\t<td><div id='c"+i+"t_0'     class='t369_cells'></div></td>\n";
	}
	str += "<tr>\n";
	table_contents += str;
	table_contents += "</table>\n</td></tr><tr><td align='center' colspan='8'>\n";      
    }
    
    
    $("#temperatures_map").html(table_contents);

    //finalize init
    //read_temperatures();
}

function read_temperatures(){
  if (eyesis4pi_en) {
      for(var i=+master_ip;i<(+master_ip+n);i++) {
	$("#c"+i+"t_0").css("background","black");
	$("#c"+i+"t_1").css("background","black");
	$("#c"+i+"t_2").css("background","black");
	$("#c"+i+"t_3").css("background","black");
	get_temperature(i,"TEMPERATURE01");
	get_temperature(i,"TEMPERATURE23");
      }
      if (n==9) {
	  //special case 9
	  $("#c"+i+"t_0").css("background","white");
	  $("#c"+i+"t_1").css("background","white");
	  $("#c"+i+"t_2").css("background","white");
	  get_temperature(i,"TEMPERATURE01");
	  get_temperature(i,"TEMPERATURE23");
      }
  }else{
      for(var i=+master_ip;i<(+master_ip+n);i++) {
	$("#c"+i+"t_0").css("background","black");
	$("#c"+i+"t_1").css("background","black");
	$("#c"+i+"t_2").css("background","black");
	$("#c"+i+"t_3").css("background","black");
	get_temperature(i,"TEMPERATURE01");
	get_temperature(i,"TEMPERATURE23");
      }    
  }
}

function get_temperature(ip,par){
  var url = "eyesis4pi_control.php?get_parameter&master_ip="+ip+"&n=1&pname="+par;
  
  $.ajax({
    url: url,
    success: function(data){
      var tmp_line = +$(data).find('get_parameter').text();

      t0_hex = (+$(data).find('get_parameter').text())&0xffff;
      t1_hex = (+$(data).find('get_parameter').text())>>16;

      var t0 = convertTemperature(t0_hex);
      var t1 = convertTemperature(t1_hex);

      var t0_color = TtoColor(t0,40,80);
      var t1_color = TtoColor(t1,40,80);

      if (par=="TEMPERATURE01") {
	  $("#c"+ip+"t_0").css("background",t0_color);
	  $("#c"+ip+"t_1").css("background",t1_color);
	  $("#c"+ip+"t_0").attr("title","camera "+(ip-(+master_ip-1))+" - 10369:  "+Math.round(t0)+" C / "+CToK(t0)+" F");
	  
	  if (ip==(+master_ip+9)) $("#c"+ip+"t_1").attr("title","camera "+ip+" - upper:  "+Math.round(t1)+" C / "+CToK(t1)+" F");
	  else         $("#c"+ip+"t_1").attr("title","camera "+ip+" - top:  "+Math.round(t1)+" C / "+CToK(t1)+" F");
      }
      if (par=="TEMPERATURE23") {
	  $("#c"+ip+"t_2").css("background",t0_color);
	  $("#c"+ip+"t_3").css("background",t1_color);
	  
	  if (ip==(+master_ip+9)) $("#c"+ip+"t_2").attr("title","camera "+ip+" - lower:  "+Math.round(t0)+" C / "+CToK(t0)+" F");
	  else         $("#c"+ip+"t_2").attr("title","camera "+ip+" - middle:  "+Math.round(t0)+" C / "+CToK(t0)+" F");
	 
	  $("#c"+ip+"t_3").attr("title","camera "+(ip-((+master_ip-1)))+" - bottom:  "+Math.round(t1)+" C / "+CToK(t1)+" F");
      }

    }
  }); 
}

function CToK(t){
  return Math.round((1.8*t+32));
}

function convertTemperature(hex){
    var t=0;
    if (hex==-1){
    }else{
      t = (hex&0xfff)/16;
      if ((hex&0xf000)!=0) t = -t;
    }
    return t;
}

function TtoColor(int,min,max){
    var r=0,g=0,b=0;
    var ratio = 0;

    var full_scale = max-min;

    if (int==0) return "rgba(220,220,220,1)";

    if (int<(full_scale/2+min)) {
	ratio = (full_scale/2+min-int)/(full_scale/2);
	g = 255*(1-ratio);
	b = 255*ratio;
    }else{
	ratio = (max-int)/(full_scale/2);
	r = 255*(1-ratio);
	g = 255*ratio;
    }

    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    if (r<0)   r=0; 
    if (r>255) r=255;
    if (g<0)   g=0;
    if (g>255) g=255;
    if (b<0)   b=0;
    if (b>255) b=255;

    return "rgba("+r+","+g+","+b+",1)";

}


