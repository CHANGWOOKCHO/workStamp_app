(function(){
	
	var _e = this;
	var modalColler = null;
	var compList = [];

	$('.modalSearchCompany').on("show.bs.modal", function(e){
		_e.setUIText("modalSearchCompany");
		modalColler = e.relatedTarget;
		$("#txtSearch").val('');
		$("input:radio[name = 'searchType']:input[value='1']").prop("checked", true);
	});
	
	$('.modalSearchCompany').on("hidden.bs.modal", function(e){
		$(".compInfo").remove();  //tableRow 초기화
	});
	

	 $("#btnSearchCompany").click(async function(e){
		
		var vsSearchKeyWord = $("#txtSearch").val().trim();
		var vsSearchType = $("input[name='searchType']:checked").val();
		
		try{
			if(vsSearchType != "3" && vsSearchKeyWord.length < 2){  //검색어가  2자리 이하라면
				_e.text.alert(_e.systemMassage["-106"]);
				return;
			}
			
			_e.progressBar.show();
			
			let longitude = 0;
			let latitude = 0;
	
			if(vsSearchType == "3"){
				let position = await _e.gps.getPosition();
				longitude =position.coords.longitude;
				latitude = position.coords.latitude 
			}

			var searchInfo= {
				"searchType" : vsSearchType,
				"searchKeyWord" : vsSearchKeyWord,
				"longitude" : longitude,
				"latitude" : latitude 
			}
			
			let response = await _e.sendCmd('retrieveCompanyInfoCmd', searchInfo, []);
			
			addRowData(response);
			_e.progressBar.hide();
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}
		
	  });

	$("#btnConfirm").click(function(e){
		
		var activeRow = $(".activeRow");;  
		
		if(activeRow.length == 0){
			alert(_e.systemMassage["-102"]);
			return;
		}
		
		var rowData = JSON.stringify(compList[Number(activeRow[0].id)]);
		
		_e.modal.close(e,rowData,"modalSearchCompany", modalColler);

	});

	$('.radioGroup').click(function(e){
		var vsSearchType = $(e.target).next().text(); 
    	$("#lblSearch").text(vsSearchType);
		$("#txtSearch").val("");
		$("#txtSearch").prop("disabled", $(e.target).val() == "3"); //현재위치에 대해서는 입력기능 비활성화
	});
	
	$("#companyTable").on("click", ".compInfo", function(e){  //클릭 이벤트 설정
		var activeRow = $(e.target).parents("tr");
		$(".compInfo").removeClass("activeRow") //일자에서 active 클레스 삭제
    	$("#"+activeRow[0].id).addClass("activeRow"); //선택된 일자만 active 클레스 설정
	});

	function addRowData(result){
		
		var documentArray  = [];
         
        $(".compInfo").remove();  //근무처정보 초기화
		compList = [];
	
		var lblAdminNm = _e.getLanguage() == "jp" ? "管理者" : "관리자";
		var lblTeamNm = _e.getLanguage() == "jp" ? "勤務先" : "근무처";
		var lblAddr = _e.getLanguage() == "jp" ? "住所" : "주소";
					
		for(var i=0; i < result.loopData.length; i++)
		{
			var tr = $("<tr>", {id : i, class : "compInfo"});
			var td = $("<td>");
			
		    var row1 = $("<div>",{class : "row"});
			var row2 = $("<div>",{class : "row"});
			var row3 = $("<div>",{class : "row"});
			
			var th1 = $("<div>",{class : "col-xs-3 th"});
			var tag1 = $("<span>",{class : "tag", text : lblAdminNm});
			var td1 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].adminNm});
			
			var th2 = $("<div>",{class : "col-xs-3 th"});
			var tag2 = $("<span>",{class : "tag", text : lblTeamNm});
			var td2 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].compNm +"/"+ result.loopData[i].teamNm});
			
			var th3 = $("<div>",{class : "col-xs-3 th"});
			var tag3 = $("<span>",{class : "tag", text : lblAddr});
			var td3 = $("<div>",{class : "col-xs-9 td", text : result.loopData[i].basicAddr+" "+result.loopData[i].dtailAddr});
			
			
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
			
			compList[i] = result.loopData[i];
		}			

		$("#companyTable").append(documentArray);			
					
	}

}())