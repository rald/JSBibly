var BIBLE_FILENAME="kjv.csv";

var BibleCSV=null;

var modal=null;
var modalContent=null;
var output=null;



function showModal() {
	modal.style.display = "block";
}

function hideModal() {
	setTimeout(function() { modal.style.display = "none"; }, 1250);
}

function updateProgress(e) {
  if(e.lengthComputable) {
    var percent = Math.floor(e.loaded / e.total * 10000) / 100;
    modalContent.innerHTML="<div>Loading "+percent+"&percnt;</div>";
  } else {
    modalContent.innerHTML="<div>Loading...</div>";
  }
}

function transferStart(e) {
	modalContent.innerHTML+="<div>Transfer Started</div>";
}

function transferComplete(e) {
	modalContent.innerHTML+="<div>Transfer Complete</div>";
}

function transferEnd(e) {
	modalContent.innerHTML+="<div>Transfer End</div>";
	hideModal();
}

function transferFailed(e) {
	modalContent.innerHTML+="<div>Transfer Failed</div>";
}

function transferCanceled(e) {
	modalContent.innerHTML+="<div>Transfer Canceled</div>";
}

function loadDoc(url,readyStateChange) {

	showModal();

	var xhttp = new XMLHttpRequest();

	xhttp.addEventListener("loadstart", transferStart, false);
	xhttp.addEventListener("load", transferComplete, false);
	xhttp.addEventListener("loadend", transferEnd, false);
	xhttp.addEventListener("progress", updateProgress, false);
	xhttp.addEventListener("error", transferFailed, false);
	xhttp.addEventListener("abort", transferCanceled, false);
	xhttp.addEventListener("readystatechange", readyStateChange, false);

  xhttp.open("GET", url, true);

  xhttp.send();

	return xhttp;
}


function findPassage(passage) {

	var bookNameToFind=passage.bookName;
	var chapNumToFind=passage.chapNum;
	var versNumStart=passage.versNumStart;
	var versNumEnd=passage.versNumEnd;
	var errors="";
	var result="";

	var found=false;

	for(var i=0;i<BibleCSV.length;i++) {

		var line=BibleCSV[i];
		var tmp1=line.split("|");
		var tmp2=tmp1[1].split(":");
		var bookName=tmp1[0];
		var chapNum=parseInt(tmp2[0]);
		var versNum=parseInt(tmp2[1]);
		var versTxt=tmp1[2];

		if(bookName===bookNameToFind) {
			if(typeof chapNumToFind === "number" && !isNaN(chapNumToFind) && chapNumToFind>0) {
			 	if(chapNum===chapNumToFind) {
					if(typeof versNumStart === "number" && !isNaN(versNumStart) && versNumStart>0) {
						if(typeof versNumEnd === "number" && !isNaN(versNumEnd) && versNumEnd>0) {
						 	if(versNum>=versNumStart && versNum<=versNumEnd) {
								result+="<b>"+bookName+" "+chapNum+":"+versNum+"</b> "+versTxt+"\n\n";
								found=true;
							} else if(versNum>versNumEnd) {
								break;
							}
						} else {
						 	if(versNum===versNumStart) {
								result+="<b>"+bookName+" "+chapNum+":"+versNum+"</b> "+versTxt+"\n\n";
								found=true;
								break;
							}
						}
					} else {
						result+="<b>"+bookName+" "+chapNum+":"+versNum+"</b> "+versTxt+"\n\n";
						found=true;
					}
				}
			} else {
				result+="<b>"+bookName+" "+chapNum+":"+versNum+"</b> "+versTxt+"\n\n";
				found=true;
			}
		}
	}

	if(!found) {
		var verse =
				passage.bookName+
				(passage.chapNum===0?"":" "+passage.chapNum)+
				(passage.versNumStart===0?"":":"+passage.versNumStart)+
				(passage.versNumEnd===0?"":"-"+passage.versNumEnd);
		errors="<div><b>"+verse+" not found!<b></div><br>";
		result+=errors;
	}

	return result;

}


function btnSend_Click() {

	var tmp0=null;
	var tmp1=null;
	var tmp2=null;
	var tmp3=null;

	var result="";

	var bookNameToFind="";
	var chapNumToFind=0;

	var versNumStart=0;
	var versNumEnd=0;

	var txtCommand=document.getElementById("txtCommand");

	var cmd=txtCommand.value;

	if(cmd.startsWith(".")) {

		if(cmd===".clear") {
			output.innerHTML="";
		}

	} else {

		tmp3=[];

		tmp2=txtCommand.value.split(",").filter(i=>i);

		for(var j=0;j<tmp2.length;j++) {

			bookNameToFind="";
			chapNumToFind=0;
			versNumStart=0;
			versNumEnd=0;

			tmp0=tmp2[j];

			tmp0=tmp0.split(":",2).filter(i=>i);

			if(tmp0.length===2) {
				tmp1=tmp0[1].split("-",2).filter(i=>i);
				versNumStart=parseInt(tmp1[0]);
				if(tmp1.length===2) {
					versNumEnd=parseInt(tmp1[1]);
				}
			}

			tmp1=tmp0[0].split(" ").filter(i=>i);

			var i=0;
			tmp=parseInt(tmp1[0]);
			if(!isNaN(tmp)) {
					bookNameToFind+=tmp1[i];
					i++;
			}
			for(;i<tmp1.length;i++) {
				if(isNaN(parseInt(tmp1[i]))) {
					if(i!=0) bookNameToFind+=" ";
					bookNameToFind+=tmp1[i];
				} else {
					break;
				}
			}

			if(i<tmp1.length) chapNumToFind=parseInt(tmp1[i]);

			tmp3.push({
					"bookName":bookNameToFind,
					"chapNum":chapNumToFind,
					"versNumStart":versNumStart,
					"versNumEnd":versNumEnd});
		}

		modalContent.innerHTML="";
		result="";
		for(var i=0;i<tmp3.length;i++) {
			result+=findPassage(tmp3[i]);
		}
		output.innerHTML+=result;

		output.scrollIntoView(false);

	}


	txtCommand.value="";

}



window.onload = function() {

  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }

	modal = document.getElementById("myModal");
	modalContent = document.getElementById("modal-content");
	output = document.getElementById("output");

	loadDoc(BIBLE_FILENAME,function() {
		if(this.readyState == 4 && this.status == 200) {
			BibleCSV = this.responseText;
			BibleCSV = BibleCSV.split("\n").filter(i=>i);
			hideModal();
		}
	});

}

