// 正式 1905 测试 1004
var P_NAME = "开运电子";
var MOBILE_WIDTH = 768;

var isTest = false; // 是不是测试服
var isConnectServer = true; // 是不是连接服务器
var openSeverDate = new Date();
// 苹果下载地址
var IOS_URL_DEF = "";
// 安卓下载地址
var ANDROID_URL_DEF = "";
// 客服地址
var CUSTOMER_URL_DEF = "https://saas.kefu1000.com:443/im/text/1to9vg.html";

// 正式服
var CONNECT_URL = "https://api.3fbw.com/api/app/";
var SHARE_URL = "";

var PID = 1968;
var FILE_BASE = "https://file.g7fdbwbasepf3.com";
var FILE_PARTNER = "https://file.ttbbpart.com/" + PID;
// // 测试服
if (isTest) {
  CONNECT_URL = "https://tsapi.3fbw.org/api/app/";
  SHARE_URL = "https://tsapi.3fbw.org/api/share";
  PID = 1004;
  FILE_BASE = "https://file.testbasepartner.com";
  FILE_PARTNER = "https://file.testbasepartner.com/" + PID;
}

var IMAGE_OSS = "img_oss/";
var JS_BASE = FILE_BASE + "/js_oss/";

var isTestDownload = true;
// 是否加载oss资源
var isLoadOSS = false; // 本地调图片时用 false，正式时用 true
