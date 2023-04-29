window.onload = function () {
    if (isWeixin() || isQQ()) {
        document.getElementById("weChat").style.display = 'block';
    }
};

function firstCheck() {
    if (!(isWeixin() || isQQ())) {
        var recommendUrl = "index.html";
        var tmpKey = getParameterByName("key");
        if (tmpKey) {
            recommendUrl += "?key=" + tmpKey;
        }
        window.location.href = recommendUrl;
    }
}

/**
 * 判断是不是微信
 */
function isWeixin() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.match(/MicroMessenger/i)=="micromessenger";
}

/**
 * 判断是不是QQ内置浏览器
 */
function isQQ() {
    var ua = navigator.userAgent.toLowerCase();
    return ua.match(/QQ/i) == "qq" && (ua.match(/qqtheme/i) == "qqtheme");
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