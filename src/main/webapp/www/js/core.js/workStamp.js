//cordova ready
_e = window;
_e.isMobile = false;
_e.appTitle = "workStamp";

if ( navigator.userAgent.match(/Cordova/g) ) {
	_e.isMobile = true;
} 

_e.setUIText = async function(id){
	let textInfo = await _e.getUIText(id);
	let keys = Object.keys(textInfo);
	
	keys.forEach(function(key){
		
		if(["txtZipCd", "txtBasicAddr", "txtDtailAddr", "txtAddr"].indexOf(key) > -1){
			$("#"+key).prop("placeholder", textInfo[key])
		}else{
			$("#"+key).text(textInfo[key]);
		}

	});
}

_e.getUIText = function(id){
	return new Promise(function(resolve, reject){
		
		let lag = _e.getLanguage();
		
		if(localStorage.getItem("language") != null){
			lag = localStorage.getItem("language"); 
		}
		
		$.ajax({
			type : 'post',
			dataType : "json",
			url : "../json/"+id+".json",
			contentType : "application/json;charset=UTF-8",
			success:function(data){
				resolve(data[lag])
			},error:function(err){
				_e.text.toast("Setup failed.")
				reject(err);
			}
		});	
		
	});	
}

//공통 호출 cmd
_e.sendCmd = function(cmd, comm, loop){
	return new Promise(function(resolve, reject){
		
		//기본셋팅
		comm.userSeq = _e.userInfo.getParameter("userSeq");
		comm.language = _e.getLanguage();
		
		var reqData = {};
		reqData.commData = comm;
		reqData.loopData = loop;
		
		//var url = "localhost:8081/workStamp/"+ cmd;
		var url = "/workStamp/"+ cmd;
		//var url = "http://54.180.105.65:8080/"+cmd;

		$.ajax({
			type : 'post',
			dataType: 'json',
			url : url,
			data : JSON.stringify(reqData),
			contentType : "application/json;charset=UTF-8",
			success:function(data){
				
				if(data.rsltCd < 0){
					reject(data.errMsg);
				}else{
					resolve(data);	
				}
				
			},error:function(err){
				reject(err);
			}
		});
	
	});	
}

_e.workStamp = {
    // Application Constructor

    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
       // this.receivedEvent('deviceready');
	    document.addEventListener('backbutton',onBackKeyDown, true);
		console.log("onDeviceReady됨")
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
	  
        var parentElement = document.getElementById(id);
	    var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
	
};

function onBackKeyDown() {
	navigator.notification.confirm(_e.systemMassage["508"], onBackKeyDownMsg, 'workStamp', 'YES, NO');
}

function onBackKeyDownMsg(button) {
    if(button == 1) {
        navigator.app.exitApp();
    }
}

_e.nav = {
		
	load : function(){
		if($("nav").length !== 0){
			$.ajax({
				url : "navigator.html",
				type : "POST",
				dataType:"html",
				async: false,
				success : function(data){					
					$("nav").html(data);
							
					if(_e.userInfo.getParameter("adminYn") == "Y"){
						$(".adminPage").show();
					}else{
						$(".adminPage").hide();
					}
					
				},fail : function(err){
					console.log("nav.load fail :" + err);
				}
				
			});
		}
	}
};

_e.modal = {
	
	load : function(divId, targetPath, height){
		
		$.ajax({
			url : targetPath,
			type : "POST",
			dataType:"html",
			async: false,
			success : function(data){
				$(divId).html(data);
			
				//$("#myModal").css("height", height);
				//let diviceHeight = $("#app").height();
				//let margin = Math.floor((diviceHeight-height)/2);
	
				//$("#myModal").css("margin-top", margin);
				//$("#myModal").css("margin-bottom", margin);
				
			},fail : function(err){
				console.log("modal.load fail :" + err);
			}
			
		});
	
	}, show : function(vsTarget){
	
		$("."+vsTarget).modal({backdrop: 'static', keyboard: false}) ;
		
	},close : function(voEvent, voData, vsTarget, voCaller){
	
		$(`.${vsTarget}`).modal("hide");
		$(voCaller).attr("data-returns", voData);
		
		if(typeof(window[vsTarget+"_callback"]) == "function"){
			
			eval(vsTarget+"_callback(voEvent, voCaller)");			
		}

	}
	
};

_e.progressBar = {
	
	load : function(){
		
		$.ajax({
			url : "progressBar.html",
			type : "POST",
			dataType:"html",
			async: false,
			success : function(data){
				$("#progressBar").html(data);
				
				let width = $(".progressBar").width();
				let diviceHeight = $("#app").height();
				let diviceWidth = $("#app").width();
				
				$(".progressBar").css("height", width);
				$(".progressBar").css("margin-top", Math.floor((diviceHeight-width)/2));
				$(".progressBar").css("margin-left", Math.floor((diviceWidth-width)/2));
			
			},fail : function(err){
				console.log("modal.load fail :" + err);
			}
			
		});
	
	},show : function(){
		if($(".progressBar").css('display') == "none"){
			$(".progressBar").modal({backdrop: 'static', keyboard: false}) ;
			if($(".modal-backdrop").length > 1){
				$(".modal-backdrop")[1].className += " none";
				$(".modal-backdrop").css("z-index", 1050) //기본값(1040)+10;	
			}	
		}
	},hide : function(){
		$(".progressBar").modal('hide');
		$(".modal-backdrop").css("z-index", 1040) //기본값(1040)
	}
	
}


_e.text = {
	
	toast : async function(psMsg, isShowLong){
		
		if(_e.isMobile == false){
			alert(psMsg);
		}else{
			
			if(typeof(isShowLong) == "undefined"){
				isShowLong = false;  //기본값 short
			}
			
			window.plugins.toast.show(
            psMsg,
            isShowLong ? 'long' : "short",
            'bottom',
            function(a) {
                console.log('toast success: ' + a)
            },
            function(b) {
                console.log('toast error: ' + a)
            });
		}
	},
	alert : async function(psMsg){
		if(_e.isMobile == false){
			alert(psMsg);
		}else{
			navigator.notification.alert(psMsg, null, _e.appTitle, "OK");
		}
	
	},
	confirm : async function(psMsg){
		
		if(_e.isMobile == false){
			return confirm(psMsg);
		}else{
			navigator.notification.confirm(psMsg, function(buttonIndex){
				return buttionIndex == 0;	
			}, _e.appTitle, ["YES, NO"]);
		}
		
	}
	
}

_e.showError = {
	toast : function(err, defaultMsg) {		
		if(typeof(err) != "string") {
			err= defaultMsg;
		}
		_e.text.toast(err, true);
	},
	alert : function(err, defaultMsg) {		
		if(typeof(err) != "string") {
			err= defaultMsg;
		}
		_e.text.alert(err);
	}
}


_e.urlInfo = {
	
	getParameter : function(key){
		
		var href =  window.location.href;
		var queryString = href.split('?');
		
		if(queryString.length > 1){
		
			var params = queryString[1].split('&');
			var size= params.length;
			
			var queryStringObj = {};
			
			for(var i = 0; i < size; i++){
				var param = params[i].split('=');
				queryStringObj[param[0]] = decodeURIComponent(param[1]);
			}
			
			return (key == null) ? queryStringObj : queryStringObj[key];
		}else{
			return null;
		}
		
	}
	
}

var MAX_POSITION_ERRORS_BEFORE_RESET = 3,
     MIN_ACCURACY_IN_METRES = 20,
     positionWatchId = null, 
     watchpositionErrorCount = 0;

function clearWatch(){
    navigator.geolocation.clearWatch(positionWatchId);
}

_e.gps = {
	
	getPosition : function(){
		return new Promise(function(resolve,reject){
			
			if(_e.isMobile == false){
				var testPosition = {};
				
				if(_e.getLanguage() =="jp"){
					testPosition.coords	= {
						"latitude" : 35.6809591
						,"longitude" : 139.7673068
					};
				}else{
					testPosition.coords	= { 
						"latitude" : 35.0234481913092
						,"longitude" : 126.794743140574
					};
				}
				resolve(testPosition);	
			}else{
				
				window.plugins.mockgpschecker.check(function(check){
					
					if(check.isMock){
						reject(_e.systemMassage["-118"]);
						return;
					}
					
					positionWatchId = navigator.geolocation.watchPosition(function(position){
					    clearWatch();  // gps 조회 시간 초기화
						resolve(position);
					}, function(err){
						watchpositionErrorCount++;
    					if (err.code == 3 && watchpositionErrorCount >= MAX_POSITION_ERRORS_BEFORE_RESET) {        
        					clearWatch();
        					watchpositionErrorCount = 0;
    					}
						clearWatch();
						reject(_e.systemMassage["-116"]);
					}, { maximumAge: 60000, timeout: 5000, enableHighAccuracy: false});
						
				},function(){
					reject(_e.systemMassage["-118"]);
					return;
				});
			}
			
		});		
	}, getDistance :  function(lat1,lng1,lat2,lng2){
		 function deg2rad(deg) {
			 return deg * (Math.PI/180);
		 } 
		var R = 6371; // Radius of the earth in km 
		var dLat = deg2rad(lat2-lat1); // deg2rad below 
		var dLon = deg2rad(lng2-lng1);
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km 
		return Math.floor(d*1000);  // Distance in meter
	}

}

_e.sns = {
	
	login : function(psSnsType){
		return new Promise(function(resolve,reject){
			var result = {};
			
			result.snsType  = psSnsType;
	
			if(_e.isMobile == false){
				result.snsType = "LOCAL";
			}
			
			switch(result.snsType){
    		
				case "LOCAL" : { //내가 개발 크롬으로 돌릴 때  //1234(관리자), 12345(사용자)
				    result.snsId = "12345";
					resolve(result);
				} break;
    			case "FACEBOOK" :{
    				 CordovaFacebook.login({
 	    	            permissions: ['email', 'user_likes'],
 	    	            onSuccess: function(data) {
							result.snsId = data.userID;
 	    	                resolve(result);
 	    	            },
 	    	            onFailure: function(error) {
 	    	                reject(error);
 	    	            }
 	    	        });
    			} break; 
    			case "KAKAO" : {
					KakaoCordovaSDK.login(null,
					    function (data) {
						   result.snsId = String(data.id);
						   resolve(result);
					    },
					    function (error) {
					       reject(error);
					    }
					);
									
	    		} break;
    			case "LINE" : {
					lineLogin.initialize({ channel_id: "1655629253" });//어플아이디
					lineLogin.login(
        				function(data) {
							result.snsId = data.userID;
          					resolve(result);
        				}, function(error) {
          					reject(error);
        				});
    			} break; 
    		}

		});	
	} 
	,logout : function(){
		return new Promise(function(resolve, reject){
			let snsType = _e.userInfo.getParameter("snsType");
			localStorage.removeItem("userInfo");
		
			if(_e.isMobile == false){
				snsType = "LOCAL";
			}

			switch(snsType){
				case "FACEBOOK" : {
					CordovaFacebook.logout({
					   onSuccess: function() {
					     location.href = "index.html";
					   }
					});		
				} break;
				case "KAKAO" : {
					KakaoCordovaSDK.logout( function (data) {
						location.href = "index.html";
				    });
				} break;	
				case "LINE" : {
					lineLogin.logout(
        				function(data) {
							location.href = "index.html";
        				});
				} break;
				case "LOCAL" : {
					location.href = "index.html";
				} break;
			}
			
			
		});
	}
}

_e.permission = {

	getPermission : function(){
		
		if(_e.isMobile){
			var permissions = cordova.plugins.permissions;
		
			var list = [
				   permissions.READ_EXTERNAL_STORAGE 
				  ,permissions.ACCESS_COARSE_LOCATION
				  ,permissions.ACCESS_FINE_LOCATION
				  //permissions.ACCESS_LOCATION_EXTRA_COMMANDS
				];
		
			permissions.hasPermission(list
				,function(status){
					if( !status.hasPermission ) {
	    				permissions.requestPermissions(list
							,function(status) {
	        					if( !status.hasPermission ){
									_e.text.toast("권한이 허용되지 않아 어플을 이용할 수 없습니다.", true);
									 navigator.app.exitApp();
								};
	      					},function(error){
								_e.text.toast("권한요청 중 알 수 없는 오류가 발생하였습니다.", true);
								 navigator.app.exitApp();	
							});	
	  			 	}
				},function(error){
					_e.text.toast("권한확인 중 알 수 없는 오류가 발생하였습니다.", true);
					 navigator.app.exitApp();
				});
			}
		
	}
	
}

_e.deafaultTime = "--:--:--";

_e.date = {
	
	convertDateToString : function(date, form){
		
		var year;
		var month;
		var day;
		
		if(typeof(date) == "string"){
			var vsDate = "";
			for(var i = 0; i < date.length ; i++){
				if(Number.isNaN(Number.parseInt(date[i])) == false){
					vsDate += date[i];	
				}
			}
			year = vsDate.length == 6 ? vsDate.substring(0,2) : vsDate.substring(0,4);
		    month = vsDate.length == 6 ? vsDate.substring(2,4) : vsDate.substring(4,6);
		    day = vsDate.length == 6 ? vsDate.substring(4,6) : vsDate.substring(6,8);
		}else{
			year = ''+date.getFullYear();
			month = '' + (date.getMonth() + 1);
			day = '' + date.getDate();
		}
		
		if (month.length < 2){
			month = '0' + month;
		}
	
		if (day.length < 2){
			day = '0' + day;
		} 
	   	
        form = form.replaceAll("yyyy", year);
		form = form.replaceAll("YYYY", year);
		form = form.replaceAll("mm", month);
		form = form.replaceAll("MM", month);
	 	form = form.replaceAll("dd", day);
        form = form.replaceAll("DD", day);
		
		return form;	
	},convertTimeToString : function(time, form){
		var hh;
		var mm;
		var ss;
		
		if(typeof(time) != "object" && Number.isInteger(time) == false && $.isEmptyObject(time) == true){
			hh = "--";
			mm = "--";
			ss = "--";
		}else if(typeof(time) == "string"){
			var vsTime = "";
			for(var i = 0; i < time.length ; i++){
				if(Number.isNaN(Number.parseInt(time[i])) == false){
					vsTime += time[i];	
				}
			}
			hh = vsTime.substring(0,2);
		    mm = vsTime.substring(2,4);
		    ss = vsTime.substring(4,6);

		}else if(typeof(time) == "number"){
			hh = String(Math.floor(time/60));
		    mm = String(time%60);
		    ss = "00";
		}else{
			hh = '' + time.getHours();
			mm = '' + time.getMinutes();
			ss =  '' + time.getSeconds();
		}
		
		if (hh.length < 2){
			hh = '0' + hh;
		}
		if (mm.length < 2){
			mm = '0' + mm;
		} 
		if (ss.length < 2){
			ss = '0' + ss;
		} 
		
		form = form.replaceAll("hh", hh);
		form = form.replaceAll("HH", hh);
		form = form.replaceAll("mm", mm);
		form = form.replaceAll("MM", mm);
	 	form = form.replaceAll("ss", ss);
        form = form.replaceAll("SS", ss);
		
		return form;	
	
	}

}

_e.userInfo = {
	
	getParameter : function(key){
		
		if(localStorage.getItem("userInfo") == null){
			return null;
		}
		
		var param = JSON.parse(localStorage.getItem("userInfo"));
		
		 if($.isEmptyObject(key)){
			return param;
		 }else{
			return (Object.keys(param)).indexOf(key) < 0 ? null : param[key];	
		 }
	
	}
		
}

_e.getLanguage = function(){
	return localStorage.getItem("language");
}

_e.setLanguage = function(){
	return new Promise(function(resolve, reject){
		
		if(_e.isMobile == false){
			localStorage.setItem("language", "kr");
			resolve(true);
		}else{
			navigator.globalization.getLocaleName( // locale.value
	    		function (locale) {
					let value;
					if(locale.value == "ja-JP"){
						value = "jp";
					}else{
						value = "kr";
					}
					localStorage.setItem("language", value);
					resolve(true);
				}
			);	
		}
	
	});	
}

_e.systemMassage = {
	 	"-404" :  getLanguage() == "jp" ? "サーバーとの通信に失敗しました"  : "서버와의 통신에 실패하였습니다"
	 	,"-101" : getLanguage() == "jp" ?  "氏名を入力してください" : "성명을 입력해 주세요"
	 	,"-102" : getLanguage() == "jp" ?  "勤務先を選択してください" : "근무지를 선택해 주세요"
		,"-103" : getLanguage() == "jp" ?  "会社名を入力してください" : "회사명을 입력해 주세요"
		,"-104" : getLanguage() == "jp" ?  "勤務先の住所情報を登録してください" : "근무지의 주소정보를 등록해 주세요."
		,"-105" : getLanguage() == "jp" ?  "現在のロケーションの郵便番号情報が存在しません。\n郵便番号を入力するか、アドレス検索をご利用ください" : "현재 위치에 대한 우편번호 정보가 존재하지 않습니다.\n우편번호를 입력하거나 주소검색을 이용해주세요."
		,"-106" : getLanguage() == "jp" ?  "キーワードは2文字以上で入力してください" : "검색어는  2자리 이상으로 입력해 주세요."
		,"-107" : getLanguage() == "jp" ?  "出勤や退勤を選択した後、登録してください" : "출근 혹은 퇴근을 선택 후 등록해 주세요."
		,"-108" : getLanguage() == "jp" ?  "出勤時間を登録した後、退勤登録をしてください" : "출근시간을 등록 후 퇴근등록을 해주세요."
		,"-109" : getLanguage() == "jp" ?  "退勤日が勤務日よりも前です。確認した後、再入力してください" : "퇴근일이 근무일보다 이전입니다. 확인 후 재입력하시기 바랍니다."
		,"-110" : getLanguage() == "jp" ?  "すでに退勤登録されています。\n通勤時間を変更する場合は、管理者にお問い合わせしてください" : "이미 퇴근등록이 되었습니다. \n출퇴근시간을 변경해야 하는 경우 관리자에게 문의해주세요."
		,"-111" : getLanguage() == "jp" ?  "管理者から承認要請した通勤登録が返戻されました" : "관리자로부터 승인요청한 출퇴근기록이 반려되었습니다."
		,"-112" : getLanguage() == "jp" ?  "検索結果がありません" : "검색결과가 없습니다."
		,"-113" : getLanguage() == "jp" ?  "承認するラインをチェックしてください" : "승인처리할 정보를 체크해주세요."
		,"-114" : getLanguage() == "jp" ?  "ログインがキャンセルされました" : "로그인이 취소되었습니다."
		,"-115" : getLanguage() == "jp" ?  "現在位置と{0}ⅿほど差があります" : "현재위치와 {0}ⅿ정도 차이가 있습니다."
		,"-116" : getLanguage() == "jp" ?  "位置情報獲得に失敗しました" : "위치정보획득에 실패하였습니다."
		,"-117" : getLanguage() == "jp" ?  "登録可能地点から{0}ⅿほど離れています" : "등록가능지점으로부터 {0}m정도 떨어져있습니다."
		,"-118" : getLanguage() == "jp" ?  "模擬位置アプリの動作が確認され、サービスを利用することができません" : "모의위치앱 동작이 확인되어 서비스를 이용할 수 없습니다."
		,"-119" : getLanguage() == "jp" ?  "住所を選択してください" : "주소를 선택해 주세요."
		,"-120" : getLanguage() == "jp" ?  "特殊文字は入力 できません" : "특수문자를 입력 할수 없습니다."
		,"-121" : getLanguage() == "jp" ?  "[{0}]のような特殊文字は入力できません" : "[{0}]와(과) 같은 특정문자로 검색할 수 없습니다."
		,"-122" : getLanguage() == "jp" ?  "処理する行を選択してください" : "처리할 행을 선택해 주세요."
		,"-123" : getLanguage() == "jp" ?  "ダウンロード可能な情報がありません" : "다운로드 가능한 정보가 없습니다."
		,"-124" : getLanguage() == "jp" ?  "ダウンロードに失敗しました" : "다운로드에 실패하였습니다."
		,"501" : getLanguage() == "jp" ?  "郵便番号や詳細住所を作成せずに登録しますか？" : "우편번호와 상세주소를 작성하지 않고 등록하시겠습니까?"
		,"502" : getLanguage() == "jp" ?  "郵便番号を作成せずに登録しますか？" : "우편번호를 작성하지 않고 등록하시겠습니까?"
		,"503" : getLanguage() == "jp" ?  "詳細住所を作成せずに登録しますか？" : "상세주소를 작성하지 않고 등록하시겠습니까?"
	 	,"504" : getLanguage() == "jp" ?  "位置情報を利用して登録する場合、承認要請事項は消えます。\n登録しますか？ ": "위치기반으로 등록 시 승인요청사항은 삭제됩니다.\n등록하시겠습니까?"
		,"505" : getLanguage() == "jp" ?  "承認待ちです。\n再登録しますか？" : "승인대기 중 입니다.\n재등록 하시겠습니까?"
		,"506" : getLanguage() == "jp" ?  "すでに出勤登録をしました。\n再登録しますか？" : "이미 출근등록을 하였습니다.\n재등록 하시겠습니까?"
		,"507" : getLanguage() == "jp" ?  "すでに退勤登録をしました。\n再登録しますか？" : "이미 퇴근등록을 하였습니다.\n재등록 하시겠습니까?"
		,"508" : getLanguage() == "jp" ?  "アプリを終了しますか？" : "앱을 종료하시겠습니까?"
		,"1001" : getLanguage() == "jp" ?  "会員登録に成功しました。メインページに移動します" : "회원가입에 성공하였습니다.메인페이지로 이동합니다"
		,"1002" : getLanguage() == "jp" ?  "通勤登録はマップ上の半径(150m)内で可能です" : "출퇴근 등록은 지도상의 반경(150m) 안에서 가능합니다."
		,"1003" : getLanguage() == "jp" ?  "通勤登録はマップ上の半径(150m)内で可能です\n実際の位置との差がある場合、マーカーを移動させてください" : "출퇴근 등록은 지도상의 반경(150m) 안에서 가능합니다.\n실제 위치와 차이가 있다면 마커를 이동시켜주세요."
		,"1004" : getLanguage() == "jp" ? "登録しました" : "등록되었습니다"
		,"1005" : getLanguage() == "jp" ? "ダウンロードに成功しました" : "다운로드에 성공하였습니다."
}
