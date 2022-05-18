(function(){
	
	var _e = this;
	
	
	$('.modalEmpWorkList').on("show.bs.modal", function(e){
		createTable();
		addRowData();
	});
	
	$('.modalEmpWorkList').on("hidden.bs.modal", function(e){
		
	});
	
	function createTable(){
		
		let voColNmList;
		
		if(_e.getLanguage() =="jp"){
			voColNmList = ["勤務日", "出勤時間", "退勤時間"];
		}else{
			voColNmList = ["근무일", "출근시간", "퇴근시간"];
		}
		
		
		let width = $(".modalEmpWorkList").width()-60;
		let percent = Math.floor(width/10);
		let height = $(".grid-wrapper").height()-35;
		
		$("#workList").jqGrid({
			data : [],
			datatype : "local",
			height : height,
			width : width,
			shrinkToFit : false,
			multiselect : false,
			colNames : voColNmList,
			colModel : [
			{
				name : 'workYmd',
				index : 'workYmd',
				align : 'center',
				editable : false,
				width : percent*3
			},{
				name : 'workStartTime',
				index : 'workStartTime',
				align : 'center',
				editable : false,
				width : percent*3.5
			},{
				name : 'workEndTime',
				index : 'workEndTime',
				align : 'center',
				editable : false,
				width : percent*3.5
			}]

		});
		
	}
	
	function addRowData(){
		let idx = $("#empList").getGridParam("selrow");
		let toDate = new Date(_e.startYmd.substr(0,4), Number(_e.startYmd.substr(4,2))-1, _e.startYmd.substr(6,2));
		
		let rowData = _e.empWorkList[idx];
		let value;
		
		$("#workList").clearGridData();
		for(let i = 0; i < 7; i++){
			toDate.setDate(i==0 ? toDate.getDate() : toDate.getDate()+1);
			
			value = {
				"workYmd" : _e.date.convertDateToString(toDate,"YYYY-MM-DD")
				,"workStartTime" :  _e.date.convertTimeToString(rowData[`day${i}Start`],"HH : MM : SS")
				,"workEndTime" : _e.date.convertTimeToString(rowData[`day${i}End`],"HH : MM : SS")
			}
			 $("#workList").addRowData(i, value);
		}
		
	}
	
}())