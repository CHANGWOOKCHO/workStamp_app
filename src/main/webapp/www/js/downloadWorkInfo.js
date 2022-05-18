(function(){
	
	_e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
	_e.progressBar.load();  //progressBar셋팅
	_e.modal.load("#divModalEmpWorkinfo", "modalEmpWorkList.html"); //주소검색 팝업 셋팅
	_e.empWorkList =[];
	_e.startYmd;

	$(window).load(function() {
		
		_e.setUIText("downloadWorkInfo");
		
		var toDay = new Date();
		var dayNo = Number(toDay.getDay());
		
		var to = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()-dayNo);
		var from = new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate()+(6-dayNo));
		
		$("#txtStartWorkYmd").val(_e.date.convertDateToString(to, "YYYY-MM-DD"));
		$("#txtEndWorkYmd").val(_e.date.convertDateToString(from, "YYYY-MM-DD"));
		
		createGrid();
				
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
	
	$("#btnDownLoad").on("click", async ()=>{

			try{
			/*	if(_e.isMobile == false){
					return;
				}*/
			var rowCnt = $("#empList").getGridParam("reccount");
			
			if(rowCnt ==0){
				_e.text.toast(_e.systemMassage["-123"]);
				return;
			}
			_e.progressBar.show();
			let fileNm = _e.date.convertDateToString($('#txtStartWorkYmd').val(), 'YYYYMMDD')+"_"+_e.date.convertDateToString($('#txtEndWorkYmd').val(), 'YYYYMMDD')
			let content = coverntGridParamToString();
		
			await download(fileNm, content);	
			_e.progressBar.hide();
			_e.text.toast(_e.systemMassage["1005"], true);
							
			}catch(err){
			_e.progressBar.hide();
			_e.showError.toast(err, _e.systemMassage["-124"]);
			}
			
	});
	
	$("#btnSearch").on("click", async ()=>{
		
		try{
			var date = {
				"startWorkYmd" : _e.date.convertDateToString($("#txtStartWorkYmd").val(), "YYYYMMDD")
				,"endWorkYmd" : _e.date.convertDateToString($("#txtEndWorkYmd").val(), "YYYYMMDD")
			}
			$("#empList").clearGridData();
			_e.empWorkList = [];
			
			_e.progressBar.show();
			let response = await _e.sendCmd("retrieveEmpWorkInfo", date, []);
			let loopData = response.loopData;
			_e.empWorkList = loopData;
			
			if(loopData.length == 0){
				_e.text.taost(_e.systemMassage["-122"]);
				return;
			}
			_e.startYmd = _e.date.convertDateToString($("#txtStartWorkYmd").val(), "YYYYMMDD");
			for(let i = 0; i < loopData.length; i++){
				loopData[i].totalWorkTime = _e.date.convertTimeToString(loopData[i].total,"HH : MM");
				$("#empList").addRowData(i, loopData[i]);
			}
			
			_e.progressBar.hide();
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(err, _e.systemMassage["-404"]);
		}
	
	});
	
	function coverntGridParamToString(){
		let toDate = new Date(_e.startYmd.substr(0,4), Number(_e.startYmd.substr(4,2))-1, _e.startYmd.substr(6,2));
		
		let allLine = [];
		let headersColumns = [""];
		let empColumns = [];
		let weekNm = [];
		
		if(_e.getLanguage() == "jp"){
			weekNm =["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"]; 
		}else{
			weekNm =["(일)", "(월)", "(화)", "(수)", "(목)", "(금)", "(토)"]; 
		}
		
		var dateInfo;
		for(let i = 0; i < 7; i++){   //컬럼해더 생성
			toDate.setDate(i==0 ? toDate.getDate() : toDate.getDate()+1);
			dateInfo =_e.date.convertDateToString(toDate,"MM-DD");
			
			headersColumns.push(dateInfo+weekNm[toDate.getDay()]);
			headersColumns.push("");
		}
		headersColumns.push("TOTAL");
		allLine.push(headersColumns.join(","));
		
		for(let i = 0 ; i < _e.empWorkList.length ; i++){
			empColumns = [];
			empColumns.push(_e.empWorkList[i]["userNm"]);
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day0Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day0End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day1Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day1End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day2Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day2End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day3Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day3End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day4Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day4End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day5Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day5End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day6Start"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["day6End"],"HH:MM"));
			empColumns.push(_e.date.convertTimeToString(_e.empWorkList[i]["total"],"HH:MM"));
			allLine.push(empColumns.join(","));
		}
		return allLine.join("\r\n");
	}
	
	function createGrid(){
		let height = $("#groundField").height() - $("#top").height() - 80;
		let width = $("#groundField").width() - 20;
		let percent = Math.floor(width/10);
		
		var voColNmList;
		
		if(_e.getLanguage() =="jp"){
			voColNmList = ["氏名",  "登録時間"];
		}else{
			voColNmList =  ["성명", "근무시간"];
		}
		
		$("#empList").jqGrid({
			data : [],
			datatype : "local",
			height : height,
			width : width,
			shrinkToFit : false,
			multiselect : false,
			colNames : voColNmList,
			colModel : [
			{
				name : 'userNm',
				index : 'userNm',
				align : 'center',
				editable : false,
				width : 4*percent
			},{
				name : 'totalWorkTime',
				index : 'totalWorkTime',
				align : 'center',
				editable : false,
				width : 6*percent
			}]
			,onSelectRow : function(rowId, e){
				_e.modal.show("modalEmpWorkList");
			}
			
		});
		
	}
	
	function download(title, content){
		return new Promise(function(resolve, reject){
			try{
				
				window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dir) {
				   dir.getFile(title+".csv", {
				     create: true
				   }, function(file) {
						
						file.createWriter(function(fileWriter) {
							
							//fileWriter.seek(fileWriter.length);
							var blob = new Blob([content], {type:"text/csv;charset=utf-8"});
							fileWriter.write(blob);
							resolve(true);
						}, function(){
							reject(false);
						});
				  	 });
				});
				
			}catch(err){
				reject(false);
			}
			
		});
	}
	
	
	
}())


		

