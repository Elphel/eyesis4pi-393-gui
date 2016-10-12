
var cams = [
  {"ip":"192.168.0.161","port":2326,"channel":3},
  {"ip":"192.168.0.161","port":2325,"channel":2},
  {"ip":"192.168.0.161","port":2323,"channel":0},
  {"ip":"192.168.0.161","port":2324,"channel":1},
  {"ip":"192.168.0.162","port":2326,"channel":3},
  {"ip":"192.168.0.162","port":2325,"channel":2},
  {"ip":"192.168.0.162","port":2323,"channel":0},
  {"ip":"192.168.0.162","port":2324,"channel":1},
  {"ip":"192.168.0.163","port":2325,"channel":2},
  {"ip":"192.168.0.163","port":2326,"channel":3}
];

$(function(){
  console.log("test!");
  init_images_eyesis();
  refresh_images_eyesis();
});

function init_images_eyesis(){
  for(var i=0;i<cams.length;i++){
        $("#previews").append(
          $("<canvas>",{id:"canvas_"+i})
        ); 
  }
}

function refresh_images_eyesis(){
  var d = new Date();
  var curr_time = d.getTime();
  
  var pic = new Object();
  
  for(var i=0;i<cams.length;i++){
    
    pic[i] = new Image();
    pic[i].src = "http://"+cams[i].ip+":"+cams[i].port+"/bimg?"+curr_time;
    pic[i].index = i;
    pic[i].onload = function(){

      var w = 200;
      var h = 150;
      var W = 2592;
      var H = 1944;

      var cnv = document.getElementById("canvas_"+this.index);
      var cContext = cnv.getContext('2d');
      cnv.setAttribute('width',h);cnv.setAttribute('height',3*w);
      cContext.rotate(90*Math.PI/180);
      
      var k = 3;
      
      //mask out 2s
      //if ((this.index==0)||(this.index==1)||(this.index==7)) k = 3;
      
      if (this.index%2==0) {
        cContext.drawImage(this, 0,0*H,W,H, 0*w,-1*h,w,h);
        cContext.drawImage(this, 0,1*H,W,H, 1*w,-1*h,w,h);
        cContext.scale(-1,1);
        cContext.drawImage(this, 0,2*H,W,H, -3*w, -1*h, w, h);
      }else{
	  cContext.scale(1,-1); //mirror is needed
	  cContext.drawImage(this, 0,0*H,W,H, 0*w,0*h,w,h);
	  cContext.drawImage(this, 0,1*H,W,H, 1*w,0*h,w,h);
          cContext.scale(-1,1);
	  cContext.drawImage(this, 0,2*H,W,H, -3*w,h*(0),w,h);
      }
      
    };
  }
  
}