function init() {
  "use strict";

  var DocTypeMap = {};

  DocTypeMap.extInfo = [
    "pptx", "ppt", "pot", "potx", "pps", "ppsx", "dps",
    "dpt", "pptm", "potm", "ppsm", "xls", "xlt", "et",
    "ett", "xlsx", "xltx", "csv", "xlsb", "xlsm", "xltm",
    "doc", "dot", "wps", "wpt", "docx", "dotx", "docm",
    "dotm", "pdf", "lrc", "c", "cpp", "h", "asm", "s",
    "java", "asp", "bat", "bas", "prg", "cmd", "rtf",
    "txt", "log", "xml", "htm", "html"
  ];

  DocTypeMap.isMatchTypeByExtension = function(ext) {
    for (var i = 0; i < DocTypeMap.extInfo.length; i++) {
      if (ext == DocTypeMap.extInfo[i]) {
        return true;
      }
    }
    return false;
  };

  return DocTypeMap;
}

export default init()
