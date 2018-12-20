
import http from './http-axios'
import OssUploader from './oss-uploader'
import settingsSvs from './settingsSvs'
// import $ from 'jquery'
import OssSignedUploader from './oss-signed-uploader';

const IMAGE_SUFFIX_MAP = {
  "bmp": 1, "cmx": 1, "cod": 1, "ief": 1, "jfif": 1, "jpe": 1, "jpeg": 1,
  "jpg": 1, "pbm": 1, "pgm": 1, "pnm": 1, "ppm": 1, "ras": 1, "rgb": 1, "svg": 1,
  "tif": 1, "xbm": 1, "xpm": 1, "xwd": 1, "ico": 1, "gif": 1, "png": 1, "webp": 1, "tiff": 1
};
const STS_UPLOAD_SIZE = 4 * 1024 * 1024;  //超过4MB，使用 sts token上传，否则使用 signed_url

export default {
  get,
  getStsToken,
  list,
  publicList,
  create,
  del,
  complete,

  copyFiles,
  stopCopyFiles,

  deleteFiles,
  stopDeletingFiles,

  uploadFiles,
  startAllUpload,
  stopAllUpload,
  checkStart,

  genSignedUrl,

  getOfficePreviewStsToken,
  getPublicOfficePreviewStsToken,

  isImage,

  putFile,
  videoAnalyseStsToken
}



function isImage(name) {
  var suf = '';
  var ind = name.lastIndexOf('.');
  if (ind != -1) {
    suf = name.substring(ind + 1)
  }
  return IMAGE_SUFFIX_MAP[suf.toLowerCase()];
}

async function genSignedUrl(type, driveId, filePath, data) {
  //console.log('[genSignedUrl]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}/signed_url`, data)
}

async function getOfficePreviewStsToken(type, typeKey, filePath, data) {
  //console.log('[getOfficePreviewStsToken]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${typeKey}/files/${encodeURIComponent(filePath)}/office_preview_ststoken`, data)
}

async function videoAnalyseStsToken(type, typeKey, filePath, data) {
  //console.log('[getVideoAnalyseStsToken]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${typeKey}/files/${encodeURIComponent(filePath)}/video_analyse_ststoken`, data)
}

async function getPublicOfficePreviewStsToken(type, typeKey, filePath, data) {
  //console.log('[getPublicOfficePreviewStsToken]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/public/${type}s/${typeKey}/files/${encodeURIComponent(filePath)}/office_preview_ststoken`, data)
}
async function getStsToken(type, driveId, filePath, data) {
  //console.log('[getStsToken]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}/sts_token`, data)
}
async function get(type, driveId, filePath) {
  //console.log('[get]',type, driveId, filePath)
  return http.get(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}`, data)
}
async function list(type, driveId, data) {
  //console.log('[list]',type, driveId, JSON.stringify(data))
  return http.get(`${Global.endpoint}/${type}s/${driveId}/files`, data)
}
async function publicList(type, driveId, data) {
  //console.log('[publicList]',type, driveId,  JSON.stringify(data))
  return http.get(`${Global.endpoint}/public/${type}s/${driveId}/files`, data)
}
async function create(type, driveId, data) {
  //console.log('[create]',type, driveId,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files`, data)
}
async function complete(type, driveId, filePath, data) {
  //console.log('[complete]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}/complete`, data)
}
async function del(type, driveId, filePath) {
  //console.log('[delete]',type, driveId, filePath)
  return http.delete(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}`)
}
function move(type, driveId, filePath, data) {
  //console.log('[move]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}/move`, data);
}
function copy(type, driveId, filePath, data) {
  //console.log('[copy]',type, driveId, filePath,  JSON.stringify(data))
  return http.post(`${Global.endpoint}/${type}s/${driveId}/files/${encodeURIComponent(filePath)}/copy`, data);
}





//批量copy
var copyStopped = false;
// opt = {isMove, from, to, items, progress}
async function copyFiles(type, driveId, opt) {
  copyStopped = false;

  var c = 0;
  var len = opt.items.length;
  var terr = [];

  async function _dig(items) {

    for (var n of items) {
      if (copyStopped) return;

      try {

        //如果是folder
        if (n.type == 'folder') {
          let marker;
          do {
            if (copyStopped) return;

            let listResult = await list(type, driveId, { dir_path: n.path, marker });
            let arr = listResult.items;

            len += listResult.items.length;
            if (typeof opt.progress == 'function') opt.progress(c / len, c, len);

            await _dig(arr);

            marker = listResult.next_marker;
          }
          while (marker);
        }

        if (copyStopped) return;

        if (opt.newName) {
          var obj = getNewNameDirPath(opt.from, opt.to, n.dir_path, n.name, opt.newName);
          n.dir_path = obj.dir_path;
          n.name = obj.name;
        }

        var toDirPath = getDirPath(opt.from, opt.to, n.dir_path, n.name);


        if (opt.isMove) {
          //move
          await move(type, driveId, n.path, {
            new_name: n.name,
            new_dir_path: toDirPath,
            ignoreError: true
          });
        } else {
          //copy
          await copy(type, driveId, n.path, {
            new_name: n.name,
            new_dir_path: toDirPath,
            ignoreError: true
          });
        }


      } catch (err) {
        terr.push(Object.assign({}, n, { error: err }))
      }

      c++;
      if (typeof opt.progress == 'function') opt.progress(c / len, c, len);
    }
  }

  await _dig(opt.items);
  return terr;
}
/**
 fromDir  /a/b/  c.txt
 toDir    /a/    c.txt
 dirPath  /a/b/d  c.txt
 name     c.txt
 */
function getDirPath(fromDir, toDir, dirPath, name) {
  var k = dirPath;
  if (dirPath.startsWith(fromDir)) {
    k = dirPath.substring(fromDir.length);
  }
  return toDir.replace(/(\/*$)/g, '') + '/' + (k.replace(/(^\/*)/, ''));
}

function getNewNameDirPath(fromDir, toDir, dirPath, name, newName) {
  var k = dirPath.substring(fromDir.length);
  var arr = k.split("/").filter(n => !!n);
  if (arr.length > 0) {
    arr[0] = newName;
    return {
      name: name,
      dir_path: arr.length > 0 ? "/" + arr.join("/") + "/" : "/"
    }
  } else {
    name = newName;
    return {
      name: name,
      dir_path: dirPath
    }
  }
}


//停止copy
function stopCopyFiles() {
  copyStopped = true;
}


//批量删除
var deletingStopped = false;
// opt = { type, driveId, items: [],  progress: function(){} }
async function deleteFiles(type, driveId, opt) {
  deletingStopped = false;

  var c = 0;
  var len = opt.items.length;
  var terr = [];

  var progFn = typeof (opt.progress) == 'function' ? opt.progress : function () { };

  async function _dig(items) {
    for (var n of items) {
      if (deletingStopped) return;

      try {

        //如果是folder
        if (n.type == 'folder') {
          let marker;
          do {
            if (deletingStopped) return;

            let listResult = await list(type, driveId, { dir_path: n.path, marker });
            let arr = listResult.items;

            len += listResult.items.length;
            progFn(c / len, c, len);

            await _dig(arr);

            marker = listResult.next_marker;
          }
          while (marker);
        }

        if (deletingStopped) return;

        await del(type, driveId, n.path);

      } catch (err) {
        terr.push(Object.assign({}, n, { error: err }))
      }
      c++;
      progFn(c / len, c, len);

    }
  }

  await _dig(opt.items);
  return terr;
}

//停止批量删除
function stopDeletingFiles() {
  deletingStopped = true;
}



function fixEndpointProtocol(endpoint) {
  if (!endpoint.startsWith(location.protocol)) {
    endpoint = location.protocol + endpoint.substring(endpoint.indexOf(':') + 1)
  }
  return endpoint;
}

async function putFile(type, driveId, file, bufferData) {
  var stsToken = await getStsToken(type, driveId, file.path, {
    type: 'upload'
  });
  if (stsToken.endpoint) {
    stsToken.endpoint = fixEndpointProtocol(stsToken.endpoint)
  }
  var putFileResult = await put(stsToken, bufferData);
  return await complete(type, driveId, file.path);
}


function put(cfg, bufferData) {
  return new Promise((resolve, reject) => {
    var client = new OSS({
      accessKeyId: cfg.access_key_id,
      accessKeySecret: cfg.access_key_secret,
      stsToken: cfg.security_token,
      endpoint: cfg.endpoint,
      bucket: cfg.bucket
    });
    client.put(cfg.key, bufferData)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}



//************************************

var gUploadList_ref = null;
var concurrency = 0

//上传
function checkStart() {
  //流控, 同时只能有 n 个上传任务.
  var maxConcurrency = +settingsSvs.maxUploadJobCount.get();
  //console.log(concurrency , maxConcurrency);
  concurrency = Math.max(0, concurrency);
  if (concurrency < maxConcurrency) {
    var arr = gUploadList_ref;
    for (var i = 0; i < arr.length; i++) {
      if (concurrency >= maxConcurrency) return;

      var n = arr[i];
      if (n.status == 'waiting') {
        n.start();
        concurrency++;
      }
    }
  }
}

function startAllUpload() {
  if (!gUploadList_ref) return;
  for (var n of gUploadList_ref) {
    if (n && (n.status == 'stopped' || n.status == 'failed')) {
      n.wait();
    }
    checkStart();
  }
}
function stopAllUpload() {
  if (!gUploadList_ref) return;
  for (var n of gUploadList_ref) {
    if (n && (n.status == 'running' || n.status == 'waiting')) {
      n.stop();
    }
  }
}
function getSensibleSec(s){
  var G = 1024*1024*1024;
  if(s<1*G){
    return 1*24*3600
  }
  else{
    return Math.ceil(s/(2*G)) * 24*3600
  }
}
async function uploadFiles(type, driveId, storeType, toPath, files, uploadList_ref) {

  if (!gUploadList_ref) gUploadList_ref = uploadList_ref;

  for (var _file of files) {

    /*
    lastModified: 1523412999463
    lastModifiedDate: Date 2018-04-11T02:16:39.463Z
    name: "key.js"
    size: 733
    type: "application/x-javascript"
    webkitRelativePath: "sys/key.js"
    _webkitRelativePath: "sys/key.js"  //拖拽文件夹上传时自定义的Path
    */

    (async (file) => {

      var getStsTokenPath = toPath + (file._webkitRelativePath || file.webkitRelativePath || file.name);

      //if(true){
      //1. create file
      var needSts = file.size > STS_UPLOAD_SIZE;

      var createOpt = {
        name: file.name,
        type: 'file',
        dir_path: getStsTokenPath.substring(0, getStsTokenPath.length - file.name.length),
        size: file.size,
        ignoreError: true
      };


      if (needSts) {
        createOpt.return_ststoken = true;
      } else {
        createOpt.return_signed_url = true;
        createOpt.content_type = file.type || '';
        createOpt.signed_url_expires_sec = getSensibleSec(file.size)
      }

      try {
        var result = await create(type, driveId, createOpt);
        //if(storeType=='ots') getStsTokenPath = result.path;
        // console.log(result)

        //drive size changed
        window.MyApp.$root.$emit('driveSizeChanged')
      } catch (err) {
        if (err.data.code == 'NoPermission' || err.data.code == 'NotEnoughSpace') {
          Toast.error(err.data.code + ':' + err.data.message + ': ' + getStsTokenPath)
        }
        else console.error(err.data.code + ':' + err.data.message + ': ' + getStsTokenPath);
        return;
      }

      if (needSts) {
        var result2 = result.sts;
        //fix endpoint protocol
        if (result2 && result2.endpoint) {
          result2.endpoint = fixEndpointProtocol(result2.endpoint);
        }

        //刷新 获取 sts
        createOpt.getStsTokenFn = async function () {
          console.log('call getStsTokenFn')
          var result2 = await getStsToken(type, driveId, getStsTokenPath, {
            type: 'upload'
          })

          //fix endpoint protocol
          if (result2 && result2.endpoint) {
            result2.endpoint = fixEndpointProtocol(result2.endpoint);
          }
          return result2;
        }


        //3. 创建一个 job，异步管理上传进度和状态
        await OssUploader.create(Object.assign(result2, {
          toPath: getStsTokenPath,
          created: function (job) {
            //通过引用更新job列表
            uploadList_ref.push(job);
            //need refres
            window.MyApp.$root.$emit('uploadListChanged', uploadList_ref);

            //流控
            job.on('statuschange', function (status) {
              if (status == 'stopped' || status == 'failed' || status == 'finished') {
                concurrency--;
                checkStart();
              }
            });
            checkStart();
          }
        }), file);



      } else {

        var result2 = result.signed;
        if (result2 && result2.url) {
          result2.url = fixEndpointProtocol(result2.url);
        }

        await OssSignedUploader.create({
          url: result2.url,
          toPath: getStsTokenPath,

          created: function (job) {
            //通过引用更新job列表
            uploadList_ref.push(job);
            //need refres
            window.MyApp.$root.$emit('uploadListChanged', uploadList_ref);

            //流控
            job.on('statuschange', function (status) {
              if (status == 'stopped' || status == 'failed' || status == 'finished') {
                concurrency--;
                checkStart();
              }
            });
            checkStart();
          }

        }, file)



      }



      //4. 修改文件状态
      await complete(type, driveId, getStsTokenPath);


      //need refres
      window.MyApp.$root.$emit('uploadListChanged', uploadList_ref);

    })(_file);

    //错开 100 ms
    await delay(100);
  }
}
//************************************
