const REQUIRED_FIELDS = ['dir_path'];
const TYPE_ARR = ['folder', 'file'];

const StorageService = require('../services/storages')
const DriveService = require('../services/drives')
const Formater = require('../utils/formater')
const ShareService = require('../services/shares')
const FileService = require('../services/files')
const OssFiles = require('../models/oss-files')
const V = require('../utils/validator')
const joinPath = Formater.joinPath;

const E = require('../utils/exceptions.js')

const path = require('path')

const C = require('../const')
const OK = C.OK
const IMAGE_SN_PROCESS = C.IMAGE_SN_PROCESS
const MAX_LEN_FILE_NAME = C.MAX_LEN_FILE_NAME;

module.exports = {
  get,
  list,
  add,
  del,
  move,
  copy,
  complete,
  completeForCallback
}

async function list(ctx) {

  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var dir_path = ctx.query.dir_path || '/';

  var opt = { 
    share_id: shareId,

    dir_path: dir_path,
    name: ctx.query.name || '',
    //type: ctx.query.type || '',  // null, file, folder
    marker: ctx.query.marker || '',
    limit: parseInt(ctx.query.limit) || 10,

    url_expires_sec: parseInt(ctx.query.url_expires_sec) || 3600,
    image_snap_url_process: ctx.query.image_snap_url_process || IMAGE_SN_PROCESS
  };

  if (!opt.dir_path.startsWith('/')) {
    throw new E.InvalidParameter('Invalid dir_path')
  }
  opt.dir_path = opt.dir_path.replace(/(\/*$)/, '') + '/';


  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo,  curUserId, shareId);

  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;

  var storageInfo = await StorageService.get(akInfo, {storage_id: opt.storage_id})
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }


  //oss
  var result = await OssFiles.list(storageInfo, opt);

  ctx.body = result;
}

async function get(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),

    url_expires_sec: parseInt(ctx.query.url_expires_sec) || 3600,
    image_snap_url_process: ctx.query.image_snap_url_process || IMAGE_SN_PROCESS
  };

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo,  curUserId, shareId)

  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;

  var storageInfo = await StorageService.get(akInfo, {storage_id:  opt.storage_id})
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }

  //oss
  var result = await OssFiles.get(storageInfo, opt);

  ctx.body = result;
}

async function add(ctx) {
  var oss_key;
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;

  var ststoken = ctx.request.body.return_ststoken+'' == "true";
  var signedUrl = ctx.request.body.return_signed_url+'' == "true";
  var signed_url_expires_sec = parseInt(ctx.request.body.signed_url_expires_sec)||3600;

  var opt = { 
    share_id: shareId,

    name: ctx.request.body.name,
    dir_path: ctx.request.body.dir_path || '/',
    type: ctx.request.body.type || 'folder',
    size: parseInt(ctx.request.body.size) || 0,

    content_type: ctx.request.body.content_type||'',
    content_md5: ctx.request.body.content_md5||'',

    signed_url_expires_sec: signed_url_expires_sec
  };

  for (var n of REQUIRED_FIELDS) {
    if (!opt[n]) throw new E.InvalidParameter(n + ' is required');
  }

  V.validateDirPath(opt.dir_path, 'dir_path')

  if (opt.name.indexOf('/') != -1 || opt.name.length > MAX_LEN_FILE_NAME) {
    throw new E.InvalidParameter('Invalid name')
  }
  if (TYPE_ARR.indexOf(opt.type) == -1) {
    throw new E.InvalidParameter('Invalid type')
  }


  opt.status = opt.type == 'folder' ? 'normal' : 'uploading';
  opt.size = opt.type == 'folder' ? 0 : opt.size;

  //opt.dir_path = joinPath(info.storage_source_path, opt.dir_path)
  opt.dir_path = joinPath(opt.dir_path, '/');

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo,  curUserId, shareId);
  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;


  //oss
  storageInfo = await StorageService.get(akInfo, {storage_id: opt.storage_id});
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }


  if (opt.type == 'folder') {

    var result = await OssFiles.createFolder(storageInfo, opt)
  }

  else {
    // 创建文件
    //throw new E.InvalidParameter('Not need to create a file for the store type is "oss"')

    //判断文件是否已经存在
    var fileInfo = await OssFiles.get(storageInfo, opt);

    oss_key = joinPath(storageInfo.oss_key,
      opt.storage_source_path,
      opt.dir_path,
      opt.name);

    oss_key = oss_key.replace(/^\//, '');

    result = { 
      share_id: opt.share_id,
      path: joinPath(opt.dir_path, opt.name)
    };


    if(!fileInfo && !FileService.calcDriveUsedSize(driveInfo, 0, opt.size)){
      //文件不存在, 且空间不够
      throw new E.NotEnoughSpace('Not enough space');
    }

    if(fileInfo){
      if(!ststoken && !signedUrl){
        throw new E.AlreadyExists(opt.type + ' already exists');
      }
      else{
        //需要返回ststoken 或 signedUrl
        result.message = opt.type + ' already exists';
      }
    }

    
    if(signedUrl){
      //需要 signedUrl
      result.signed = await FileService.getSignedUrlInner(storageInfo, oss_key, true, opt.name, opt.signed_url_expires_sec, opt.content_type, opt.content_md5);
    }else if(ststoken){
      //需要返回ststoken
      result.sts = await FileService.getStsTokenInner(storageInfo, oss_key, true, 3600);
    }

  }


  ctx.status = 201;
  ctx.body = result;
}


async function del(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,
    file_path: filePath,
    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),
  };

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)
  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  var storageId = shareInfo.storage_id;
  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;


  //oss

  var storageInfo = await StorageService.get(akInfo, {storage_id: storageId});
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }


  if (filePath.endsWith('/')) {
    //是目录
    if (ctx.query.op_type == 1) {
      opt.type = "folder";
      await OssFiles.delRecursion(akInfo, storageInfo, driveInfo, [opt]);
      //list shares, remove share
      var dir_path = joinPath('/', opt.storage_source_path, filePath, '/')
      var sharesResult = await ShareService.listByPath(akInfo, {
        storage_id: opt.storage_id,
        storage_source_path: dir_path
      });

      if (sharesResult.items.length > 0) {
        for (let n of sharesResult.items) {
          await ShareService.del(akInfo, {share_id:n.share_id})
        }
      }
      ctx.status = 204;
      ctx.body = null;
      return;
    }
    else {
      //list files
      var findSubOpt = Object.assign({}, opt, {
        dir_path: joinPath('/', opt.dir_path, opt.name, '/')
      })
      var file_list_result = await OssFiles.list(storageInfo, findSubOpt)
      if (file_list_result.items.length > 0) {
        throw new E.NotEmpty('Current directory is not empty')
      }

      //list shares, remove share
      var dir_path = joinPath('/', opt.storage_source_path, filePath, '/')
      var sharesResult = await ShareService.listByPath(akInfo,{
        storage_id: opt.storage_id, 
        storage_source_path: dir_path,  
      });

      if (sharesResult.items.length > 0) {
        for (let n of sharesResult.items) {
          await ShareService.del(akInfo, {share_id: n.share_id})
        }
      }
    }
  } else {
    //file
    if (driveInfo.total_size) {
      var ossFileInfo = await OssFiles.get(storageInfo, opt)
      await DriveService.updateSize(akInfo, driveInfo, -ossFileInfo.size);
    }

  }

  await OssFiles.del(storageInfo, opt)



  ctx.status = 204;
  ctx.body = null;
}


async function move(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,
    file_path: filePath,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),

    new_dir_path: ctx.request.body.new_dir_path || '',
    new_name: ctx.request.body.new_name || '',
  };

  if (opt.new_name.length > MAX_LEN_FILE_NAME) {
    throw new E.InvalidParameter('Invalid new_name')
  }

  V.validateDirPath(opt.new_dir_path, 'new_dir_path')

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)

  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  var storageId = shareInfo.storage_id;
  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;



  //oss
  var storageInfo = await StorageService.get(akInfo, {storage_id:  storageId});
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }

  if (ctx.request.body.op_type == 1) {
    var result = await OssFiles.moveRecursion(storageInfo, opt);
    ctx.status = 200;
    ctx.body = OK;
    return;
  }

  if (filePath.endsWith('/')) {
    //是目录

    //list files
    //list files
    var findSubOpt = Object.assign({}, opt, {
      dir_path: joinPath('/', opt.dir_path, opt.name, '/')
    })

    var file_list_result = await OssFiles.list(storageInfo, findSubOpt)
    if (file_list_result.items.length > 0) {
      throw new E.NotEmpty('Current directory is not empty')
    }

    //list shares, remove share
    var dir_path = joinPath('/', opt.storage_source_path, filePath, '/')
    var sharesResult = await ShareService.listByPath(akInfo, {
      storage_id: opt.storage_id, 
      storage_source_path: dir_path 
    });

    if (sharesResult.items.length > 0) {
      for (let n of sharesResult.items) {
        await ShareService.del(akInfo, {share_id: n.share_id})
      }
    }
  }

  await OssFiles.move(storageInfo, opt);


  ctx.status = 201;
  ctx.body = OK;
}
async function copy(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,
    file_path: filePath,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),

    new_dir_path: ctx.request.body.new_dir_path || '',
    new_name: ctx.request.body.new_name || '',
  };

  if (opt.new_name.length > MAX_LEN_FILE_NAME) {
    throw new E.InvalidParameter('Invalid new_name')
  }

  V.validateDirPath(opt.new_dir_path, 'new_dir_path')

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo,  curUserId, shareId)

  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  var storageId = shareInfo.storage_id;
  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;



  //oss
  var storageInfo = await StorageService.get(akInfo, {storage_id: storageId});
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }
  if (ctx.request.body.op_type == 1) {
    var result = await OssFiles.copyRecursion(akInfo, storageInfo, driveInfo, opt);
    ctx.status = 200;
    ctx.body = OK;
    return;
  }

  var ossFileInfo = await OssFiles.get(storageInfo, opt)
  if (!ossFileInfo) {
    throw new E.NotFound('Not found file')
  }

  ossFileInfo.size = parseInt(ossFileInfo.size, 10) || 0;

  // 将文件size加入drive的used_size
  await DriveService.updateSize(akInfo, driveInfo, ossFileInfo.size);

  var result = await OssFiles.copy(storageInfo, opt);



  ctx.status = 201;
  ctx.body = result;
}

async function complete(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,
    file_path: filePath,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),
  };

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)
  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  // var storageId = shareInfo.storage_id;
  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;

  var storageInfo = await StorageService.get(akInfo, {storage_id: opt.storage_id});


  var ossFileInfo = await OssFiles.get(storageInfo, opt);
  if (!ossFileInfo) {
    throw new E.NotFound('Not found file')
  }
  opt.size = ossFileInfo.size

  try {
    await DriveService.updateSize(akInfo, driveInfo, opt.size);
  } catch (e) {
    if (e.code == 'NotEnoughSpace') {
      //空间不够，删除
      await OssFiles.del(storageInfo, opt);
    }
    throw e;
  }

  //check start
  // await IMMSvs.checkStartVideoAnalyseJob(opt, storageInfo, driveInfo)


  ctx.status = 201;
  ctx.body = Object.assign({}, OK)

}

async function completeForCallback(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var shareId = ctx.request.body.shareid;
  var filePath = ctx.request.body.filepath;

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    share_id: shareId,
    file_path: filePath,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),
  };

  //校验权限
  var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)
  if (shareInfo.privilege == 'readonly') {
    throw new E.NoPermission('You do not have enough permission')
  }

  //var storageId = shareInfo.storage_id;
  opt.storage_id = shareInfo.storage_id;
  opt.storage_source_path = shareInfo.storage_source_path;

  var storageInfo = await StorageService.get(akInfo, {storage_id:  shareInfo.storage_id});

  var ossFileInfo = await OssFiles.get(storageInfo, opt);
  if (!ossFileInfo) {
    throw new E.NotFound('Not found file')
  }
  opt.size = ossFileInfo.size

  try {
    await DriveService.updateSize(akInfo, driveInfo, opt.size);
  } catch (e) {
    if (e.code == 'NotEnoughSpace') {
      //空间不够，删除
      await OssFiles.del(storageInfo, opt);
    }
    throw e;
  }

   
  ctx.status = 201;
  ctx.body = Object.assign({}, OK)

}
///////////////////
async function checkSharePermission(ctx, akInfo,  curUserId, shareId) {
  var shareInfo = await ShareService.get(akInfo, {share_id: shareId});
  if (!shareInfo) {
    throw new E.NotFound('share not found')
  }
  if (!ctx.customJson.isAdmin && shareInfo.grant_to != curUserId && shareInfo.grant_to != "*") {
    throw new E.NotFound('share does not belongs to you')
  }
  var driveInfo = await DriveService.get(akInfo, {drive_id: shareInfo.drive_id});
  if (driveInfo.status && driveInfo.status == "disabled") {
    throw new E.NoPermission('no permission')
  }
  return {
    shareInfo,
    driveInfo
  }
}
