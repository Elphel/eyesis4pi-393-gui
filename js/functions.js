/*
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
*/

function get_master_index(){
    for (var i=0;i<cams.length;i++) if (cams[i].master==1) return i;
    return -1;
}

function get_logger_index(){
    for (var i=0;i<cams.length;i++) if (cams[i].logger==1) return i;
    return -1;
}

function cams_to_str(){
    var rq_str = "";
    for(var i=0;i<cams.length;i++){
        if (i!=0){
            rq_str += ",";
        }
        rq_str += cams[i].ip+":"+cams[i].port+":"+cams[i].channel+":"+cams[i].master+":"+cams[i].logger;
    }
    return rq_str;
}

function get_unique_rq_str(){
    res_full = get_unique_cams();
    rq_str = "";
    for(var i=0;i<res_full.length;i++){
        if (i!=0){
            rq_str += ",";
        }
        rq_str += res_full[i].ip+":"+res_full[i].port+":"+res_full[i].channel+":"+res_full[i].master+":"+res_full[i].logger;
    }
    return rq_str;
}

function get_unique_cams(){
    res = [];
    res_full = [];
    for(var i=0;i<cams.length;i++){
         if (res.indexOf(cams[i].ip)==-1) {
             res.push(cams[i].ip);
             res_full.push(cams[i]);
         }
    }
    return res_full;
}

function get_unique_cams_index(cam){
    ucam = get_unique_cams();
    for(var i=0;i<ucam.length;i++){
      if (cam.ip==ucam[i].ip) return i;
    }
    return -1;
}
