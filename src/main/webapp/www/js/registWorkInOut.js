(function (){
    _e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
	_e.progressBar.load();
	
	let defaultValue = "-- : -- : --";
	    
	$(window).on("load", function() {
		_e.setUIText("registWorkInOut")
		var date = _e.date.convertDateToString(new Date(),"YYYYMMDD");  //오늘날짜 yyyymmdd
		$("#ipbWorkYmd").val(_e.date.convertDateToString(date, 'YYYY-MM-DD'));
		
		retreiveWorkInfo(date);
	
    });

	$("#ipbWorkYmd").on('change', function(e){
		retreiveWorkInfo(_e.date.convertDateToString($("#ipbWorkYmd").val(), "YYYYMMDD"));
	});

    $('.bindRadio').on('click', function(e){
    	var voBindRadio = $(e.target).prev(); 
    	voBindRadio.prop("checked", true);
	
		var date = new Date();
	   
		if(voBindRadio.val() == "IN"){
			$("#lblWorkYmd").text(_e.getLanguage() == "jp" ? "出勤日" : "출근일");
			$("#txtRegistYmd").val($("#ipbWorkYmd").val());
			$("#txtRegistYmd").prop("disabled", true);
			
			$("#txtRegistTime").val(_e.date.convertTimeToString(date,"HH:MM:SS"));
			
		}else{
			$("#lblWorkYmd").text(_e.getLanguage() == "jp" ? "退勤日" : "퇴근일");
			$("#txtRegistYmd").val(_e.date.convertDateToString(date,"YYYY-MM-DD"));
			$("#txtRegistYmd").prop("disabled", false);
			
			$("#txtRegistTime").val(_e.date.convertTimeToString(date,"HH:MM:SS"));
		}
	
    });
    
    $("#toggle_alarm").on('click', function(e){
		if( $("#toggle_alarm").is(":checked")){
			$(".toggleWrap").css("bottom","160px");
			$(".inputLine-wrap").css("display","block");
		}else{
			$(".toggleWrap").css("bottom","40px");
			$(".inputLine-wrap").css("display","none");
		}
	});
	
	$("#btnRegist").on('click',async function(e){

		var stampType = $("input[name=stampType]:checked").val();
		var isAuto = $("#toggle_alarm").is(":checked") == false;
		var apprCd = stampType == "IN" ?  $("#txtWorkStartTime").attr("apprCd") : $("#txtWorkEndTime").attr("apprCd");
	
		try{
			if(checkRegistInfo(stampType, isAuto, apprCd) == false){
				return;
			}
			
			_e.progressBar.show();
			
			if(isAuto){
				//거리계산하기
				let gps = await _e.gps.getPosition();
				let nowLat = gps.coords.latitude;
				let nowLng = gps.coords.longitude;
				let compLat = _e.userInfo.getParameter("latitude");
				let compLng = _e.userInfo.getParameter("longitude");
			
				let meter = _e.gps.getDistance(nowLat,nowLng,compLat,compLng);
			
				if(meter > 150){
					_e.text.toast(_e.systemMassage["-117"].replaceAll("{0}", meter), true);
					_e.progressBar.hide();
					return;
				}
			}

			var reqInfo = {
				"workYmd" :  _e.date.convertDateToString($("#ipbWorkYmd").val(), "YYYYMMDD")
				,"stampType" : stampType
				,"autoYn" : isAuto ? "Y" : "N"
				,"registYmd" : isAuto ? "" : _e.date.convertDateToString($("#txtRegistYmd").val(), "YYYYMMDD")
				,"registTime" :  isAuto ? "" : _e.date.convertTimeToString($("#txtRegistTime").val(), "HHMMSS")
				,"nonUseAutoCd" : isAuto ? "" : $("#cbxNonUseAutoCd").val()
			}
			
			let response = await _e.sendCmd('registWorkInfoCmd', reqInfo, []);
			
			_e.text.toast(_e.systemMassage["1004"]);
			retreiveWorkInfo(reqInfo.workYmd);
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}
	});
	
	function checkRegistInfo(stampType, isAuto, apprCd){
		if($.isEmptyObject(stampType)){
			_e.text.alert(_e.systemMassage["-107"]); //출근 혹은 퇴근을 선택 후 등록해 주세요.
			return false;	
		}else if($("#txtWorkStartTime").text() == defaultValue && stampType == "OUT"){//출근등록 안했는데 퇴근등록하는 경우
			_e.text.alert(_e.systemMassage["-108"]); //출근시간을 등록 후 퇴근등록을 해주세요.
			return false;	
		}else if($("#txtRegistYmd").val() < $("#ipbWorkYmd").val() && stampType == "OUT" && isAuto == false){
			_e.text.alert(_e.systemMassage["-109"]); //퇴근일이 근무일보다 이전입니다. 확인 후 재입력하시기 바랍니다.
			return false;	
		}else if($("#txtWorkEndTime").text() != defaultValue && stampType == "IN" && $("#txtWorkStartTime").attr("apprCd") != "T"){ //퇴근등록해 놓고 출근다시 등록하려는 경우(반려된 경우 제외)   
			_e.text.alert(_e.systemMassage["-110"]); //이미 퇴근등록이 되었습니다.출퇴근시간을 변경해야 하는 경우 관리자에게 문의해주세요.
			return false;	
		}
		
		var vsMsg;
	
		if(apprCd == "R"  && isAuto == true){ //수기입력 승인요청대기 중 위치기반으로 출퇴근 등록 시
			vsMsg = _e.systemMassage["504"];
		}else if(apprCd == "R" && isAuto == false){
			vsMsg = _e.systemMassage["505"];
		}else if(apprCd != "R" && apprCd != "T" && $("#txtWorkStartTime").text() != defaultValue && stampType == "IN" ){
			vsMsg = _e.systemMassage["506"];
		}else if(apprCd != "R" && apprCd != "T" && $("#txtWorkEndTime").text() != defaultValue && stampType == "OUT"){
			vsMsg = _e.systemMassage["507"];
		}
		
		if($.isEmptyObject(vsMsg) == false){
			if(confirm(vsMsg) == false){
				return false;	
			}
		}
		return true;
	}

	async function retreiveWorkInfo(psDate){
		try{
			_e.progressBar.show();
			
			var reqInfo = {
				"userSeq" : _e.userInfo.getParameter("userSeq"),
				"workStartYmd" : psDate,
				"workEndYmd" : psDate
			}
			
			let data = await _e.sendCmd('retreiveWorkInfoCmd', reqInfo, []);
			
			if(data.loopData.length > 0){
				$("#txtWorkStartTime").text(_e.date.convertTimeToString(data.loopData[0].workStartTime, "HH : MM : SS"));
				$("#txtWorkEndTime").text(_e.date.convertTimeToString(data.loopData[0].workEndTime, "HH : MM : SS"));
				
				if(data.loopData[0].workStartApprCd == "T"){  //A(승인) T(반려) R(승인요청)
					$("#txtWorkStartTime").css("color", "red");
				}else if(data.loopData[0].workStartApprCd == "R"){
					$("#txtWorkStartTime").css("color", "blue");
				}else{
					$("#txtWorkStartTime").css("color", "white");
				}
				
				if(data.loopData[0].workEndApprCd == "T"){
					$("#txtWorkEndTime").css("color", "red");
				}else if(data.loopData[0].workEndApprCd == "R"){
					$("#txtWorkEndTime").css("color", "blue");
				}else{
					$("#txtWorkEndTime").css("color", "white");
				}
				
				if(data.loopData[0].workEndApprCd == "T" || data.loopData[0].workEndApprCd == "T"){
					_e.text.toast(_e.systemMassage["-111"], true)
				}
				
/*				if($("input[name=stampType]:checked").val() == "IN"){
					$("#txtRegistYmd").val(_e.date.convertDateToString(psDate, "YYYY-MM-DD"));
				}*/
				
				$("#txtWorkStartTime").attr("apprCd", data.loopData[0].workStartApprCd);
				$("#txtWorkEndTime").attr("apprCd", data.loopData[0].workEndApprCd);
			
			}else{
				$("#txtRegistYmd").val(_e.date.convertDateToString(psDate, "YYYY-MM-DD"));
				$("#txtWorkStartTime").text("-- : -- : --");
				$("#txtWorkEndTime").text("-- : -- : --");
				$("#txtWorkStartTime").css("color", "white");
				$("#txtWorkEndTime").css("color", "white");
				$("#txtWorkStartTime").attr("apprCd", "");
				$("#txtWorkEndTime").attr("apprCd", "");
			}	
			_e.progressBar.hide();
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}
			
	}

}())