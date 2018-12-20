//const FcUtil = require('../models/fc-util.js');

const userService = require('../services/users.js');
const adminService = require('../services/admins.js');
const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')

const C = require('../const')
const OK = C.OK;

const STATUS_TYPE = C.STATUS_TYPE;
const DEFAULT_AVATAR = C.DEFAULT_USER_AVATAR


module.exports = {
  getUserInfo,
  updateAvatar,
  getAvatar,

  list,
  get,
  update,
  del
}
//无需验证
async function getAvatar(ctx) {
  var akInfo = ctx._ak_info;
 
  var user_id = ctx.params.userId;
  console.log('getAvatar:' + user_id);
  
  var userInfo = await userService.get(akInfo, {user_id});
  if (!userInfo) {
    throw new E.NotFound('Not found user')
  }

  var avatar = userInfo.avatar || DEFAULT_AVATAR;

  if(avatar.startsWith("http")){
    ctx.redirect(avatar);
    return ;
  }

  var base64Str = avatar.substring(avatar.indexOf(',') + 1);

  var _itr = avatar.match(/^data\:([^;]+)/);
  var mineType = _itr&&_itr.length>1?_itr[1]:'';

  ctx.type = mineType;
  ctx.body = Buffer.from(base64Str, 'base64')
}

//需要本人操作
async function updateAvatar(ctx) {
  var akInfo = ctx._ak_info;

  var avatar = ctx.request.body.avatar; //base64 url

  var user_id = ctx.userId;
 
  console.log('updateUserAvatar:' + user_id, 'avatar:' + avatar );
  var userInfo = await userService.get(akInfo, {user_id})
  if (!userInfo) {
    throw new E.NotFound('Not found user')
  }

  userInfo.avatar = avatar;
  userInfo.updated_at = new Date().toISOString();
  await userService.put(akInfo, userInfo);

  ctx.body = OK
}


//本人操作
async function getUserInfo(ctx) {

  var user_id = ctx.userId;
  var akInfo = ctx._ak_info;
 

  var userInfo = await userService.get(akInfo, {user_id});
  if (!userInfo) {
    throw new E.NotFound('Not found user')
  }

  userInfo.avatar_url = '/users/' + user_id + '/avatar';

  delete userInfo.avatar

  //只有管理员可见，用户自己不可见
  delete userInfo.description

  //管理员
  var adminInfo = await adminService.get(akInfo, {user_id})
 
  if (adminInfo) {
    userInfo.is_admin = true;
    userInfo.privilege = adminInfo.privilege;
  } else {
    userInfo.is_admin = false;
  }
  ctx.body = userInfo;
}



async function list(ctx) {
  //check Permission
  V.checkReadAdmin(ctx)


  var opt = { 
    // user_type: ctx.query.user_type,
    // user_name: ctx.query.user_name,
    // nick_name: ctx.query.nick_name,
    // status: ctx.query.status,
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit)
  }
 

  var akInfo = ctx._ak_info;

  var result = await userService.list(akInfo, opt);
  var arr = result.items || [];
  arr.forEach(n => {
    n.avatar_url = '/users/' + n.user_id + '/avatar';
    delete n.avatar;
  });

  ctx.body = {
    items: arr,
    next_marker: result.next_marker || ''
  }
}

async function get(ctx) {
  //check Permission
  V.checkReadAdmin(ctx)


  var user_id = ctx.params.userId;
  var akInfo = ctx._ak_info; 

  var userInfo = await userService.get(akInfo, {user_id});
  if (!userInfo) {
    throw new E.NotFound('Not found user')
  }
  userInfo.avatar_url = '/users/' + user_id + '/avatar';

  delete userInfo.avatar

  ctx.body = userInfo
}


//目前只能修改status 和 description
async function update(ctx) {

  //check Permission
  V.checkWriteAdmin(ctx)

  var akInfo = ctx._ak_info;

 

  var user_id = ctx.params.userId; 
  
  var userInfo = await userService.get(akInfo, {user_id})
  if (!userInfo) {
    throw new E.NotFound('Not found user')
  }

  console.log('updateUserStatus:' + user_id, 'status:' + status );

  var status = ctx.request.body.status;
  var description = ctx.request.body.description;

  status?V.contains(STATUS_TYPE, status, 'status'):null;
  V.description(description)
 
 
  //update
  var updateUserInfo = {
    user_id,

    status: status?V.contains(STATUS_TYPE, status, 'status'):undefined,
    description: description!=null?V.description(description):undefined,
    updated_at: new Date().toISOString()
  };
 
  await userService.update(akInfo, updateUserInfo);

  ctx.body = OK

}

async function del(ctx) {
  //check Permission
  V.checkWriteAdmin(ctx)

  var akInfo = ctx._ak_info;
  var user_id = ctx.params.userId; 
  await userService.del(akInfo, {user_id});

  ctx.status = 204;
  ctx.body = null;
}
