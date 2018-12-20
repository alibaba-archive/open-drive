
const storageService = require('../services/storages.js');
const driveService = require('../services/drives.js');
const shareService = require('../services/shares.js');

const ossFile = require('../models/oss-files')
const formater = require('../utils/formater');


const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')

const C = require('../const.js')
const OK = C.OK
const STATUS_TYPE = C.STATUS_TYPE


module.exports = {
  list,
  get,
  add,
  del,
  update
}


async function update(ctx){
  
  V.checkWriteAdmin(ctx)

  var akInfo = ctx._ak_info;
  var drive_id = ctx.params.driveId;

  //get drive
  var info = await driveService.get(akInfo, {drive_id});
  if(!info){
    throw new E.NotFound('drive not found')
  }

  var updated_at = new Date().toISOString();

  var opt = { 
    grant_to: ctx.params.userId,
    drive_id: ctx.params.driveId,
    //可以修改
    drive_name: ctx.request.body.drive_name?V.name(ctx.request.body.drive_name, 'drive_name'):undefined,
    description: ctx.request.body.description?V.description(ctx.request.body.description):undefined,
    total_size: ctx.request.body.total_size!=null? parseInt(ctx.request.body.description)||0:undefined,
    status: ctx.request.body.status ? V.contains(STATUS_TYPE, ctx.request.body.status,'status'): undefined,

    updated_at
  };
  
  await driveService.update(akInfo, opt);
  ctx.body = OK

}

async function add(ctx){
  V.checkWriteAdmin(ctx)
   
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var created_at = new Date().toISOString();

  var drive_id = 'drive-'+formater.genId();
  var opt = {
    drive_id,

    grant_to: V.required(ctx.params.userId, 'grant_to'),
    drive_name: V.name(ctx.request.body.drive_name, 'drive_name'),
    storage_id: V.required(ctx.request.body.storage_id, 'storage_id'),
  
    used_size: 0,
    total_size: parseInt(ctx.request.body.total_size)||0,

    creator: curUserId,  // 内部字段 admin 不可见

    description: V.description(ctx.request.body.description),
    status: V.contains(STATUS_TYPE, ctx.request.body.status || 'enabled', "status"),

    storage_source_path: '/'+drive_id+'/',
    source_path: '/'+drive_id+'/',

    updated_at: created_at,
    created_at
  }

  if(!opt.storage_id || opt.storage_id.indexOf('/')!=-1){
    throw new E.InvalidParameter('Invalid storage_id');
  }
  
  var storageInfo = await storageService.get(akInfo, {storage_id: opt.storage_id})
  if(!storageInfo){
    throw new E.NotFound('Storage not found')
  }

  if(opt.total_size>0){
    var pathIsNull = await checkPathIsNull(storageInfo, opt)
    if(!pathIsNull){
      throw new E.NotEmpty('Path is not empty')
    }
  }

  //可以创建
  await driveService.put(akInfo, opt);

  ctx.status=201;
  ctx.body = {
    drive_id: opt.drive_id
  };
}

async function checkPathIsNull (storageInfo, opt){
  var result = await ossFile.list(storageInfo, {
    ...opt,
    dir_path: '/'
  });
  return result.items.length == 0;
}


async function list(ctx) {
  V.checkReadAdmin(ctx)
 
  var akInfo = ctx._ak_info;

  var opt = { 
    grant_to: ctx.params.userId,
    
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit)
  }
 
  var result = await driveService.listByGrantTo(akInfo, opt);

  ctx.body = result;
}


async function get(ctx) {
  V.checkReadAdmin(ctx)
 
  var akInfo = ctx._ak_info;
  
  var drive_id = ctx.params.driveId;
 
  var info = await driveService.get(akInfo, {drive_id});
  if(!info){
    throw new E.NotFound('drive not found')
  }

  ctx.body = info;
}


async function del(ctx){
  V.checkWriteAdmin(ctx)

  var akInfo = ctx._ak_info;
 
  var drive_id = ctx.params.driveId;
 
  var info = await driveService.get(akInfo, {drive_id});
  if(!info){
    ctx.status=204;
    ctx.body=null;
    return;
  }

  await checkDriveEmpty(akInfo, info)

  await driveService.del(akInfo, {drive_id});

  ctx.status=204;
  ctx.body=null
}

async function checkDriveEmpty(akInfo, driveInfo){
   
  //1. check has share
  var result2 = await shareService.listByPathGrantTo(akInfo, {
    storage_id: driveInfo.storage_id,
    storage_source_path: driveInfo.storage_source_path
  });
  
  if(result2.items.length>0){
    throw new E.NotEmpty('Drive is not empty');
  }
}
