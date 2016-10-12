function footage_download(){
  $.ajax({
      url:"footage_downloader.php?destination="+$("#path").val()+"/"+$("#dir").val(),
      type: "GET",
      async: true,
      success: function(){
	console.log("Downloading complete");
    }
  });
}