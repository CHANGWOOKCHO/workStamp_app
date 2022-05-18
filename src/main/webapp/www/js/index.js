(function() {
	_e = window;
	_e.progressBar.load();
    workStamp.initialize(); //DeviceReady
   
	$(window).load(async function() {
		await _e.setLanguage();
		_e.setUIText("index");
		await _e.permission.getPermission();
	
		if(localStorage.getItem("userInfo") != null){
			location.href = "registWorkInOut.html"; //바로 등록화면으로
			return;		
		}
		
	});
	
	$(".loginClass").on("click", (e) => {
		if($(".modal-backdrop").length > 0){
			return;	
		}
		const loginService = $(e.target).data("target");
		snsLoginService(loginService);
	});
	
	$("#btnTimezon").on("click", (e) => {
		_e.sendCmd('modifyTimezonCmd', {}, []);
	});
	
/*	$("#test").on("click", (e) => {
		navigator.globalization.getLocaleName(
    		function (locale) {alert('locale: ' + locale.value + '\n');},
    		function () {alert('Error getting locale\n');}
		);
	});	*/
    async function snsLoginService(vsSnsType){
		let pnSnsType = vsSnsType;
		let snsInfo = null;
		let response = null;
		
		_e.progressBar.show();
		
		try {
			
			snsInfo = await _e.sns.login(pnSnsType);
			
			 if($.isEmptyObject(snsInfo.snsId)){
				_e.text.toast(_e.systemMassage["-114"], false);
				_e.progressBar.hide();
				return;
			 }
			
			response = await _e.sendCmd('retrieveUserInfoCmd', snsInfo, []);
			
			_e.progressBar.hide();
			
			if(Object.keys(response.commData).length != 0){
				localStorage.setItem("userInfo", JSON.stringify(response.commData)); //스토리지에 유저정보 저장
				location.href = "registWorkInOut.html";  //기등록된 사용자라면 출퇴근등록 화면으로 바로 이동
			}else{
				location.href = "userRegist.html#NO_HISTORY?"+$.param(snsInfo); //등록되지 않은 사용자라면 회원등록으로 이동
			}
		} catch(error) {
			_e.progressBar.hide();
			_e.showError.toast(error,  _e.systemMassage["-404"]);
		}
    }
	
}());