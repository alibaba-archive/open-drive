
// const STATUS_ARR = ['normal', 'uploading']
const SIGNED_TYPE_ARR = ['download', 'upload']
const StorageService = require('../services/storages')
const DriveService = require('../services/drives')
const ShareService = require('../services/shares') 
const FileService = require('../services/files')

const E = require('../utils/exceptions')
const V = require('../utils/validator')
const formater = require('../utils/formater')

const path = require('path')
const joinPath = formater.joinPath;
const C = require('../const') 

module.exports = {
  getStsToken,
  getSignedUrl, 
}

 
async function getStsToken(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 

  var driveId = ctx.params.driveId;
  var shareId = ctx.params.shareId;

  var filePath = decodeURIComponent(ctx.params.filePath);

  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    drive_id: driveId,
    share_id: shareId,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),

    expires_sec: parseInt(ctx.request.body.expires_sec) || 3600,
    token_type: ctx.request.body.type || ctx.request.body.token_type || 'upload'  //upload download
  };

  if (opt.token_type != "upload") {
    throw new E.InvalidParameter('Invalid type');
  }

  if (opt.expires_sec <= 0) {
    throw new E.InvalidParameter('Invalid expires_sec');
  }

  if(opt.share_id){
    //校验权限
    var { shareInfo, driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)
    if (shareInfo.privilege == 'readonly' && opt.token_type == 'upload') {
      throw new E.NoPermission('You do not have enough permission')
    }

    Object.assign(opt, {
      storage_id: shareInfo.storage_id,
      source_path: shareInfo.storage_source_path,
      storage_source_path: shareInfo.storage_source_path
    });

  }else{
    //校验权限
    var driveInfo = await checkDrivePermission(ctx, akInfo, curUserId, driveId)
    if (driveInfo.privilege == 'readonly' && opt.token_type == 'upload') {
      throw new E.NoPermission('You do not have enough permission')
    }

    Object.assign(opt,{
      storage_id: driveInfo.storage_id,
      source_path: driveInfo.source_path,
      storage_source_path: driveInfo.storage_source_path
    });

  }

  var storageInfo = await StorageService.get(akInfo, {storage_id:  opt.storage_id});

  var oss_key = joinPath(storageInfo.oss_key,
    opt.source_path,
    opt.dir_path,
    opt.name);

  oss_key = oss_key.replace(/^\//, '');

  var result = await FileService.getStsTokenInner(storageInfo, oss_key, opt.token_type == 'upload', 3600)
  ctx.status = 201;
  ctx.body = result;
}




async function getSignedUrl(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var driveId = ctx.params.driveId;
  var shareId = ctx.params.shareId;
  var filePath = decodeURIComponent(ctx.params.filePath);



  if (!filePath.startsWith('/')) {
    throw new E.InvalidParameter('Invalid filePath')
  }

  var opt = { 
    drive_id: driveId,
    share_id: shareId,
    file_path: filePath,

    dir_path: path.dirname(filePath).replace(/(\/*$)/g, '') + '/',
    name: path.basename(filePath),
    expires_sec: parseInt(ctx.request.body.expires_sec) || 3600,
    type: ctx.request.body.type || 'upload',

    content_type: ctx.request.body.content_type || '',
    content_md5: ctx.request.body.content_md5 || ''
  };

  if (opt.expires_sec <= 0) {
    throw new E.InvalidParameter('Invalid expires_sec');
  }
  if (SIGNED_TYPE_ARR.indexOf(opt.type) == -1) {
    throw new E.InvalidParameter('Invalid type');
  }


  if(opt.share_id){
    //校验权限
    var { shareInfo, _driveInfo } = await checkSharePermission(ctx, akInfo, curUserId, shareId)
    if (!shareInfo) {
      throw new E.NotFound('Share not found');
    }

    Object.assign(opt, {
      storage_id: shareInfo.storage_id,
      source_path: shareInfo.storage_source_path,
      storage_source_path: shareInfo.storage_source_path
    });
  }else{
    //校验权限
    var driveInfo = await checkDrivePermission(ctx, akInfo, curUserId, driveId)
    if (!driveInfo) {
      throw new E.NotFound('Drive not found');
    }

    Object.assign(opt,{
      storage_id: driveInfo.storage_id,
      source_path: driveInfo.source_path,
      storage_source_path: driveInfo.storage_source_path
    });
  }


  var storageInfo = await StorageService.get(akInfo, {storage_id:  opt.storage_id})
  if (!storageInfo) {
    throw new E.NotFound('Not found storage')
  }


  //oss
  var oss_key = joinPath(storageInfo.oss_key,
    opt.source_path,
    opt.dir_path,
    opt.name);

  oss_key = oss_key.replace(/^\//, '');
  
  var result = await FileService.getSignedUrlInner(storageInfo, oss_key, opt.type == 'upload', opt.name, opt.expires_sec, opt.content_type, opt.content_md5);
  ctx.status = 201;
  ctx.body = result;
}


//******************************* */
//******************************* */
//******************************* */

async function checkDrivePermission(ctx, akInfo, curUserId, drive_id) {
  var info = await DriveService.get(akInfo, {drive_id});
  if (!info) {
    throw new E.NotFound('drive not found')
  }

  //grantTo 和 非只读管理员 可以
  if (ctx.customJson.isAdmin && ctx.customJson.privilege != 'readonly') {
    return info;
  }

  if (info.grant_to == curUserId) {
    if (info.status && info.status == "disabled") {
      throw new E.NoPermission('no permission')
    }
  } else {
    throw new E.NotFound('drive does not belongs to you')
  }

  return info
}



async function checkSharePermission(ctx, akInfo, curUserId, share_id) {
  var shareInfo = await ShareService.get(akInfo, {share_id});
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
