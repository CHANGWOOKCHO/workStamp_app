
var map;
var circle;
var marker;

(function(){
	
	_e = window;
	_e.workStamp.initialize();  //DeviceReady
	
	_e.progressBar.load();  //progressBar셋팅
	_e.modal.load("#divModalSearchAddr", "modalSearchAddr.html", 340); //주소검색 팝업 셋팅
	    
	$(window).load(async function() {
		_e.setUIText("adminRegist");
		createMap();
		_e.permission.getPermission();
	});
	
	$("#lblUserRegist").click(function(e){
		var loginInfo = _e.urlInfo.getParameter();
		window.location.href = "userRegist.html#NO_HISTORY?"+$.param(loginInfo);
		
	});
	
	$("#chkSameTeamNm").click(function(e){
		
		var isCheck = $("#chkSameTeamNm").prop("checked");

		if(isCheck){
			$("#txtTeamNm").val($("#txtCompNm").val());
		}else{
			$("#txtTeamNm").val("");
		}
	});
	    
	$("#btnSearchLocation").click(async function(e){
	
		try{
			_e.progressBar.show();
			
			let gps = await _e.gps.getPosition();
			let position = {
				"lat" : gps.coords.latitude          
            	,"lng" : gps.coords.longitude
			}
			
			map.removeLayer(circle);
			
			circle = L.circle(position, {
					 		color: '#eb9316',
							fillOpacity: 0.2,
							radius: 150
				     }).addTo(map);	
		
			map.panTo(position);
			marker.setLatLng(position);
			
			let response = await _e.sendCmd('retrieveGpsCmd', gps.coords, []);
			
			if(response.commData.type == "jibun" && $.isEmptyObject(response.commData.zipCode) == true){
				_e.text.alert(_e.systemMassage["-105"]);
			}

			$("#txtZipCd").val(response.commData.zipCode);
			$("#txtBasicAddr").val(response.commData.basicAddr);
			_e.progressBar.hide();
			_e.text.toast(_e.systemMassage["1003"], true);
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}

	});
	
	$("#btnAdminRegist").click(async function(e){
		try{
			if(checkUserInfo() == false){
				return;
			}	
			_e.progressBar.show();
			let userInfo = {
				"snsId" : _e.urlInfo.getParameter("snsId")
				,"snsType" : _e.urlInfo.getParameter("snsType")
				,"userNm" : $("#txtName").val().trim()
				,"empNo" : $("#txtEmpNo").val().trim()
				,"adminYn" : "Y"
				,"compSeq" : ""
				,"compNm" : $("#txtCompNm").val().trim()
				,"teamNm" : $("#txtTeamNm").val().trim()
				,"zipCd" :  $("#txtZipCd").val().trim()
				,"basicAddr" : $("#txtBasicAddr").val().trim()
				,"dtailAddr" : $("#txtDtailAddr").val().trim()
				,"longitude" : marker.getLatLng().lng
				,"latitude" : marker.getLatLng().lat		
			}
			let response = await _e.sendCmd("registUserCmd", userInfo, []);
			localStorage.setItem("userInfo", JSON.stringify(response.commData));
		
			_e.progressBar.hide();
			_e.text.toast(_e.systemMassage["1001"]);		
			location.href = "registWorkInOut.html";

		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}
	
	});
	
	function checkUserInfo(){
	
		if($("#txtName").val().trim().length == 0){
			_e.text.toast(_e.systemMassage["-101"]);
			return false;
		}
		
		if($("#txtCompNm").val().trim().length == 0){
			_e.text.toast(_e.systemMassage["-103"]);
			return false;
		}
		
		if($("#txtBasicAddr").val().trim().length == 0){
			_e.text.toast(_e.systemMassage["-104"]);
			return false;
		}
		
		if($("#txtDtailAddr").val().trim().length == 0 && $("#txtZipCd").val().trim() == 0){
			if(confirm(_e.systemMassage["501"]) == false){
				return false;
			}
		}else if($("#txtZipCd").val().trim().length == 0){
			if(confirm(_e.systemMassage["502"]) == false){
				return false;
			}
		}else if($("#txtDtailAddr").val().trim().length == 0){
			if(confirm(_e.systemMassage["503"]) == false){
				return false;
			}
		}
		return true;
	}
	
}())

function modalSearchAddr_callback(e, modalCaller){
	var resultData = JSON.parse($(modalCaller).attr("data-returns"));
	
	if(resultData.latitude != 0 && resultData.longitude != 0){
		
		var position = {"lat" : resultData.latitude, "lng" : resultData.longitude};
		
		map.removeLayer(circle);
		
		circle = L.circle(position, {
	    		 		color: '#eb9316',
	    				fillOpacity: 0.3,
	    				radius: 200
  			     }).addTo(map);	

		map.panTo(position);
		marker.setLatLng(position);
		
	}
	
	$("#txtZipCd").val(resultData.zipCd);
	$("#txtBasicAddr").val(resultData.basicAddr);
	$("#txtDtailAddr").val(resultData.dtailAddr);
	_e.text.toast(_e.systemMassage["1003"], true);
	
}

 function createMap(){
 
   var defaultXY = _e.getLanguage() == "jp" ? [35.69125191777191, 139.6925783157349] : [37.5663174209601, 126.977829174031];
 
	 map = L.map('map',{
				scrollWheelZoom: false
				,center: defaultXY
    			,zoom: 15
				});
 
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
	    	          attribution:'&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors'
  			  }).addTo(map);
 
 
    circle = L.circle(defaultXY, {
	    		 		color: '#eb9316',
	    				fillOpacity: 0.3,
	    				radius: 150
  			     }).addTo(map);

	marker = L.marker(defaultXY, {
						draggable: 'true'
				 }).addTo(map);
	
	marker.on('dragstart', function(event) {
	 	map.removeLayer(circle);
	});
	
	marker.on('dragend', function(event) {
		var position = marker.getLatLng();
		
		circle = L.circle(position, {
	    		 		color: '#eb9316',
	    				fillOpacity: 0.3,
	    				radius: 150
  			     }).addTo(map);	

		map.panTo(position);
	});
}


		

