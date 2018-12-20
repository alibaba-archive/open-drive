const path = require('path')
const StorageService = require('../services/storages.js');
const driveService = require('../services/drives.js');
const shareService = require('../services/shares.js');

const IdTokenGenerator = require('../utils/id-token-generator')
const formater = require('../utils/formater');


const KEY_TYPE_ARR = ['all','one','public'];
const joinPath = formater.joinPath;
const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')

const C = require('../const.js')
const OK = C.OK
const PRIVS_ARR = C.PRIVILEGE_TYPE 
const MAX_SHARE_NAME_LEN = C.MAX_LEN_SHARE_NAME; 
const DEFAULT_LIMIT= C.DEFAULT_LIMIT

module.exports = {
  list,
  get,
  add,
  del,
  update,

  genShareKey,
  createShareByKey
}

async function genShareKey(ctx){
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
  // var cfg = ctx._cfg;

  var key_expires_sec = ctx.request.body.key_expires_time ? Math.round((new Date(ctx.request.body.key_expires_time).getTime() - Date.now()) / 1000) : 24*60*60;

  ctx.request.body.expires_time = ctx.request.body.expires_time || "Never";

  // var ID_TOKEN_PARAMS = {
  //   privateKey: cfg.keypair.privateKeyPEM,
  //   keyId: cfg.keypair.keyId,
  //   seconds: key_expires_sec
  // };

  var share_id = 'share-'+formater.genId();
  
  var opt = { 
    grant_to: 'undefined',
    share_id: share_id,
    share_name: V.name(ctx.request.body.share_name, 'share_name', MAX_SHARE_NAME_LEN),

    drive_id: V.regex(ctx.request.body.drive_id, /^[\w\-]+$/, 'drive_id'), //   drive id
    source_path: ctx.request.body.source_path, // 相对路径

    storage_source_path: '', //内部字段, 绝对路径, admin 不可见
    creator: curUserId,  // 内部字段 admin 不可见

    type: V.contains(KEY_TYPE_ARR, ctx.request.body.type, 'type'),

    privilege: V.contains(PRIVS_ARR, ctx.request.body.privilege,'privilege'),
    description: V.description(ctx.request.body.description),
    expires_time: ctx.request.body.expires_time
  }
  // if(!opt.share_name || opt.share_name.length>MAX_SHARE_NAME_LEN){
  //   throw new E.InvalidParameter('Invalid share_name')
  // }

  if(!opt.drive_id.startsWith('drive-') || opt.drive_id.indexOf('/')!=-1){
    throw new E.InvalidParameter('Invalid drive_id');
  }
  if(!opt.source_path.startsWith('/')){
    throw new E.InvalidParameter('Invalid source_path');
  }


  // if(KEY_TYPE_ARR.indexOf(opt.type)==-1){
  //   throw new E.InvalidParameter('Invalid type');
  // }
  // if(PRIVS_ARR.indexOf(opt.privilege)==-1){
  //   throw new E.InvalidParameter('Invalid privilege');
  // }

  if(opt.expires_time && opt.expires_time!='Never'){
    var expires_sec = Date.parse(opt.expires_time);
    if(!expires_sec || expires_sec<Date.now()){
      throw new E.InvalidParameter('Invalid expires_time')
    }
  }
  // if(opt.description && opt.description.length>MAX_DECS_LEN){
  //   throw new E.InvalidParameter('Invalid description')
  // }


  //权限
  //drive
  var info = await driveService.get(akInfo, {drive_id: opt.drive_id});

  if(!info){
    throw new E.NotFound('Drive is not exists');
  }

  opt.storage_source_path = joinPath(info.storage_source_path, opt.source_path);
  opt.storage_id = info.storage_id;
  var storage_id = info.storage_id;
  var storageInfo = await StorageService.get(akInfo, {storage_id})
  if(!storageInfo){
    throw new E.NotFound('Storage not found')
  }

  var result = {};

  if(opt.type == "public"){
    opt.grant_to = "*";
    result.share_id = opt.share_id;
    result.access_token = IdTokenGenerator.gen( {
      userId: "*",
      customJson: JSON.stringify({
        isAdmin: false,
        privilege: 'readonly'
      })
    },key_expires_sec);
    //result.user_id = "*"; 
    result.expires_time = opt.expires_time;
  }
  else{
    result.key = IdTokenGenerator.gen( {
      share_id: opt.share_id,
      expires_time: ctx.request.body.expires_time,
      type: opt.type
    },key_expires_sec);
  }

  var updated_at = new Date().toISOString();
  opt.created_at = updated_at;
  opt.updated_at = updated_at;

  await shareService.put(akInfo, opt);

  ctx.body = result;
}

async function createShareByKey(ctx){
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
  // var cfg = ctx._cfg;
  var key = ctx.request.body.key;
   

  try {
    var opt = IdTokenGenerator.decode(key);
  } catch (e) {
    throw new E.InvalidParameter("Invalid key");
  }

  var share_id= opt.share_id

  var shareInfo = await shareService.get(akInfo,  {share_id });
  if(!shareInfo){
    throw new E.NotFound("Share not found");
  }

  if(opt.type == "public"){
    // 不应该进入此方法
  }
  else if(opt.type == "one"){
    if(shareInfo){
      await shareService.del(akInfo, {share_id});
      shareInfo.grant_to = curUserId;
      shareInfo.share_id = 'share-' + formater.genId();
      shareInfo.expires_time = opt.expires_time;
    }
    else{
      throw new E.InvalidParameter("Invalid key");
    }
  }
  else if(opt.type == "all"){
    shareInfo.grant_to = curUserId;
    shareInfo.expires_time = opt.expires_time;
    //check exists
    var info2 = await checkExists(akInfo, shareInfo);
    if(info2){
      ctx.body = { 
        "grant_to": info2.grant_to,
        "share_id": info2.share_id,
        "code": "OK",
        "message": "success"
      };
      return ;
    }
    opt.share_id = 'share-'+formater.genId();
  }

  var updated_at = new Date().toISOString();
  shareInfo.created_at = updated_at;
  shareInfo.updated_at = updated_at;

  //可以创建
  var result = await shareService.put(akInfo, shareInfo);

  ctx.body = { 
    "grant_to": shareInfo.grant_to,
    "share_id": shareInfo.share_id,
    "code": "OK",
    "message": "success"
  };

}

async function update(ctx){
  //update:  total_size, description, privilege, expires_time
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var share_id= ctx.params.shareId

  //get share
  var info = await shareService.get(akInfo, {share_id });
  if(!info){
    throw new E.NotFound('share not found')
  }
  if(!ctx.customJson.isAdmin || ctx.customJson.privilege=='readonly' || curUserId != info.creator){
    throw new E.NoPermission('Require writable admin permission')
  }


  var opt = {
    share_id,

    share_name: ctx.request.body.share_name?V.name(ctx.request.body.share_name, 'name',MAX_SHARE_NAME_LEN):undefined,
    expires_time: ctx.request.body.expires_time||undefined,
    privilege: ctx.request.body.privilege? V.contains(PRIVS_ARR, ctx.request.body.privilege, 'privilege'):undefined,
    description: ctx.request.body.description? V.description( ctx.request.body.privilege):undefined,

    updated_at: new Date().toISOString()
  }; 

  if(opt.expires_time && opt.expires_time!='Never'){
    if(!Date.parse(expires_time)){
      throw new E.InvalidParameter('Invalid expires_time')
    }
  } 

  //可以修改
  await shareService.update(akInfo, opt);
  ctx.body = OK

}

async function add(ctx){

  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var created_at = new Date().toISOString();

  var opt = { 
    grant_to: ctx.params.userId,
    share_id: 'share-'+formater.genId(),
    share_name: V.name(ctx.request.body.share_name,'share_name',MAX_SHARE_NAME_LEN),

    drive_id: ctx.request.body.drive_id, //   drive id
    source_path: ctx.request.body.source_path, // 相对路径

    storage_source_path: '', //内部字段, 绝对路径, admin 不可见
    creator: curUserId,  // 内部字段 admin 不可见

    privilege: V.contains(PRIVS_ARR, ctx.request.body.privilege, 'privilege'),
    description: V.description(ctx.request.body.description),
    expires_time: ctx.request.body.expires_time || 'Never',

    created_at,
    updated_at: created_at
  }
  // if(!opt.share_name || opt.share_name.length> MAX_SHARE_NAME_LEN){
  //   throw new E.InvalidParameter('Invalid share_name')
  // }

  if(!opt.drive_id.startsWith('drive-') || opt.drive_id.indexOf('/')!=-1){
    throw new E.InvalidParameter('Invalid drive_id');
  }
  if(!opt.source_path.startsWith('/')){
    throw new E.InvalidParameter('Invalid source_path');
  }
  // if(PRIVS_ARR.indexOf(opt.privilege)==-1){
  //   throw new E.InvalidParameter('Invalid privilege');
  // }

  if(opt.expires_time && opt.expires_time!='Never'){
    if(!Date.parse(opt.expires_time)){
      throw new E.InvalidParameter('Invalid expires_time')
    }
  }
  // if(opt.description && opt.description.length> MAX_DESC_LEN){
  //   throw new E.InvalidParameter('Invalid description')
  // }


  //权限
  //drive
  var info = await driveService.get(akInfo, {drive_id: opt.drive_id});

  if(!info){
    throw new E.NotFound('Drive is not exists');
  }else{
    if(!ctx.customJson.isAdmin || ctx.customJson.privilege=='readonly'){
      if(info.privilege!='grantable' || (info.grant_to != curUserId && info.grant_to != '*')){
        throw new E.NoPermission('Require grantable privilege')
      }
    }
  }

  opt.storage_source_path = joinPath(info.storage_source_path, opt.source_path);
  opt.storage_id = info.storage_id; 
  var storageInfo = await StorageService.get(akInfo, {storage_id: info.storage_id})
  if(!storageInfo){
    throw new E.NotFound('Storage not found')
  }

  //check exists
  var info2 = await checkExists(akInfo, opt);
  if(info2){
    throw new E.AlreadyExists('Shares already exists');
  }

  //可以创建
  await shareService.put(akInfo, opt);

  ctx.status=201;
  ctx.body = { 
    grant_to: opt.grant_to,
    share_id: opt.share_id
  };
}



async function checkExists(akInfo, {grant_to, storage_id, storage_source_path}){

  var marker = "";
  do{
    var result = await shareService.listByPathGrantTo(akInfo, {storage_id, storage_source_path, grant_to,
      limit: DEFAULT_LIMIT,
      marker: marker
    });
    var arr = result.items;
    if(arr.length>0){
      return arr[0]
    }
    marker = result.next_marker;
  }while(marker);
  return null;
}

async function list(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var opt = { 
    grant_to: ctx.params.userId,
    share_name: ctx.query.shareName,
    expires_time: new Date().toISOString(),
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit)
  }

  if(opt.grant_to != curUserId && !ctx.customJson.isAdmin){
    throw new E.NoPermission('Cannot list shares that do not belong to you')
  }
 

  var result = await shareService.listByGrantTo(akInfo, {grant_to: opt.grant_to});
  if(result.items && !ctx.customJson.isAdmin ){
    result.items.forEach(n=>{
      delete n.storage_source_path
    });
  }
  ctx.body = result;
}


async function get(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var grantTo = ctx.params.userId;
  var share_id = ctx.params.shareId;

  if(grantTo != '*' && grantTo != curUserId && !ctx.customJson.isAdmin){
    throw new E.NoPermission('Cannot get share info that do not belong to you')
  }

  var info = await shareService.get(akInfo, {share_id});
  if(!info){
    throw new E.NotFound('share not found')
  }

  if(!ctx.customJson.isAdmin){
    delete info.storage_source_path;
  }
  ctx.body = info;
}


async function del(ctx){
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var grantTo = ctx.params.userId;
  var share_id = ctx.params.shareId;

  var info = await shareService.get(akInfo,{share_id});
  if(!info){
    ctx.status=204;
    ctx.body=null;
    return;
   // throw new E.NotFound('share not found')
  }

  if(grantTo != curUserId && info.creator != curUserId
    && (!ctx.customJson.isAdmin || ctx.customJson.privilege=='readonly')) {
      throw new E.NoPermission('Cannot get share info that do not belong to you')
  }

  await shareService.del(akInfo, {share_id});

  ctx.status=204;
  ctx.body=null;
}
