(function() {
	_e = window;
    workStamp.initialize();

   _e.progressBar.load();

	/*
	* 어플 기동 시 어플에서 필요로 하는 퍼미션[storage, location]을 획득하며
	* 로그인 정보가 남은 경우 바로 출퇴근등록페이지로 이동하도록 한다.
	*/	
	$(window).load(async function() {
		
		//디바이스에 설정된 언어설정을 어플에서 사용되는 사용자언어로 설정
		await _e.setLanguage();
		
		//index.html의 텍스트를 지정된 사용자언어로 변경
		_e.setUIText("index");
		
		//어플에서 필요로 하는 퍼미션[storage, location]을 획득
		await _e.permission.getPermission();
	
		//로그인 정보가 남아 있는 경우 바로 출퇴근등록페이지로 이동
		if(localStorage.getItem("userInfo") != null){
			location.href = "registWorkInOut.html"; //바로 등록화면으로
			return;		
		}
		
	});
	
	/*
	* 각 플랫폼별로 간편로그인을 진행한다.
	*/
	$(".loginClass").on("click", (e) => {
		
		//로그인 시도 중에 다시 click이벤트가 동작하지 않도록 방지
		if($(".modal-backdrop").length > 0){
			return;	
		}
		
		const loginService = $(e.target).data("target");
		snsLoginService(loginService);
	});
	
	
	/*
	* 각 플랫폼 별 간편로그인 정보 획득 후 해당 회원정보를 조회한다.
	* 조회결과 있다면 출퇴근등록화면페이지로 이동하고 없을 경우 회원가입 페이지로 이동한다.
	*	
    * @param 로그인SNS타입
	*/
    async function snsLoginService(vsSnsType){
		let pnSnsType = vsSnsType;
		let snsInfo = null;
		let response = null;
		
		_e.progressBar.show();
		
		try {
			
			//각 플랫폼별 간편로그인 진행
			snsInfo = await _e.sns.login(pnSnsType);
			
			//사용자의 로그인 취소한 경우
			if($.isEmptyObject(snsInfo.snsId)){
				_e.text.toast(_e.systemMassage["-114"], false); //로그인이 취소되었습니다.
				_e.progressBar.hide();
				return;
			}
			
			//사용자정보 조회 cmd
			response = await _e.sendCmd('retrieveUserInfoCmd', snsInfo, []);
			
			_e.progressBar.hide();
			
			
			if(Object.keys(response.commData).length != 0){  						 //기등록된 사용자라면 출퇴근등록 화면으로 바로 이동
			    //스토리지에 유저정보 저장
				localStorage.setItem("userInfo", JSON.stringify(response.commData)); 
				location.href = "registWorkInOut.html";  
			}else{																	//등록되지 않은 사용자라면 회원등록으로 이동
				location.href = "userRegist.html#NO_HISTORY?"+$.param(snsInfo); 
			}
			
		} catch(error) {
			_e.progressBar.hide();
			_e.showError.toast(error,  _e.systemMassage["-404"]);
		}
    }
	
}());