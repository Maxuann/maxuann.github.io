/**
 * 判断是不是手机
 */
function isMobile() {
    var onMobile = (window.navigator.userAgent.indexOf("Mobile") > -1);
    return onMobile;
}

/**
 * 判断是不是安卓机
 */
function isAndroid() {
    var u = navigator.userAgent;
	return u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
}

/**
 * 判断是不是苹果IOS
 */
function isIOS() {
    var u = navigator.userAgent;
	return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
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

function isWeixinQQ() {
    return (isWeixin() || isQQ());
}

/**
 * 判断样式上是不是手机版
 */
function isMobileView()
{
    var getWidth = getViewSizeWithScrollbar().width;
    return (getWidth <= MOBILE_WIDTH);
}

/**
 * 取窗体大小（包含滚动条）
 */
function getViewSizeWithScrollbar(){
    if(window.innerWidth){ 
        return { 
            width : window.innerWidth, 
            height: window.innerHeight 
        } 
    }else if(document.documentElement.offsetWidth == document.documentElement.clientWidth){ 
        return { 
            width : document.documentElement.offsetWidth, 
            height: document.documentElement.offsetHeight 
        } 
    }else{ 
        return { 
            width : document.documentElement.clientWidth, 
            height: document.documentElement.clientHeight
        } 
    } 
 
}

/**
 * url地址修改
 * @param url 待修改url
 * @param arg 修改的参数名
 * @param arg_val 修改的具体值
 * @returns {String}
 */
function changeURLArg(url, arg, arg_val) {
    var pattern = arg + '=([^&]*)';
    var replaceText = arg + '=' + arg_val;
    if (url.match(pattern)) {
        var tmp = '/(' + arg + '=)([^&]*)/gi';
        tmp = url.replace(eval(tmp), replaceText);
        return tmp;
    } else {
        if (url.match('[\?]')) {
            return url + '&' + replaceText;
        } else {
            return url + '?' + replaceText;
        }
    }
}
function getPhoneString(){
	var canvas = document.createElement('canvas'),
	gl = canvas.getContext('experimental-webgl'),
	debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
	var user_agent = navigator.userAgent;
	//alert(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) + "@@" + user_agent);
	var aindex = user_agent.indexOf("Android");
	if(aindex >= 0)
	{
		// 安卓手机
		var eindex = user_agent.indexOf(";", aindex);
		var androidString = user_agent.substring(aindex, eindex).trim();
		var buildIndex = user_agent.indexOf("Build", eindex+1);
		if(buildIndex <= eindex)
		{
			buildIndex = user_agent.indexOf(";", eindex+1);
		}
		var buildString = user_agent.substring(eindex+1, buildIndex).trim();
		var ss = buildString.split(";");
		var phoneString = ss[ss.length - 1].trim();
		var finalString = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) + ";" + androidString + ";" + phoneString;
		return finalString;
	}
	var iindex = user_agent.indexOf("iPhone OS");
	if(iindex >=0)
	{
		// 苹果手机
		var eindex = user_agent.indexOf("like", aindex);
		var phoneString = user_agent.substring(iindex, eindex).trim();
		return phoneString + ";" + window.screen.width + ";" + window.screen.height;
	}
	// 其它
	return "";
	//return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) + ";" + user_agent;
}