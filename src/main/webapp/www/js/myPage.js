
var map;
var circle;
var marker;

(function(){
	
	_e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
	_e.progressBar.load();
	
	$(window).load(function() {
		
		_e.setUIText("myPage");
		
		var userInfo = _e.userInfo.getParameter();
		createMap(userInfo.latitude, userInfo.longitude);
		
		$("#txtName").val(userInfo.userNm);
		$("#txtEmpNo").val(userInfo.empNo);
		$("#txtCompNm").val(userInfo.compNm);
		$("#txtTeamNm").val(userInfo.teamNm);
		$("#txtZipCd").val(userInfo.zipCd);
		$("#txtBasicAddr").val(userInfo.basicAddr);
		$("#txtDtailAddr").val(userInfo.dtailAddr);
	});
	
}())

 function createMap(latitude, longitude){
 
    var defaultXY = [latitude, longitude];
 
    map = L.map('map',{
				 zoomControl: false
				,scrollWheelZoom: false
				,center: defaultXY
    			,zoom: 15
				});
				
	map.dragging.disable();			
				
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
	    	          attribution:'&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors'
  			  }).addTo(map);
 
 
    circle = L.circle(defaultXY, {
	    		 		color: '#eb9316',
	    				fillOpacity: 0.2,
	    				radius: 200
  			     }).addTo(map);

	marker = L.marker(defaultXY).addTo(map);
	
}


		

