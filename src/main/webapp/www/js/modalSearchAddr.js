(function(){
	
	var _e = this;
	var beforeKeyWord = "";
	var modalColler = null;
	var addrList = [];
	
	$('.modalSearchAddr').on("show.bs.modal", function(e){
		modalColler = e.relatedTarget;
		_e.setUIText("modalSearchAddr");
/*		if(_e.getLanguage() == "jp"){
			$("#txtAddr").prop("type", "number");
		}else{
			$("#txtAddr").prop("type", "text");
		}*/
		
	});
	
	$('.modalSearchAddr').on("hidden.bs.modal", function(e){
		 $(".addrInfo").remove();  //주소정보 초기화
		 $("#txtAddr").val("");
	});
	
	$("#prev").click(function(e){
		var vnCurrentPage  = Number($("#nowPage").text());
		
		if(vnCurrentPage == 1){
			return;
		}else{
			vnCurrentPage--;
			$("#nowPage").text(vnCurrentPage);
			$("#btnSearchAddr").trigger("click");
		}
	});
	
	$("#next").click(function(e){
		var vnCurrentPage  = Number($("#nowPage").text());
		var vnTotalPage  = Number($("#totalPage").text());
	
		if(vnCurrentPage == vnTotalPage){
			return;
		}else{
			vnCurrentPage++;
			$("#nowPage").text(vnCurrentPage);
			$("#btnSearchAddr").trigger("click");
		}
	});
	
	$("#btnSearchAddr").click(async function(e){
	
		var vnCurrentPage  = Number($("#nowPage").text());
		var vsSearchKeyWord = $("#txtAddr").val().trim();
			
		try{
			if(checkSearchedWord(vsSearchKeyWord) == false){
				return;
			}
			_e.progressBar.show();
			
			if(beforeKeyWord == "" || beforeKeyWord != vsSearchKeyWord){ //새로운 검색 조건 입력 시
				$("#nowPage").text(1);
				vnCurrentPage = 1;
			}
		
			let searchInfo = {
				"currentPage" : vnCurrentPage
				,"countPerPage" : 5
				,"keyword" :  vsSearchKeyWord
			};
			
			let response = await _e.sendCmd('retrieveAddrCmd', searchInfo, []);
		
			addRowData(response);
			$("#nowPage").text(response.commData.currentPage);
			$("#totalPage").text(response.commData.totalPage);
			beforeKeyWord = vsSearchKeyWord; //페이징 처리 유지
			_e.progressBar.hide();
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}

	});
	
	$("#btnConfirm").click(async function(e){
		
		var activeRow = $(".activeRow");
		
		if(activeRow.length == 0){
			_e.text.alert(_e.systemMassage["-119"]);
			return;
		}
		  
		var rowData = addrList[Number(activeRow[0].id)];
		var longitude = 0;  //deafault value
		var latitude = 0;   //deafault value

		try{
			_e.progressBar.show();
			
			 if($.isEmptyObject(rowData.x)){
				
				var searchInfo = {
					"keyword" : rowData.roadAddr
				}
				let response =  await _e.sendCmd('retrieveGeolocationCmd', searchInfo, []); //GIS 구하기
				longitude = response.commData.x;
				latitude =response.commData.y;
				
			}else{
				longitude = rowData.x;
				latitude = rowData.y;
			}
			
			var voParam = JSON.stringify({
				"zipCd" : rowData.zipNo
				,"basicAddr" : rowData.roadAddrPart1
				,"dtailAddr" : rowData.roadAddrPart2
				,"longitude" : longitude
				,"latitude" : latitude
			});
			_e.progressBar.hide();	
			_e.modal.close(e,voParam,"modalSearchAddr", modalColler);
		
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
			
			var voParam = JSON.stringify({
				"zipCd" : rowData.zipNo
				,"basicAddr" : rowData.roadAddrPart1
				,"dtailAddr" : rowData.roadAddrPart2
				,"longitude" : longitude
				,"latitude" : latitude
			});
			_e.modal.close(e,voParam,"modalSearchAddr", modalColler);
		}
			
	});
	
	$("#addrTable").on("click", ".addrInfo", function(e){  //클릭 이벤트 설정
		var activeRow = $(e.target).parents("tr");
		$(".addrInfo").removeClass("activeRow") //일자에서 active 클레스 삭제
    	$("#"+activeRow[0].id).addClass("activeRow"); //선택된 일자만 active 클레스 설정
	});
	
	function checkSearchedWord(obj){
	
		if(obj.length < 2){
			_e.text.toast(_e.systemMassage["-106"]);
			return false;
		}	
	
		var pattern_spc = /[%=><]/ ; // 특수문자

		if(pattern_spc.test(obj) == true){
			_e.text.toast(_e.systemMassage["-120"]) ;
			return false;
		}
		
		//특정문자열(sql예약어의 앞뒤공백포함) 제거
		//sql 예약어
		var sqlArray = new Array("OR", "SELECT", "INSERT", "DELETE", "UPDATE", "CREATE", "DROP", "EXEC","UNION",  "FETCH", "DECLARE", "TRUNCATE");
		
		var regex;
		for(var i=0; i<sqlArray.length; i++){
			regex = new RegExp( sqlArray[i] ,"gi") ;
			
			if (regex.test(obj.value) ) {
				_e.text.toast(_e.systemMassage["-121"].replaceAll("{0}", sqlArray[i]));
				obj.value =obj.value.replace(regex, "");
				return false;
			}
		}
	
		return true ;
	}
	
	function addRowData(result){
		
		var documentArray  = [];
         
        $(".addrInfo").remove();  //주소정보 초기화
		addrList = []
		
		var lblZipNo = _e.getLanguage() == "jp" ? "郵便番号" : "우편번호";
		var  lblRoadAddrPart1 = _e.getLanguage() == "jp" ? "基本住所" : "기본주소";
		var  lblRoadAddrPart2 = _e.getLanguage() == "jp" ? "詳細住所" : "상세주소";
					
		for(var i=0; i < result.loopData.length; i++)
		{
			var tr = $("<tr>", {id : i, class : "addrInfo"});
			var td = $("<td>");
			
		    var row1 = $("<div>",{class : "row"});
			var row2 = $("<div>",{class : "row"});
			var row3 = $("<div>",{class : "row"});
			
			var th1 = $("<div>",{class : "col-xs-3 th"});
			var tag1 = $("<span>",{class : "tag", text : lblZipNo});
			var td1 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].zipNo});
			
			var th2 = $("<div>",{class : "col-xs-3 th"});
			var tag2 = $("<span>",{class : "tag", text : lblRoadAddrPart1});
			var td2 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].roadAddrPart1});
			
			var th3 = $("<div>",{class : "col-xs-3 th"});
			var tag3 = $("<span>",{class : "tag", text : lblRoadAddrPart2});
			var td3 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].roadAddrPart2});
			
			
			th1.append(tag1);
			row1.append(th1);
			row1.append(td1);
			
			th2.append(tag2);
			row2.append(th2);
			row2.append(td2);
			
			th3.append(tag3);
			row3.append(th3);
			row3.append(td3);
			
			td.append(row1);
			td.append(row2);
			td.append(row3);
			
		    tr.append(td);

			documentArray.push(tr);
			
			addrList[i] = result.loopData[i];
		}			
	
		$("#addrTable").append(documentArray);			
					
	}
		
}())