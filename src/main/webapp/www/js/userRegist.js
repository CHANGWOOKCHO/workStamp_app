var map;
var circle;
var marker;
var vnCompSeq;

(function (){
    _e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
	_e.progressBar.load();
	_e.modal.load("#divModalSearchCompany", "modalSearchCompany.html", 340);

    $(window).on("load",async function() {
    	_e.setUIText("userRegist");
		createMap();		
		_e.permission.getPermission();
    });

	$("#lblAdminRegist").click(function(e){
		
		var loginInfo = _e.urlInfo.getParameter();
		window.location.href = "adminRegist.html#NO_HISTORY?"+$.param(loginInfo);
		
	});
	
	$("#btnModalSearchCompany").click(()=>{
		_e.modal.show("modalSearchCompany");
	});
	
	$("#btnUserRegist").click(async function(e){
		
		try{
			if(checkUserInfo() == false){
				return;
			}
			_e.progressBar.show();
			var userInfo = {
				"snsId" : _e.urlInfo.getParameter("snsId")
				,"snsType" : _e.urlInfo.getParameter("snsType")
				,"userNm" : $("#txtName").val().trim()
				,"empNo" : $("#txtEmpNo").val().trim()
				,"adminYn" : "N"
				,"compSeq" : vnCompSeq
				,"compNm" : $("#txtCompNm").val().trim()
				,"teamNm" : $("#txtTeamNm").val().trim()
				,"zipCd" :  $("#txtZipCd").val().trim()
				,"basicAddr" : $("#txtBasicAddr").val().trim()
				,"dtailAddr" : $("#txtDtailAddr").val().trim()
				,"longitude" : marker.getLatLng().lng
				,"latitude" : marker.getLatLng().lat		
			}
		
			let response = await _e.sendCmd('registUserCmd', userInfo, []);
			localStorage.setItem("userInfo", JSON.stringify(response.commData));
			_e.progressBar.hide();
			_e.text.toast(_e.systemMassage["1001"]);	
			location.href = "registWorkInOut.html";
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, "failConnect");
		}

	});
	
	function checkUserInfo(){
	
		if($("#txtName").val().trim().length == 0){
			_e.text.toast(_e.systemMassage["-101"]);
			return false;
		}
			
		if($("#txtDtailAddr").val().trim().length == 0 && $("#txtZipCd").val().trim() == 0 && $("#txtDtailAddr").val().trim().length == 0){
			_e.text.toast(_e.systemMassage["-102"]);
			return false;
		}
		return true;
	}

}())

function modalSearchCompany_callback(e, modalCaller){
	var resultData = JSON.parse($(modalCaller).attr("data-returns"));
		
	var position = {"lat" : resultData.latitude, "lng" : resultData.longitude};
		
	map.removeLayer(circle);
		
	circle = L.circle(position, {
	    		 	color: '#eb9316',
	    			fillOpacity: 0.3,
	    			radius: 150
  			  }).addTo(map);	

	map.panTo(position);
	marker.setLatLng(position);
	
	$("#txtCompNm").val(resultData.compNm);
	$("#txtTeamNm").val(resultData.teamNm);
	$("#txtZipCd").val(resultData.zipCd);
	$("#txtBasicAddr").val(resultData.basicAddr);
	$("#txtDtailAddr").val(resultData.dtailAddr);
	
	vnCompSeq = resultData.compSeq;
	
	_e.text.toast(_e.systemMassage["1002"], true);
}

function createMap(){
 
    var defaultXY = _e.getLanguage() == "jp" ? [35.69125191777191, 139.6925783157349] : [37.5663174209601, 126.977829174031];
 
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
	    				radius: 150
  			     }).addTo(map);

	marker = L.marker(defaultXY).addTo(map);
	
}