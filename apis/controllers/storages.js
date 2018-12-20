
const storageService = require('../services/storages.js');
const driveService = require('../services/drives.js');
// const QuotaService = require('../services/quotas.js');
const Formater = require('../utils/formater.js');
const Oss = require('../utils/oss')


const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')

const C = require('../const.js')
const OK = C.OK
const MAX_LEN_DRIVE_NAME=C.MAX_LEN_DRIVE_NAME;
const REGEX_REGION = C.REGEX_REGION;
const REGEX_BUCKET = C.REGEX_BUCKET
const REGEX_ROLE_ARN = /^acs\:ram\:\:(\d+)\:role/;
const REGEX_ENDPOINT = /^https?\:\/\/.+/;

module.exports = {
  update,
  list,
  get,
  del,
  add
}
async function add(ctx) {
  V.checkWriteAdmin(ctx)
  
  var akInfo = ctx._ak_info;
 
  var curUserId = ctx.userId;
  var storage_id = `storage-${Formater.genId()}`;

  var created_at = new Date().toISOString();

  var opt = { 
    storage_id, 

    storage_name: V.name(ctx.request.body.storage_name,'storage_name'),
    description: V.description(ctx.request.body.description),
    region: V.regex(ctx.request.body.region, REGEX_REGION, 'region'), //region
    
    oss_bucket: V.regex(ctx.request.body.oss_bucket, REGEX_BUCKET, 'oss_bucket'),
    oss_key: ctx.request.body.oss_key||'',
    
    role_arn:  ctx.request.body.role_arn||'',
    sts_endpoint: V.regex(ctx.request.body.sts_endpoint||"https://sts.aliyuncs.com", REGEX_ENDPOINT, 'sts_endpoint'),
    access_key_id: V.required(ctx.request.body.access_key_id, 'access_key_id'),
    access_key_secret: V.required(ctx.request.body.access_key_secret,'access_key_secret'),
    creator: curUserId,

    //网盘属性(可选)
    init_drive_on: ctx.request.body.init_drive_on + "" == "true", //bool
    init_drive_size: parseInt(ctx.request.body.init_drive_size)||0, //Byte
    init_drive_name: ctx.request.body.init_drive_name,

    // 文档转换属性（可选）
    // init_office_preview_on: ctx.request.body.init_office_preview_on + "" == "true",
    // init_office_preview_project: ctx.request.body.init_office_preview_project || "", 

    // // 视频分析
    // init_video_analyse_on: ctx.request.body.init_video_analyse_on + "" == "true",
    // init_video_analyse_project: ctx.request.body.init_video_analyse_project || "", 
    // init_video_analyse_auto: ctx.request.body.init_video_analyse_auto + "" == "true",

    // //图片处理
    // init_photo_process_on: ctx.request.body.init_photo_process_on + "" == "true",
    // init_photo_process_project: ctx.request.body.init_photo_process_project || "", 

    // //Batchcompute
    // init_bc_on: ctx.request.body.init_bc_on + "" == 'true',
    // init_mns_topic: ctx.request.body.init_mns_topic || ''

    created_at,
    updated_at : created_at,
  }
 
  if(opt.init_drive_on){
    V.name(opt.init_drive_name, 'init_drive_name', MAX_LEN_DRIVE_NAME) 
  }

  var role_arn_match = opt.role_arn.match(REGEX_ROLE_ARN)
  if(role_arn_match==null){
    throw new E.InvalidParameter('Invalid role_arn')
  }
  else{
    opt.account_id = role_arn_match[1]
  }


  // if(opt.init_office_preview_on) {
  //   V.required(opt.init_office_preview_project, 'init_office_preview_project') 
  //   opt.init_office_preview_project = opt.init_office_preview_project.trim(); 
  // }

  // if(opt.init_video_analyse_on) {
  //   V.required(opt.init_video_analyse_project, 'init_video_analyse_project') 
  //   opt.init_video_analyse_project = opt.init_video_analyse_project.trim(); 
  // }

  // if(opt.init_photo_process_on) {
  //   V.required(opt.init_photo_process_project, 'init_photo_process_project') 
  //   opt.init_photo_process_project = opt.init_photo_process_project.trim();  
  // }

  // if(opt.init_bc_on){
  //   if(!opt.init_mns_topic){
  //     throw new E.InvalidParameter('Invalid init_mns_topic')
  //   }
  //   opt.init_mns_topic=opt.init_mns_topic.trim();
  // }

  if(opt.oss_key){
    opt.oss_key = opt.oss_key.endsWith('/') ? opt.oss_key : opt.oss_key+'/';
  }else{
    opt.oss_key = '';
  }
 
  await check_AK_Bucket_Role(opt);


  // root初始化云盘
  var root_drive_id = 'drive-'+Formater.genId();

  var opt2= {
     
    grant_to: "*",
    drive_id: root_drive_id,
    drive_name: opt.storage_name,
    storage_id: storage_id,
   

    used_size: 0,
    total_size: 0, //无限大小

    source_path: '/', // 相对路径
    storage_source_path: '/', //内部字段, 绝对路径, admin 不可见

    creator: curUserId,  // 内部字段 admin 不可见
 
    description: 'root drive', 
    status: 'enabled',

    created_at,
    updated_at : created_at,
  };
  await driveService.put(akInfo, opt2)
  //root 云盘
  opt.root_drive_id = root_drive_id;
  
  await storageService.put(akInfo, opt);

  ctx.status=201;

  ctx.body = Object.assign({ 
    storage_id: opt.storage_id,
    //root_drive_id : root_drive_id
  }, OK);
}

async function update(ctx) {
  V.checkWriteAdmin(ctx);

  var akInfo = ctx._ak_info;
  //console.log('----'+JSON.stringify(ctx[Symbol.for('#event')]))
  var curUserId = ctx.userId;
  
  var storage_id = ctx.params.storageId;

  var info = await storageService.get(akInfo, {storage_id})
  if(!info){
    throw new E.NotFound('Not found storage')
  }

  var updated_at = new Date().toISOString();

  var bodyOpt = {
    storage_id: storage_id,
//只能修改这些字段 
    description: V.description(ctx.request.body.description),
    role_arn: ctx.request.body.role_arn,
    access_key_id: ctx.request.body.access_key_id,
    access_key_secret: ctx.request.body.access_key_secret, 

    init_drive_size: !isNaN(ctx.request.body.init_drive_size) ? parseInt(ctx.request.body.init_drive_size): undefined,
    updated_at
  };

  if(bodyOpt.init_drive_size < 0){
    throw new E.InvalidParameter('Invalid init_drive_size')
  }


  if(bodyOpt.role_arn){
    var role_arn_match = bodyOpt.role_arn.match(REGEX_ROLE_ARN)
    if(role_arn_match==null){
      throw new E.InvalidParameter('Invalid role_arn')
    }
    else{
      bodyOpt.account_id = role_arn_match[1]
    }
  }

  //update
  if(bodyOpt.access_key_secret){
    if(bodyOpt.access_key_secret.indexOf('*') != -1){
      delete bodyOpt.access_key_secret;
    }
  }


  await check_AK_Bucket_Role({...info, ...bodyOpt});


  // OSS类型, root初始化云盘
  if(!info.root_drive_id){
    var root_drive_id = 'drive-'+Formater.genId();

    var opt2= {
      drive_id: root_drive_id,

      grant_to: "*",
      
      drive_name: info.storage_name,
      storage_id: storage_id,
      source_path: '/', // 相对路径

      used_size: 0,
      total_size: 0, //无限大小

      storage_source_path: '/', //内部字段, 绝对路径, admin 不可见
      creator: curUserId,  // 内部字段 admin 不可见

      description: 'root drive',

      status: 'enabled',

      created_at: updated_at,
      updated_at,
    };
    await driveService.put(akInfo, opt2)
    //root 云盘
    bodyOpt.root_drive_id = opt2.drive_id;
  }

  await storageService.update(akInfo, bodyOpt)

  ctx.body = OK
}
async function list(ctx) {
  //check Permission
  V.checkReadAdmin(ctx)

  var opt = {
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit)
  }


  var akInfo = ctx._ak_info;
  var result = await storageService.list(akInfo, opt);
  //ctx.body = result;
  var arr = result.items;
  if(arr){
    arr.forEach(n=>{
      n.access_key_secret = hideSecret(n.access_key_secret);
      //changeSwitch2Boolean(n);
    })
  }

  ctx.body = {
    items: arr,
    next_marker: result.next_marker
  };
}
async function get(ctx) {
  V.checkReadAdmin(ctx)

  var akInfo = ctx._ak_info;
    
  var storage_id = ctx.params.storageId;
  var info = await storageService.get(akInfo, {storage_id});
  if(!info){
    throw new E.NotFound('Not found storage')
  }
  info.access_key_secret = hideSecret(info.access_key_secret)

  //转化开关为boolean
  //changeSwitch2Boolean(info)

  ctx.body = info;
}

// function changeSwitch2Boolean(item){
//   item.init_bc_on = (item.init_bc_on+'') === "true" ? true : false;
//   item.init_drive_on = (item.init_drive_on+'') === "true" ? true : false;
//   item.init_office_preview_on = (item.init_office_preview_on+'') === "true" ? true : false;
//   item.init_video_analyse_on = (item.init_video_analyse_on+'') === "true" ? true : false;
//   item.init_video_analyse_auto = (item.init_video_analyse_auto+'') === "true" ? true : false;
// }

async function del(ctx) {
  V.checkWriteAdmin(ctx)

  var akInfo = ctx._ak_info;
    
  var storage_id = ctx.params.storageId;

  var info = await storageService.get(akInfo, {storage_id})
  if(!info){
    ctx.status=204;
    ctx.body=null;
    return;
  }

  //check has drive
  var result = await driveService.listByStorage(akInfo, { 
    storage_id 
  });

  if(result.items.length > 1 || (result.items.length == 1 && result.items[0].drive_id != info.root_drive_id)){
    throw new E.NotEmpty('Storage is not empty');
  }

  if(result.items.length == 1 && result.items[0].drive_id == info.root_drive_id){
    await driveService.del(akInfo, {drive_id: result.items[0].drive_id});
  }

  await storageService.del(akInfo, {storage_id});


  ctx.status=204;
  ctx.body=null;
}


function hideSecret(s){
  if(!s)return s;
  if(s.length<6) return "******";
  else return `${s.substring(0,3)}******${s.substring(s.length-3)}`
}

async function check_AK_Bucket_Role(opt){
  console.log({
    region: opt.region,
    //endpoint: Formater.getEndpoint(opt, 'oss_endpoint'),
    accessKeyId: opt.access_key_id,
    accessKeySecret: opt.access_key_secret
  })
  try{
    var bucketList = await Oss.listBuckets({
      region: opt.region,
      //endpoint: Formater.getEndpoint(opt, 'oss_endpoint'),
      accessKeyId: opt.access_key_id,
      accessKeySecret: opt.access_key_secret
    }, {
      bucket: opt.oss_bucket
    });
  }
  catch(e){
    console.log(e)
    throw new E.InvalidParameter('Invalid access_key')
  }

  var ossBucket = await bucketList.buckets.find((item) => {
    return item.name == opt.oss_bucket;
  })

  if(!ossBucket){
    throw new E.InvalidParameter('Bucket is not found')
  }

  if(ossBucket.StorageClass != "Standard"){
    throw new E.InvalidParameter('bucket type must be Standard')
  }

}
