const URL = require('url')
const path = require('path')

const IdTokenGenerator = require('../utils/id-token-generator')
const V = require('../utils/validator.js')
const E = require('../utils/exceptions.js')
const C = require('../const.js')
const formater = require('../utils/formater')

const authService = require('../services/auth.js');
const userService = require('../services/users.js');
const adminService = require('../services/admins.js');
const cacheService = require('../services/cache.js');
const storageService = require('../services/storages.js');
const driveService = require('../services/drives.js');

const CODE_EXPIRES_SEC = C.CODE_CACHE_EXPIRES_SEC;
const ACCESS_TOKEN_EXPIRES_TIME = C.ACCESS_TOKEN_EXPIRES_TIME;
const REFRESH_TOKEN_EXPIRES_TIME = C.REFRESH_TOKEN_EXPIRES_TIME;
const AUTH_CALLBACK = C.AUTH_CALLBACK;
const DING_API = C.DING_API;
const ALIPAY_AUTH = C.ALIPAY_AUTH;
const joinPath = formater.joinPath;

module.exports = {
  authorize,
  callback,
  token,
  refreshToken
}



async function authorize(ctx) {
  var cfg = ctx._cfg, appId;

  var stateInfo = {
    client_id: ctx.query.client_id || 'aliyun',
    state: ctx.query.state,
    response_type: ctx.query.response_type || 'code',
    scope: ctx.query.scope || 'dingding_qrcode',
    redirect_uri: V.required(ctx.query.redirect_uri, "redirect_uri")
  };

  if (!stateInfo.response_type) {
    throw new E.InvalidParameter('response_type is required')
  }

  check_clients_redirect_uri(cfg.allow_clients, stateInfo)


  switch (stateInfo.scope) {
    default:
    case 'dingding_qrcode':
      appId = cfg.authorize.dingding.app_id;
      var infoStr = Buffer.from(JSON.stringify(stateInfo)).toString('base64');
      var redirectUri = encodeURIComponent(`${cfg.endpoint}${AUTH_CALLBACK}?info=${infoStr}`);
      var url = `${DING_API}/connect/qrconnect?appid=${appId}&response_type=code&scope=snsapi_login&redirect_uri=${redirectUri}`;
      ctx.redirect(url);
      break;
    case 'dingding_login':
      appId = cfg.authorize.dingding.app_id;
      var infoStr = Buffer.from(JSON.stringify(stateInfo)).toString('base64');
      var redirectUri = encodeURIComponent(`${cfg.endpoint}${AUTH_CALLBACK}?info=${infoStr}`);
      var url = `${DING_API}/connect/oauth2/sns_authorize?appid=${appId}&response_type=code&scope=snsapi_login&redirect_uri=${redirectUri}`;
      ctx.redirect(url);
      break;
    case 'alipay':
      appId = cfg.authorize.alipay.appId;
      var infoStr = Buffer.from(JSON.stringify(stateInfo)).toString('base64');
      var redirectUri = encodeURIComponent(cfg.endpoint+AUTH_CALLBACK);
      var url = `${ALIPAY_AUTH}?app_id=${appId}&scope=auth_user&redirect_uri=${redirectUri}&info=${infoStr}`;
      ctx.redirect(url);
      break;

  }
}

function check_clients_redirect_uri(allow_clients, stateInfo) {

  var is_in_allow_clients = false;
  for (var allowClientInfo of allow_clients) {
    if (allowClientInfo.client_id == stateInfo.client_id
      && (!allowClientInfo.redirect_uri || equals_uri(allowClientInfo.redirect_uri, stateInfo.redirect_uri))
    ) {
      is_in_allow_clients = true;
      break;
    }
  }
  if (!is_in_allow_clients) {
    throw new E.NoPermission('Invalid client_id or redirect_uri')
  }
}
function get_allow_client_info(allow_clients, client_id) {
  for (var n of allow_clients) {
    if (n.client_id == client_id) return n;
  }
  return null;
}

async function callback(ctx) {
  var info = ctx.query.info;
  var userInfo, stateInfo;
  var cfg = ctx._cfg;
  try {
    stateInfo = JSON.parse(Buffer.from(info, 'base64').toString())
  }
  catch (e) {
    console.error('Cannot parse info:' + info)
    throw new E.InvalidParameter('Invalid code')
  }

  if (stateInfo.scope === "dingding_qrcode" || stateInfo.scope === "dingding_login") {
    let code = ctx.query.code;
    let appId = cfg.authorize.dingding.app_id;
    let appSecret = cfg.authorize.dingding.app_secret;
    userInfo = await authService.getUserInfoByScope(stateInfo.scope, { appId, appSecret }, code);
    if (!userInfo) {
      throw new E.ThirdPartError(`get ${stateInfo.scope} user info by code failed, code=${code}`)
    }
  }
  else if (stateInfo.scope === "alipay") {
    let code = ctx.query.auth_code;
    let appId = cfg.authorize.alipay.appId;
    let privateKey = cfg.authorize.alipay.privateKey;
    userInfo = await authService.getUserInfoByScope(stateInfo.scope, { appId, privateKey }, code);
    if (!userInfo) {
      throw new E.ThirdPartError(`get ${stateInfo.scope} user info by code failed, code=${code}`)
    }
  }

  await authorizeBackCall(ctx, userInfo, stateInfo, true)
}


async function authorizeBackCall(ctx, userInfo, stateInfo, initAdmin = false) {
  // var cfg = ctx._cfg;
  var akInfo = ctx._ak_info;

  //写入 user 表
  //初始化云盘
  var retUser = await initUserAndDrive(akInfo, userInfo);

  // 判断 status
  if (retUser.status == 'disabled') {
    throw new E.NoPermission('This user is disabled')
  }

  var customJson = {
    clientId: stateInfo.client_id,
    scope: stateInfo.scope,
    isAdmin: false
  }

  var created_at = new Date().toISOString();


  //需要check是否有admin，没有则将当前用户设置为admin
  var result = await adminService.list(akInfo, {});
  if (result.items.length == 0) {
    if (initAdmin) {
      await adminService.add(akInfo, {
        user_id: userInfo.user_id,

        privilege: 'grantable',
        description: 'created by system',

        created_at,
        updated_at: created_at
      });

      Object.assign(customJson, {
        isAdmin: true,
        privilege: 'grantable'
      })
    }
  } else {

    var adminInfo = await adminService.get(akInfo, {
      user_id: userInfo.user_id
    });
    if (adminInfo) {
      Object.assign(customJson, {
        isAdmin: true,
        privilege: adminInfo.privilege
      })
    }
  }


  var idTokenStr = JSON.stringify({
    userId: userInfo.user_id,
    customJson: JSON.stringify(customJson)
  });

  var code = 'code-' + formater.genId();

  //写入cache 表
  await cacheService.add(akInfo, {
    type: "code",
    key: code,
    value: idTokenStr,
    expires_sec: CODE_EXPIRES_SEC,
  }); //10min


  var redi_uri = stateInfo.redirect_uri;
  if (!redi_uri) {
    ctx.body = { code };
  } else {
    ctx.redirect(redi_uri + (redi_uri.indexOf('?') != -1 ? '&' : '?') + 'code=' + code
      + (stateInfo.state ? '&state=' + stateInfo.state : ''));
  }

}


async function token(ctx) {
  

  var grant_type = ctx.query.grant_type || ctx.request.body.grant_type;
  grant_type=V.contains(['authorization_code', 'client_credentials'], grant_type, "grant_type");

  // oAuth2
  if (grant_type == 'authorization_code') {
    // 通过 code 获取 access_token
    return await get_token_for_authorization_code(ctx)
  }

  //客户端模式
  if (grant_type == 'client_credentials') {
    //直接获取 access_token,  或先获取 code
    return await post_token_for_client_credentials(ctx)
  }

  throw new E.InvalidParameter('Invalid grant_type')

}
 


//客户端模式 获取 token
async function post_token_for_client_credentials(ctx) {
  var akInfo = ctx._ak_info;

  var bd = ctx.request.body;

  var params = {
    method: "POST",
    grant_type:  bd.grant_type,
    client_id: bd.client_id,
    user_id: bd.user_id,
    date: bd.date,
    response_type: V.contains(['access_token', 'code'], bd.response_type || 'access_token', 'response_type'),
    
    //可选
    user_name: bd.user_name,
    nick_name: bd.nick_name,
    description: bd.description?V.description(bd.description):undefined,
    avatar: bd.avatar
  };


  var auth = ctx.headers.authorization; // client_id signature

  // 判断时间是否过期
  var userTime = new Date(params.date).getTime();
  if (isNaN(userTime)) {
    throw new E.InvalidParameter("Invalid date");
  }
  var currentTime = new Date().getTime();
  if (Math.abs(currentTime - userTime) > 1000 * 60 * 15) {
    throw new E.InvalidParameter("Invalid date");
  }

  // 查询client
  var clientInfo = get_allow_client_info(cfg.allow_clients, params.client_id);
  // 判断client是否存在
  if (!clientInfo) {
    throw new E.NotFound('Not found client')
  }

  var signStr = getSignString(params)

  var sign = formater.hmacSha1Base64(signStr, clientInfo.secret);

  // 对比签名是否正确
  if (auth != sign) {
    console.error(`Signature did not match. ${auth}!=${sign} The correct sign-string is ${signStr}`)
    throw new E.NoPermission(`Signature did not match. The correct sign-string is:${signStr}`);
  }

  var userInfo = {
    user_id: params.user_id,
    nick_name: params.nick_name || params.user_id,
    user_name: params.user_name || params.user_id,
    user_type: params.client_id + "-user",
    description: params.description || '',
  };
  
  //gen id_token
  if(params.response_type == 'access_token'){

    // 初始化用户
    var retUser = await initUserAndDrive(akInfo, userInfo);
    // 判断 status
    if (retUser.status == 'disabled') {
      throw new E.NoPermission('This user is disabled')
    }

   
    var idTokenInfo = await getIdTokenOpt(akInfo, {
      user_id: params.user_id,
      client_id: params.client_id
    }); 

    await returnAccessToken(ctx, idTokenInfo)
  }
  else if(params.response_type=='code'){
    await authorizeBackCall(ctx, userInfo, params, true); 
  }
}


//oAuth2 获取 token
async function get_token_for_authorization_code(ctx) {
  var akInfo = ctx._ak_info;

  var pks = {
    type: "code",
    key: V.required(ctx.query.code, "code")
  };
  var client_id = V.required(ctx.query.client_id,'client_id');

  var idTokenStr = await cacheService.get(akInfo, pks);
  if (!idTokenStr) {
    throw new E.InvalidParameter('Invalid code')
  }
  await cacheService.del(akInfo, pks)

  //生成 id token
  var idTokenInfo = JSON.parse(idTokenStr);
  
  if(!idTokenInfo || !idTokenInfo.customJson || JSON.parse(idTokenInfo.customJson).clientId!=client_id){
    throw new E.InvalidParameter('Invalid code')
  }
  await returnAccessToken(ctx, idTokenInfo);

}



async function returnAccessToken(ctx, idTokenInfo){
  var akInfo = ctx._ak_info;

  var idToken = IdTokenGenerator.gen(idTokenInfo, ACCESS_TOKEN_EXPIRES_TIME);
  var expires_time = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_TIME * 1000).toISOString();
  var refresh_token = 'refresh-' + formater.genId();

  var accessTokenInfo = {
    access_token: idToken,
    "token_type": "Bearer",
    refresh_token,
    expires_time,
  };

  /*******************************/
  await cacheService.add(akInfo, {
    type: "access",
    key: refresh_token,

    value: JSON.stringify({ idTokenInfo, ...accessTokenInfo }),
    expires_sec: REFRESH_TOKEN_EXPIRES_TIME
  });
  /*******************************/

  ctx.status = 200;
  ctx.body = accessTokenInfo
}

async function refreshToken(ctx) {

  var akInfo = ctx._ak_info;

  var pks = {
    type: "access",
    key: V.required(ctx.request.body.refresh_token, 'refresh_token')
  };

  var access_token = V.required(ctx.request.body.access_token, 'access_token');

  var accessTokenInfoStr = await cacheService.get(akInfo, pks);
  //查不出来，说明没有该token，或者 refresh token 过期了
  if (!accessTokenInfoStr) {
    throw new E.InvalidParameter('Invalid refresh_token')
  }

  var accessTokenInfo = JSON.parse(accessTokenInfoStr);

  if (!accessTokenInfo['idTokenInfo'] || accessTokenInfo.access_token != access_token) {
    throw new E.NoPermission('Invalid refresh_token')
  }
  else {
    //延长时间,  access_token 变 
    accessTokenInfo.access_token = IdTokenGenerator.gen(accessTokenInfo.idTokenInfo, ACCESS_TOKEN_EXPIRES_TIME)

    var expires_time = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_TIME * 1000).toISOString();
    accessTokenInfo.expires_time = expires_time;

    //删除之前的
    await cacheService.del(akInfo, {
      ...pks
    });

    accessTokenInfo.refresh_token =  'refresh-' + formater.genId();

    //添加新的
    await cacheService.add(akInfo, {
      type: 'access',
      key: accessTokenInfo.refresh_token,
      value: JSON.stringify(accessTokenInfo),
      expires_sec: REFRESH_TOKEN_EXPIRES_TIME,
    });


    delete accessTokenInfo.idTokenInfo;
    ctx.body = accessTokenInfo;
  }
}

////////////////////////////////

function equals_uri(u1, u2) {
  var obj1 = URL.parse(u1), obj2 = URL.parse(u2);
  return ["protocol", "host", "pathname"].every((key) => {
    return obj1[key] === obj2[key];
  });
}



function getSignString(params) {
  var paramArr = [];
  // 拼接待签名内容
  Object.keys(params).sort().forEach((key) => {
    paramArr.push(`${key}=${params[key]}`);
  });
  var signContent = paramArr.join("&");
  return signContent;
}


async function initUserAndDrive(otsAkInfo, userInfo) {

  var created_at = new Date().toISOString();
  userInfo.created_at = created_at;
  userInfo.updated_at = created_at;
  userInfo.status = 'enabled';
  userInfo.description = userInfo.description || '';


  //写入 user 表
  var retUser = await userService.addIfNotExists(otsAkInfo, userInfo);

  //初始化网盘
  //list storage forEach--> create drive
  var initDriveStorages = await storageService.listAll(otsAkInfo)

  for (let initStorage of initDriveStorages) {
    if (initStorage.init_drive_on + "" != "true" || initStorage.init_drive_size <= 0) continue;
    try {
      await createInitDriveIfNotExists(otsAkInfo, userInfo.user_id, initStorage)
    } catch (e) {
      console.log('createInitDriveIfNotExists error:' + e);
    }
  }

  return retUser;
}


//云盘初始化
async function createInitDriveIfNotExists(akInfo, grant_to, storageInfo) {

  var result = await driveService.listByGrantTo(akInfo, { grant_to });
  //判断 name 是否一样
  var init_drive_name = storageInfo.init_drive_name

  if (result.items.length > 0) {
    for (var n of result.items) {
      if (n.drive_name == init_drive_name) {
        console.log('init drive already exists! drive_name=' + init_drive_name)
        return;
      }
    }
  }

  //创建
  var drive_id = 'drive-' + formater.genId();
  var created_at = new Date().toISOString()
  var opt2 = {
    grant_to,
    drive_id,
    drive_name: storageInfo.init_drive_name,
    storage_id: storageInfo.storage_id,// storage name or drive id
    used_size: 0,
    total_size: parseInt(storageInfo.init_drive_size) || 0,
    creator: storageInfo.creator,  // 内部字段 admin 不可见
    description: 'init',
    status: 'enabled',
    created_at,
    updated_at: created_at
  };

  opt2.source_path = joinPath('/', opt2.drive_id, '/'), // 相对路径
    opt2.storage_source_path = joinPath('/', opt2.drive_id, '/'), // 相对路径

    await driveService.put(akInfo, opt2)
}

async function getIdTokenOpt(otsAkInfo, codeInfo) {
  var idTokenOpt = {
    userId: codeInfo.user_id,
    customJson: JSON.stringify({
      clientId: codeInfo.client_id,
      isAdmin: false,
      privilege: ''
    })
  };

  //get admin info 
  var adminInfo = await adminService.get(otsAkInfo, { user_id: codeInfo.user_id })
  if (adminInfo) {
    idTokenOpt.customJson = JSON.stringify({
      clientId: codeInfo.client_id,
      isAdmin: true,
      privilege: adminInfo.privilege
    });
  }
  return idTokenOpt;
}
