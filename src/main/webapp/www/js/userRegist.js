var map;
var circle;
var marker;
var vnCompSeq;

(function (){
	
    _e = window;
	_e.workStamp.initialize();

	_e.nav.load();
	_e.progressBar.load();
	_e.modal.load("#divModalSearchCompany", "modalSearchCompany.html", 340);
	
	
    /*
	* 화면 로드 시 leaflet을 통해 지도Map을 생성하고 location 퍼미션여부를 재확인한다.
	*/
    $(window).on("load",async function() {
	
		//userRegist.html의 텍스트를 지정된 사용자언어로 변경
    	_e.setUIText("userRegist");

		//leafletMap을 생성
		createMap();	
		
		//퍼미션 획득여부를 재확인	
		_e.permission.getPermission();
		
    });

	/*
	* 관리자등록페이지로 이동
	*/
	$("#lblAdminRegist").click(function(e){
		var loginInfo = _e.urlInfo.getParameter();
		window.location.href = "adminRegist.html#NO_HISTORY?"+$.param(loginInfo);
		
	});
	
	/*
	* 회사검색 모달창 출력
	*/
	$("#btnModalSearchCompany").click(()=>{
		_e.modal.show("modalSearchCompany");
	});
	
	/*
	* 입력된 사용자 정보를 서버에 전달하여 회원등록하고 정상적으로 완료된 경우 
	* 출퇴근등록 페이지로 이동한다.
	*/
	$("#btnUserRegist").click(async function(e){
		
		try{
			
			//필수값 입력여부를 확인
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
			
			//사용자 등록 cmd
			let response = await _e.sendCmd('registUserCmd', userInfo, []);
			
			//로컬스토리지에 사용자 정보를 저장
			localStorage.setItem("userInfo", JSON.stringify(response.commData));
			
			_e.progressBar.hide();
			
			//회원가입 성공 알림
			_e.text.toast(_e.systemMassage["1001"]);	//회원가입에 성공하였습니다.메인페이지로 이동합니다
			
			//출퇴근등록페이지로 이동
			location.href = "registWorkInOut.html";
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, "failConnect");
		}

	});
	
	/*
	* 회원등록에 필요한 필수정보가 정상적으로 입력되었는지 확인한다.
	*/
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

/*
* 회사검색 모달창이 닫혔을 때 사용자가 선택한 주소지정보가 맵 및 주소정보창에 출력되도록 한다.
*/
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

/*
* leafletMap을 생성한다
*/
function createMap(){
 
    var defaultXY = _e.getLanguage() == "jp" ? [35.69125191777191, 139.6925783157349] : [37.5663174209601, 126.977829174031];
 	
	//map 생성
    map = L.map('map',{
				 zoomControl: false
				,scrollWheelZoom: false
				,center: defaultXY
    			,zoom: 15
				});
	
	//map 드래그 불가처리			
	map.dragging.disable();			
	
				
    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
	    	          attribution:'&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> Contributors'
  			  }).addTo(map);
 
 	//map에 원형 범위추가
    circle = L.circle(defaultXY, {
	    		 		color: '#eb9316',
	    				fillOpacity: 0.2,
	    				radius: 150
  			     }).addTo(map);

	//map에 마커 추가
	marker = L.marker(defaultXY).addTo(map);
	
}