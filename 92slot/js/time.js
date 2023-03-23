function checkOpenServer(){
    var nowDate = new Date();
    if (nowDate >= openSeverDate) {
        clearTimerOpen();
        // location.reload(true);
        connectDownload();
    } else {
        // console.log(nowDate);
    }
}
var timerOpen = null;
function checkSever() {
    // console.log("checkSever=====================");
    if (isConnectServer) {
        connectServer(true);
    } else {
        finishedRequest();
    }
}

function openServer() {
    var nowDate = new Date();
    if (nowDate < openSeverDate) {
        timerOpen = setInterval(checkOpenServer, 1000);
    } else {
        clearTimerOpen();
    }
}

function clearTimerOpen() {
    if (timerOpen) {
        clearInterval(timerOpen);
    }
}
    