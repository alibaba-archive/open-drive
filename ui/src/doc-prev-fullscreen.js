window.iframeData = {};
function json2str(obj) {
    return JSON.stringify(obj, function(key, val) {
        if (typeof val === 'function') {
            val = val.toString();
        }
        return val;
    });
}

window.sendMessage = function(action, data) {
  var test = document.getElementById('aliyunPreview');
  test.contentWindow.postMessage(json2str({ action: action, data: data }), '*');
}

function setFullScreenState(state) {
  // state true: 全屏状态 false： 退出全屏状态
  sendMessage('logic.fullscreenchange', { state: state });
}
document.addEventListener("fullscreenchange", function () {
  setFullScreenState(!!document.fullscreen);
}, false);
document.addEventListener("mozfullscreenchange", function () {
  setFullScreenState(!!document.mozFullScreen);
}, false);
document.addEventListener("webkitfullscreenchange", function () {
  setFullScreenState(!!document.webkitIsFullScreen);
}, false);
document.addEventListener("msfullscreenchange", function () {
  setFullScreenState(!!document.msFullscreenElement);
}, false);
window.addEventListener('message',function(e){
  try {
    let res = JSON.parse(e.data)
    switch(res.action){
      case "logic.fullScreen":
        var el = document.documentElement;
        var fn = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
        fn.call(el);
        break
      case "logic.exitFullScreen":
        var el = document;
        var fn = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;
        fn.call(el);
        break
    }
  } catch (error) {
  }
}, false);
