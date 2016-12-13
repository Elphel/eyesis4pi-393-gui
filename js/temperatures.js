function init_temperatures_table(){
    var table_contents ="<table class='temperature_table'>\n";
    var str = "";
    
    table_contents += "<tr style='font-size:0.8em;' align='center'><td>ip</td><td>t<sub>CPU</sub>,&deg;C&nbsp;&nbsp;</td><td>t<sub>10389</sub>,&deg;C&nbsp;&nbsp;</td><td>t<sub>SSD</sub>,&deg;C&nbsp;&nbsp;</td></tr>";
    
    unique_cams = get_unique_cams();
    
    for(var i=0;i<unique_cams.length;i++){
      table_contents += "<tr align='center'><td style='font-size:0.8em;'>"+unique_cams[i].ip+"</td><td id='tcpu_"+i+"'></td><td id='t10389_"+i+"'></td><td id='tssd_"+i+"'></td></tr>";
    }
    
    table_contents += "</table>";
    
    $("#temperatures_map").html(table_contents);

    //finalize init
    read_temperatures();
}

function read_temperatures(){
  get_temperature();
}

function get_temperature(){  
  var url = "eyesis4pi_control.php?get_temperature&rq="+get_unique_rq_str();
  
  $.ajax({
    url: url,
    success: function(data){
      results = $(data).find("result");
      ucams = get_unique_cams();
      for(var i=0;i<ucams.length;i++){
        temps_str = $(results[i]).text();
        temps = temps_str.replace(/\n/gm,'').trim().split(" ");
        if (temps.length==4){
          t0 = Math.round(temps[0]);
          $("#tcpu_"+i).html(t0).css({color:TtoColor(t0,0,100)});
          t1 = Math.round(temps[1]);
          $("#t10389_"+i).html(t1).css({color:TtoColor(t1,0,100)});
          t2 = Math.round(temps[2]);
          $("#tssd_"+i).html(t2).css({color:TtoColor(t2,0,100)});
        }
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


