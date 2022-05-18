(function (){
	_e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
	_e.progressBar.load();
   
  	$(window).on("load", function() {
		_e.setUIText("retreiveApprList");
		var toDay = new Date();
		//var dayNo = Number(toDay.getDay());
		
		//var to = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()-dayNo);
		//var from = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()+(6-dayNo));
		var to = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()-6);
		var from  = toDay;
	
		$("#txtStartWorkYmd").val(_e.date.convertDateToString(to, "YYYY-MM-DD"));
		$("#txtEndWorkYmd").val(_e.date.convertDateToString(from, "YYYY-MM-DD"));
		
		createTable();
    }); 

	$("#txtStartWorkYmd").on("change", () =>{
		var targetYmd = new Date($("#txtStartWorkYmd").val());
		targetYmd.setDate(targetYmd.getDate()+6)
		
		$("#txtEndWorkYmd").val(_e.date.convertDateToString(targetYmd, "YYYY-MM-DD"));	
	});
	
	$("#txtEndWorkYmd").on("change", () =>{
		var targetYmd = new Date($("#txtEndWorkYmd").val());
		targetYmd.setDate(targetYmd.getDate()-6)
		
		$("#txtStartWorkYmd").val(_e.date.convertDateToString(targetYmd, "YYYY-MM-DD"));	
	});

	$("#btnSearch").on("click", async function(e){
		try{
			_e.progressBar.show();
			fncReset();
		
			var reqInfo = {
				"workStartYmd" : _e.date.convertDateToString($("#txtStartWorkYmd").val(), "YYYYMMDD"),
				"workEndYmd" : _e.date.convertDateToString($("#txtEndWorkYmd").val(), "YYYYMMDD"),
				"apprCd" : $("input[name='searchType']:checked").val()
			}
		
			var response = await _e.sendCmd("retreiveApprListCmd",reqInfo,[]);
			_e.progressBar.hide();
			if(response.loopData.length == 0){
				_e.text.toast(_e.systemMassage["-112"], true);
				return;
			}
		
			for(var i = 0; i < response.loopData.length; i++){
				var workIn = _e.getLanguage() == "jp" ? "出勤" : "출근";
				var workOut = _e.getLanguage() == "jp" ? "退勤" : "퇴근";
				response.loopData[i].stampType = response.loopData[i].stampType == "IN" ? workIn : workOut;
				$("#apprTable").addRowData(i, response.loopData[i]);
			}
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		}
	});
	
	$('.radioGroup').click(function(e){

		var apprCd = $(e.target).val(); 
    	
		if(apprCd == 'R'){	
			$("#btnRegist_A").removeClass('col-xs-12');
			$("#btnRegist_T").removeClass('col-xs-12');
			$("#btnRegist_A").addClass('col-xs-6');
			$("#btnRegist_T").addClass('col-xs-6');
			
			$("#btnRegist_A").show();
			$("#btnRegist_T").show();
		}else if(apprCd == 'A'){
			$("#btnRegist_A").hide();
			$("#btnRegist_T").hide();
		}else if(apprCd == 'T'){
			
			$("#btnRegist_A").removeClass('col-xs-6');
			$("#btnRegist_A").addClass('col-xs-12');
	
			$("#btnRegist_A").show();
			$("#btnRegist_T").hide();
		}

	});
	
/*	$("#cbxApprCd").on("change", function(e){
		
		var apprCd = $("#cbxApprCd").val();
		
		if(apprCd == 'R'){
			
			$("#btnRegist_A").removeClass('col-xs-12');
			$("#btnRegist_T").removeClass('col-xs-12');
			$("#btnRegist_A").addClass('col-xs-6');
			$("#btnRegist_T").addClass('col-xs-6');
			
			$("#btnRegist_A").show();
			$("#btnRegist_T").show();
		}else if(apprCd == 'A'){
			$("#btnRegist_A").hide();
			$("#btnRegist_T").hide();
		}else if(apprCd == 'T'){
			
			$("#btnRegist_A").removeClass('col-xs-6');
			$("#btnRegist_A").addClass('col-xs-12');
	
			$("#btnRegist_A").show();
			$("#btnRegist_T").hide();
		}
		
	});*/
	
	$(".btnApprRegist").on("click",async function(e){
		
		try{
			var selectRows = $("#apprTable").getGridParam('selarrrow');
			var apprCd = $(this).data("target");
			var loopData = [];
			
			if(selectRows.length ==0){
				_e.text.toast(_e.systemMassage["-122"]);
				return;
			}
			_e.progressBar.show();
			
			for(var i = 0; i  < selectRows.length; i++){
				var idx = selectRows[i];
				var rowData = $("#apprTable").getRowData(idx);
				var data = {
					"userSeq" : rowData.userSeq
					,"stampType" : ["출근", "出勤"].indexOf(rowData.stampType) > -1 ? "IN" : "OUT"
					,"workTime" :  rowData.workDateTime
					,"workYmd" : _e.date.convertDateToString(rowData.workYmd, "YYYYMMDD")
					,"apprCd" : apprCd
				};
				loopData.push(data)
			}
			let response = await _e.sendCmd('registApprInfoCmd', {}, loopData);
			$("#apprTable").clearGridData();
			_e.progressBar.hide();
			_e.text.toast(_e.systemMassage["1004"]);
		}catch(err){
			_e.progressBar.hide();
			_e.showError.toast(err, _e.systemMassage["-404"]);
		}
		
	});
	
	function fncReset(){
		$("#apprTable").clearGridData();
		$("#txtWorkStamp").val("");
		$("#txtWorkYmd").val("");
		$("#txtWorkTime").val("");
		$('#cbxNonUseAutoCd').val("").prop("selected",true);
	}

	function createTable(){
		
		var height = $("#groundField").outerHeight() - $("#top").outerHeight() - $("#divRegist").outerHeight() - 90;
		var width = $("#groundField").width() - 20;
		var percent = Math.floor((width-30)/10);
		
		var voColNmList;
		
		if(_e.getLanguage() =="jp"){
			voColNmList = ["ユーザーナンバー", "氏名", "登録区分", "登録時間", "登録時間", "時間日", "手記入力事由"];
		}else{
			voColNmList = ["사용자일련번호", "성명", "등록구분", "등록시간", "등록시간", "등록일", "수기입력사유"];
		}
		
		$("#apprTable").jqGrid({
			data : [],
			datatype : "local",
			height : height,
			width : width,
			shrinkToFit : false,
			multiselect : true,
			multiselectWidth : 30,
			colNames : voColNmList,
			colModel : [
			{
				name : 'userSeq',
				index : 'userSeq',
				align : 'center',
				editable : false,
				width : 0,
				hidden : true
			},{
				name : 'userNm',
				index : 'userNm',
				align : 'center',
				editable : false,
				width : 3*percent
			},{
				name : 'stampType',
				index : 'stampType',
				align : 'center',
				editable : false,
				width : 3*percent
			},{
				name : 'workDateTime',
				index : 'workDateTime',
				align : 'left',
				editable : false,
				width : 4*percent
			},{
				name : 'workTime',
				index : 'workTime',
				align : 'left',
				editable : false,
				width : 0,
				hidden : true
			},{
				name : 'workYmd',
				index : 'workYmd',
				align : 'left',
				editable : false,
				width : 0,
				hidden : true
			},{
				name : 'nonUseAutoCd',
				index : 'nonUseAutoCd',
				align : 'left',
				editable : false,
				width : 0,
				hidden : true
			}]
			,beforeSelectRow : function(rowId, e){
				var rowData = $(this).getRowData(rowId);
			
				$("#txtWorkStamp").val(rowData.stampType);
				$("#txtWorkYmd").val(_e.date.convertDateToString(rowData.workYmd, "YYYY-MM-DD"));
				$("#txtWorkTime").val(rowData.workTime);
				$('#cbxNonUseAutoCd').val(rowData.nonUseAutoCd).prop("selected",true);
				
				return e.target.localName === "input";
			}
			
		});
				
	}

}());
