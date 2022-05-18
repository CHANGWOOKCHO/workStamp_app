(function (){
	_e = window;
	_e.workStamp.initialize();  //DeviceReady
	_e.nav.load();
   _e.progressBar.load();

    var today = new Date(); //오늘날짜
    var voSelectDay = new Date(today.getFullYear(), today.getMonth(),1); //달의 첫날, 선택된 날짜
    
    var monthList = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    var LastDayList = [31,getLeapYearDate(voSelectDay.getFullYear()),31,30,31,30,31,31,30,31,30,31];

	var weekList = [];
    
	$(window).on("load", function() {
		_e.setUIText("retreiveWorkInfo");
   		monthChange(0, today.getDate());
    });

    $("#prev").on("click", function(e){
        monthChange(-1, voSelectDay.getDate());
    });
    
    $("#next").on("click", function(e){
    	
    	monthChange(1, voSelectDay.getDate());
    });
    
    /*
     *해당 월의 달력을 보여준다.
     */
    function showCalendar(poDay){
    
        let printDate = 1;
        let printPrevDate = LastDayList[poDay.getMonth() == 0 ? 11 : poDay.getMonth()-1] -(poDay.getDay()-1);
        let printNextDate = 1;
        
        var documentArray  = [];
         
        $(".week").remove();  //달력을 초기화
        
        for(var i = 0; i < 6; i++){  //달력에 표시되는 주의 최대 갯수
        	
        	var tr = $("<tr>", {  //tr을 한 주 단위로 설정
        		class : "week"
        	});
        	
        	var td;
        	
        	for(var j = 0; j < 7; j++){//일~토요일 까지 주 7일
        		
        		if((i === 0 && j < poDay.getDay())){  //지난 달 표시 가능한 날짜
        			td = $("<td>", {  //속성값 설정
                		class : "PrevDate",
                		text : printPrevDate
                	});
        			printPrevDate++;
        			
        		}else if(printDate > LastDayList[poDay.getMonth()]){ //다음 달 표시 가능한 날짜
        			
        			if(tr[0].innerText.indexOf(LastDayList[poDay.getMonth()]) >= 0){ //해당 주에 해당월의 마지막일이 있는 경우
        				td = $("<td>", {  //속성값 설정
                    		class : "NextDate",
                    		text : printNextDate
                    	});
        				printNextDate++;
        			}else{ //없다면 공백 칸으로 대체
        				td = $("<td>");
        			}
        			
        		}else{
        			td = $("<td>", {  //속성값 설정
                		id : printDate,
                		class : "date",
                		text : printDate
                	});
        			printDate++;
        		}
        		
        		tr.append(td);
        
        	}
        	
        	documentArray.push(tr);
        }
        $('#calendar-body').append(documentArray);
        
    }

	
	$("#calendar-body").on("click", ".date", function(e){  //클릭 이벤트 설정
		var voTargetID = e.target.textContent; 
    	
    	voSelectDay.setDate(voTargetID);
 		printDateInfo($("#"+voTargetID), voSelectDay);
    
	});
	
	$("#calendar-body").on("click", ".PrevDate", function(e){  //클릭 이벤트 설정
		var voTargetID = e.target.textContent; 
	
        monthChange(-1, Number(voTargetID));
    	
	});
	
	$("#calendar-body").on("click", ".NextDate", function(e){  //클릭 이벤트 설정
		var voTargetID = e.target.textContent; 
		
		 monthChange(1, Number(voTargetID));
	});
	
	
	
    
    function getLeapYearDate(vnYear){
    	
    	if(((vnYear % 4 == 0) && (vnYear % 100 != 0)) || (vnYear % 400 == 0)){
    		return 29;
    	}else{
    		return 28;
    	}
    
    }

    async function printDateInfo(e, poSelectDay){
		try{
			
			$(".week td").removeClass("active") //일자에서 active 클레스 삭제
    		e.addClass("active"); //선택된 일자만 active 클레스 설정
    	
			var dayNo = Number(poSelectDay.getDay());
			if($(".activeWeek").length == 0 || !$(e.parents("tr")).hasClass("activeWeek")){  //주가 바뀔 때마다 주간 정보 변경
			 
				var to = new Date(poSelectDay.getFullYear(), poSelectDay.getMonth(), poSelectDay.getDate()-dayNo);
				var from = new Date(poSelectDay.getFullYear(), poSelectDay.getMonth(), poSelectDay.getDate()+(6-dayNo));
			
				var reqInfo = {
					"workStartYmd" : _e.date.convertDateToString(to, 'YYYYMMDD')
					,"workEndYmd" : _e.date.convertDateToString(from, 'YYYYMMDD')
				}
				_e.progressBar.show();
				let result = await _e.sendCmd("retreiveWeekWorkInfoCmd", reqInfo, []);
				let totalMinute = 0;
				
				weekList = result.loopData;
				for(var i = 0; i < weekList.length; i++){
					totalMinute += weekList[i].minute;
				}
				
				$("#txtWeekDate").val(_e.date.convertDateToString(to, "YYYY-MM-DD")+" ~ "+_e.date.convertDateToString(from, "YYYY-MM-DD"));
				$("#txtWeekSumTime").val(_e.date.convertTimeToString(totalMinute, "	HH : MM"));
				_e.progressBar.hide(); 	
			}
		
    	$("#txtDate").val(_e.date.convertDateToString(poSelectDay, "YYYY-MM-DD"));
		$("#txtStartTime").val(_e.date.convertTimeToString(weekList[dayNo].workStartTime,"HH:MM:SS"));
		$("#txtEndTime").val(_e.date.convertTimeToString(weekList[dayNo].workEndTime,"HH:MM:SS"));
		
		$(".week").removeClass("activeWeek") //일자에서 active 클레스 삭제
		e.parents("tr").addClass("activeWeek");
			
			
			
			
		}catch(error){
			_e.progressBar.hide();
			_e.showError.toast(error, _e.systemMassage["-404"]);
		} 	
    }
    
    function monthChange(pnOneType, pnDate){
    	
    	var voChangeDay = new Date(voSelectDay.getFullYear(), voSelectDay.getMonth()+pnOneType, 1);
        var vsTableTitle = monthList[voChangeDay.getMonth()] + '&nbsp;&nbsp;&nbsp;&nbsp;'+ voChangeDay.getFullYear();
        
        $('#current-year-month').html(vsTableTitle); //월 + 년도로 테이블 타이틀 설정
        showCalendar(voChangeDay); //캘린더를 재출력
        
        voChangeDay.setDate(pnDate);
        voSelectDay = voChangeDay; 
 
        printDateInfo($("#"+pnDate), voChangeDay);
    }

}());
