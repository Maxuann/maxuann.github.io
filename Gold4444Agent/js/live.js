var flvUrl = FLV_LIST[0];
var player = null;

function startFunc() {
    /**
     * 开始播放,参数为 http-flv或 websocket-flv 的url
     */
    if (player) {
        player.start(flvUrl);
        $("#live-loading").show();
    }
}

function stopFunc() {
    /**
     * 停止播放
     */
    if (player) {
        player.stop();
    }
}

function fullFunc() {
    player.fullscreen();
}

function volumeChange(event) {
    /**
     * 设置音量
     * 0.0  ~~ 1.0
     * 当为0.0时,完全静音, 最大1.0
     */
    player.setVolume(event.target.value / 100.0);
}

function scaleModeChange(event) {
    /**
     * 视频缩放模式, 当视频分辨率比例与Canvas显示区域比例不同时,缩放效果不同:
     *  0 视频画面完全填充canvas区域,画面会被拉伸 --- 默认值
     *  1 视频画面做等比缩放后,对齐Canvas区域,画面不被拉伸,但有黑边
     *  2 视频画面做等比缩放后,完全填充Canvas区域,画面不被拉伸,没有黑边,但画面显示不全
     * 软解时有效
     */
    player.setScaleMode(event.target.value);
}

function reloadNodePlayer() {
    stopFunc();
    loadNodePlayer();
    startFunc();
}

function loadNodePlayer() {
    // 0.5.28之后, 为了统一asm与wasm版本api差异,现统一采用回调格式加载.
    NodePlayer.load(function() {
        player = new NodePlayer();
        /**
         * 自动测试浏览器是否支持MSE播放，如不支持，仍然使用软解码。
         * 紧随 new 后调用
         * 不调用则只使用软解
         */
        // player.useMSE();
    
        /**
         * 开启屏幕常亮
         * 在手机浏览器上,canvas标签渲染视频并不会像video标签那样保持屏幕常亮
         * 如果需要该功能, 可以调用此方法, 会有少量cpu消耗, pc浏览器不会执行
         */
        // player.setKeepScreenOn();
    
        /**
         * 传入 canvas视图的id，当使用mse时，自动转换为video标签
         */
        player.setView("video1");
    
        /**
         * 设置最大缓冲时长，单位毫秒，只在软解时有效
         */
        player.setBufferTime(1000);
    
        /**
         * 设置视频解密key, 只能设置16字节
         * 支持NodeMediaClient-Android,iOS SDK加密推流,不限服务端
         */
        // player.setCryptoKey("qwerty1234567890");
    
        player.on("start", function() {
            // console.log("player on start");
            $("#live-loading").hide();
        });
    
        player.on("stop", function() {
        // console.log("player on stop");
        });
    
        player.on("error", function(e) {
        // console.log("player on error", e);
        });
    
        player.on("videoInfo", function(w, h, codec) {
        // console.log("player on video info width=" + w + " height=" + h + " codec=" + codec);
        });
    
        player.on("audioInfo", function(r, c, codec) {
        // console.log("player on audio info samplerate=" + r + " channels=" + c + " codec=" + codec);
        });
    
        player.on("stats", function(stats) {
        //console.log("player on stats=", stats);
        });
    });
}

var myTimer = null;
function reLoadTimer() {
    if (myTimer) {
        clearTimeout(myTimer);
    }
    loadTimer();
}
function loadTimer() {
    reloadNodePlayer();
    myTimer = setTimeout(loadTimer, 595000);
}