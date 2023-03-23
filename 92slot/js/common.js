
function resizeLiveBox() {
    var box = document.getElementById("liveBox");
    var boxWidth = box.offsetWidth;
    // console.log("boxWidth:", boxWidth);
    var maxHeight = (parseFloat(boxWidth) * 0.95 - 60) / 16 * 9;
    $("#liveBox").css("max-height", maxHeight + "px");
    var boxCanvas = document.getElementById("canvas-box");
    var boxHeight = box.offsetHeight;//
    //console.log("boxHeight:", boxHeight);
    var maxBoxWidth = parseFloat(boxHeight-16) / 9 * 16 - 6;
    // console.log("maxBoxWidth:", maxBoxWidth);
    $("#boxCanvas").css("max-width", maxBoxWidth + "px");
    $("#boxCanvas").show();
    $(".live-ctrl").show();
}