window.isElectron = false;
window.ASNode = null;
try {
  if (typeof(require) != 'undefined') {
    window.isElectron = true;
    console.log('Running by electron')
    initElectronVars();

  } else {
    console.log('Running by web browser')
  }
} catch (e) {
  console.log(e)
}


function initElectronVars(){

  const {
    ipcRenderer,
    shell
  } = require('electron')

  const path = require('path');
  const os = require('os');
  const fs = require('fs');
  const crypto = require('crypto');
  const dialog = require('electron').remote.dialog;

  window.ASNode = {
    path: path,
    os: os,
    fs: fs,
    openExternal: function(url) {
      // Open a URL in the default way
      shell.openExternal(url);
    },
    openLocaleFolder: function(p) {
      shell.showItemInFolder(p)
    },
    openDevTools: function (){
      ipcRenderer.send('asynchronous', {key: 'openDevTools'});
    },
    checkFileHash: checkFileHash,
    showDownloadDialog: showDownloadDialog,
    showUploadDirectoryDialog: showUploadDirectoryDialog
  }


  function showDownloadDialog(fn){
    dialog.showOpenDialog({
      title: 'Download',
      properties: ['openDirectory']
    }, function(filePaths){
      if(typeof(fn)=='function')fn(filePaths);
    });
  }
  function showUploadDirectoryDialog(fn){
    dialog.showOpenDialog({
      title: 'Upload',
      properties: ['openDirectory', 'multiSelections']
    }, function(filePaths){
      if(typeof(fn)=='function')fn(filePaths);
    });
  }

  function checkFileHash(filePath, hashCrc64ecma, fileMd5, fn) {
    //console.log(filePath, ',,,,,,,,,,,,,,,,,')
    if(hashCrc64ecma){
        console.time(`check crc64 ${filePath}`);
      getFileCrc64(filePath, function(err, crc64Str){
        console.timeEnd(`check crc64 ${filePath}`);
        if (err) {
          fn(new Error('Checking file['+filePath+'] crc64 hash failed: ' + err.message));
        } else if (crc64Str!=null && crc64Str != hashCrc64ecma) {
          fn(new Error('HashCrc64ecma mismatch, file['+filePath+'] crc64 hash should be:'+hashCrc64ecma+', but we got:'+crc64Str));
        } else{
          console.info('check crc success: file['+filePath+'],'+crc64Str)
          fn(null);
        }
      });
    }
    else if(fileMd5){

      //检验MD5
      getBigFileMd5(filePath, function (err, md5str) {
        if (err) {
          fn(new Error('Checking md5 failed: ' + err.message));
        } else if (md5str != fileMd5) {
          fn(new Error('ContentMD5 mismatch, file md5 should be:'+fileMd5+', but we got:'+md5str));
        } else{
          console.info('check md5 success: file['+filePath+'],'+md5str)
          fn(null);
        }
      });
    }
    else{
      //没有MD5，不校验
      console.log(filePath,',not found content md5, just pass');
      fn(null);
      return;
    }
  }

  function getBigFileMd5(p, fn){
    console.time('get md5 hash for ['+p+']');
     var md5sum = crypto.createHash('md5');
     var stream = fs.createReadStream(p);
     stream.on('data', function(chunk) {
         md5sum.update(chunk);
     });
     stream.on('end', function() {
       str = md5sum.digest('base64');
       console.timeEnd('get md5 hash for ['+p+']');
       fn(null, str);
     });
     stream.on('error', function(err) {
       fn(err);
     });
  }

  function getFileCrc64(p, fn){
    console.time('get crc64 hash for ['+p+']');
    window.ASNode.CRC64.crc64FileProcess(p, function(err, data){
      console.timeEnd('get crc64 hash for ['+p+']');
      console.log(data);
      fn(err, data);
    });
  };


  ipcRenderer.on('asynchronous-reply', (event, data) => {
    switch (data.key) {
      case 'getElectronDirPath':
        console.log(data.path)
        var electron_dir_path = data.path;
        window.ASNode.OSSWrapper = require(path.join(electron_dir_path,'node_modules','ali-oss')).Wrapper;
        window.ASNode.CRC64 = require(path.join(electron_dir_path,'node','crc64'));
        window.ASNode.OssLoader = require(path.join(electron_dir_path,'node','oss-loader'));
        break;
    }
  });
  ipcRenderer.send('asynchronous', {
    key: 'getElectronDirPath'
  });

  window.ELECTRON_DISABLE_SECURITY_WARNINGS=true;

}
