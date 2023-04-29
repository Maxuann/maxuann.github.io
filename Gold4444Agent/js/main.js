var COMMON_JS_LIST = ['jquery.min.js', 'clipboard.min.js', 'qrcode.min.js'];
// 苹果下载地址
var iosDownloadUrl = IOS_URL_DEF;
// 苹果超级签下载地址
var iosSuperUrl = "";
// 安卓下载地址
var androidDownloadUrl = ANDROID_URL_DEF;
// H5地址
var h5Url = "";
// 客服地址
var customerUrl = CUSTOMER_URL_DEF;
var isGetDownloadUrl = false;
var clickDownloadURL = "";

function loadJSFinished() {
    initView();
}

/**
 * 连接后台取地址
 */
function connectServer(isGetAppUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", CONNECT_URL + PID);
    xhr.send();
    // console.log("xhr.readyState:", xhr.readyState);
    xhr.onreadystatechange = function(){
        // console.log("xhr.readyState:", xhr.readyState + ", xhr.status:", xhr.status);
        if(xhr.readyState == 4){
            if (xhr.status == 200) {
                // console.log(JSON.parse(xhr.responseText));
                var data = JSON.parse(xhr.responseText);
                if (data.err == 0) {
                    if (isGetAppUrl && data.android_url != null && data.android_url.length > 0) {
                        androidDownloadUrl = decodeURIComponent(data.android_url);
                    }
                    // IOS 下载地址可能会有三个，最多显示两个，优先级是：ios_url ios_super_url ios_tf_url
                    var urlIOSList = [];
                    if (isGetAppUrl && data.ios_url != null && data.ios_url.length > 0) {
                        // iosDownloadUrl = decodeURIComponent(data.ios_url);
                        urlIOSList.push(decodeURIComponent(data.ios_url));
                    }
                    if (isGetAppUrl && data.ios_super_url != null && data.ios_super_url.length > 0) {
                        // iosSuperUrl = decodeURIComponent(data.ios_super_url);
                        urlIOSList.push(decodeURIComponent(data.ios_super_url));
                    }
                    if (isGetAppUrl && data.ios_tf_url != null && data.ios_tf_url.length > 0) {
                        // iosTFUrl = decodeURIComponent(data.ios_tf_url);
                        urlIOSList.push(decodeURIComponent(data.ios_tf_url));
                    }
                    if (urlIOSList.length > 0) {
                        iosDownloadUrl = urlIOSList[0];
                    }
                    if (urlIOSList.length > 1) {
                        iosSuperUrl = urlIOSList[1];
                    }
                    if (data.cs_url != null && data.cs_url.length > 0) {
                        customerUrl = decodeURIComponent(data.cs_url);
                    }
                    if (data.base_url != null && data.base_url.length > 0) {
                        FILE_BASE = decodeURIComponent(data.base_url);
                    }
                    if (data.partner_url != null && data.partner_url.length > 0) {
                        FILE_PARTNER = decodeURIComponent(data.partner_url) + '/' + PID;
                    }
                    if (data.h5_url != null && data.h5_url.length > 0) {
                        h5Url = decodeURIComponent(data.h5_url);
                    }
                    // 
                    if (data.open_time != null && data.open_time > 0) {
                        openSeverDate = new Date(data.open_time * 1000);
                    }
                    // console.log("server data:", data);
                    // console.log("openSeverDate:", openSeverDate.toLocaleString());
                    // console.log("androidDownloadUrl:", androidDownloadUrl);
                    // console.log("iosDownloadUrl:", iosDownloadUrl);
                    // console.log("iosSuperUrl:", iosSuperUrl);
                    // console.log("customerUrl:", customerUrl);
                    if (isIOS() && iosSuperUrl && iosSuperUrl.length > 0) {
                        var btnIOSSuper = document.getElementById('downIosSuper');
                        btnIOSSuper && btnIOSSuper.classList.remove("hide");
                    }
                }
            }
            finishedRequest();
        }
    }
}

window.onload = function () {
    checkWeixin();
    window.onresize = function () {
        // 窗体大小改变的处理
        resizePageView();
    };
    
	// postWebPhoneString();
    loadRes();
    if (!isConnectServer) {
        startCheckOpenServer();
    }
}

function loadRes() {
    loadOSSImage(); // 加载oss上的图片
    initJS(); // 取JS
}

function finishedRequest() {
    // initView();
    isGetDownloadUrl = true;
    if (clickDownloadURL.length > 0) {
        window.location.href = clickDownloadURL;
    }
    startCheckOpenServer();
}

function checkWeixin() {
    // 微信
    if (isWeixin() || isQQ()) {
        var element = document.getElementById('weChat');
        element.style.display = '';
    }
}

function initView() {
    // console.log("initView=====================")
    // 二维码动态生成
    var down_url = window.location.href;
    // 外链接框架时，二维码取qrcodeurl
    var tmpobj = getParameterByName("qrcodeurl");
    if (tmpobj != null) {
        down_url = decodeURIComponent(tmpobj);
    }
    if (document.getElementById("qrcodeTable")) {
        var qrcodeTable2 = new QRCode(document.getElementById("qrcodeTable"), {
            width: 140,
            height: 140,
            text: down_url
        });
    }
    $('#qrcodeTable') && $('#qrcodeTable').show();
    $('.qrcode-text') && $('.qrcode-text').show();
    // 初始化剪切板
    initClipboard();
}

/**
 * 客服
 */
var onClickCustomer = function () {
    if (isMobileView()) {
        window.open(customerUrl);
    } else {
        var iWidth = 820; //弹出窗口的宽度;
        var iHeight = 650; //弹出窗口的高度;
        var iTop = (window.screen.availHeight - 30 - iHeight) / 2; //获得窗口的垂直位置;
        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2; //获得窗口的水平位置;
        var w = window.open('about:blank', '_blank', 'height=650, width=820,toolbar=no,scrollbars=no,menubar=no,status=no,top=' + iTop + ', left=' + iLeft + '')
        if (customerUrl) {
            w.location.href = customerUrl;
        } else {
            w.close();
        }
    }
}

var iosBtn = function () {
  window.open(iosDownloadUrl)
}

var androidBtn = function () {
  window.open(androidDownloadUrl)
}


function initClipboard() {
    var btnsCopy = function (btns, urlType) {
        if (btns==null || btns.length < 1) return;
        var copy = new ClipboardJS(btns, {
            text: function () {
                var tmpobj = getKey();
                if (tmpobj == null || tmpobj.length < 1) {
                    // 
                    gotoDownload(urlType);
                    return "";
                } else {
                    return tmpobj;
                }
            }
        })
        copy.on('success', function (e) {
            gotoDownload(urlType);
        })
        copy.on('error', function (e) {
            gotoDownload(urlType);
        })
    }

    var androidBtns = document.querySelectorAll('.android-btn');
    btnsCopy(androidBtns, "2");

    var iosBtns = document.querySelectorAll('.ios-btn');
    btnsCopy(iosBtns, "1");

    var downloadBtn = document.getElementById('phoneDownload');
    btnsCopy(downloadBtn, isIOS() ? "1" : "2");
    var downIosSuper = document.getElementById('downIosSuper');
    downIosSuper && btnsCopy(downIosSuper, isIOS() ? "3" : "2");
}

function getKey() {
    if(getUidByDomain()!="")
    {
        // 固定域名的，传固定值
        return getUidByDomain();
    }
    return getParameterByName("key");
}

function getParameterByName(key, url) { // 从url中取?key=xxx中的xxx
    if (!url) url = window.location.href; // 没有传url的话就取当前url
    key = key.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + key + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getUidByDomain() {
	var ret = "";
    if (!domainUidConfig) return ret;
	for(k in domainUidConfig)
	{
		if(document.domain.indexOf(k) >= 0)
		{
			ret = domainUidConfig[k];
			break;
		}
	}
    return ret;
}

// 告诉服务器本机信息
function postWebPhoneString()
{
	var tmpobj = getKey();
	var phoneData = getPhoneString();
	if (tmpobj != null && phoneData != "") {
		var xhr = new XMLHttpRequest();
		xhr.open("post", SHARE_URL);
		var data = {};
		data.pid = PID;
		data.data = phoneData;
		data.key = tmpobj;
		xhr.send(JSON.stringify(data));
	}
}
function gotoDownload(urlType) {
    if (isConnectServer) {
        gotoSeverDownload(urlType);
    } else {
        gotoLocalDownload(urlType);
    }
}
function gotoSeverDownload(urlType) {
    var downloadUrl = "";
    if (urlType === "1") {
        downloadUrl = iosDownloadUrl;
    } else if (urlType === "2") {
        downloadUrl = androidDownloadUrl;
    } else if (urlType === "3") {
        downloadUrl = iosSuperUrl;
    }
    // console.error("url:"+downloadUrl);
    if (isGetDownloadUrl == false) {
        clickDownloadURL = downloadUrl;
        alert("正在获取下载地址，请稍候重试。");
        return;
    }
    window.parent.location.href = downloadUrl;
}

function gotoLocalDownload(urlType) {
    var downloadUrl = "";
    var nowDate = new Date();
    if (checkOpenServer()) {
        if (urlType === "1") {
            downloadUrl = IOS_URL_DEF;
        } else if (urlType === "2") {
            downloadUrl = ANDROID_URL_DEF;
        } else if (urlType === "3") {
            downloadUrl = IOS_URL_DEF;  // 默认设置没有超级签
        }
        if (downloadUrl == "") {
            location.reload(true);
        } else {
            window.parent.location.href = downloadUrl;
        }
    } else {
        console.log("还未到开服时间");
    }
}
function resizePageView() {
}

function connectDownload() {
    var downloadBtns = document.getElementById('phoneDownload');
    var nowDate = new Date();
    // console.log("connectDownload:", openSeverDate);
    var isOpenServer = checkOpenServer();
    if (isTestDownload) isOpenServer = true;
    if (downloadBtns) {
        if (isOpenServer && h5Url.length > 0) {
            downloadBtns.classList.remove("hide");
        } else {
            downloadBtns.classList.add("hide");
        }
    }
}
function checkOpenServer() {
    var nowDate = new Date();
    return (nowDate >= openSeverDate);
}

function startCheckOpenServer() {
    connectDownload();
    openServer();
}

function onClickH5Download() {
    if (h5Url && h5Url.length > 0) {
        var goUrl = h5Url;
        var tmpobj = getParameterByName("key");
        if (tmpobj != null) {
            if (goUrl.indexOf("?") < 0) {
                goUrl += "?";
            } else {
                goUrl += "&";
            }
            goUrl += "key=" + tmpobj;
        }
        window.parent.open(goUrl);
    }
}