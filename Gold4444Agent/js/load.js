var loadCount = 0;
function initJS() {
    loadCount = 0;
    for (var i = 0; i < COMMON_JS_LIST.length; i++) {
        loadJS(COMMON_JS_LIST[i], loadOK, loadNG, false);
    }
}

function loadJS(jsFile, funOK, funNG, isLocal) {
    if (typeof isLocal == 'undefined') {
        isLocal = false;
    }
    // Load JS file
    var script = document.createElement('script');
    var jsUrl = isLocal ? 'js_oss/' + jsFile : JS_BASE + jsFile;
    script.setAttribute('src', jsUrl);
    document.head.appendChild(script);
    // Set up callback after JS file is loaded
    script.onload = function() {
        if (funOK) {
            funOK();
        }
    }
    script.onerror = function() {
        if (funNG) {
            funNG(jsFile, isLocal);
        }
    }
}

function loadOK() {
    loadCount++;
    checkFinishLoadJS();
}

function loadNG(jsFile, isLocal) {
    if (!isLocal) {
        loadJS(jsFile, loadOK, loadNG, true);
    }
}

function checkFinishLoadJS() {
    if (loadCount === COMMON_JS_LIST.length) {
        loadJSFinished();
    }
}

function loadOSSImage() {
    var img = document.querySelectorAll("img[data-src]")
    for (var i = 0; i < img.length; i++) {
        // img[i].style.opacity = "0"
        var imgURL = isLoadOSS ? FILE_PARTNER + '/' : '';
        imgURL += IMAGE_OSS + img[i].getAttribute("data-src");
        img[i].src = imgURL;
        img[i].onerror = function() {
            var localImg = this;
            localImg.src = IMAGE_OSS + localImg.getAttribute("data-src");
            localImg.onerror = null;
        }
    }
}
