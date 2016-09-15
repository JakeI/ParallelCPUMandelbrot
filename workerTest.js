var i = 0;

onmessage = function (e){
	i = e.data;
	timedCount();
}

function timedCount(){
	i += 1;
	postMessage(i);
	setTimeout("timedCount()", 5000);
}