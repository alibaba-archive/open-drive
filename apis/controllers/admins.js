
//const FcUtil = require('../models/fc-util.js');
const adminService = require('../services/admins.js');
const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')

const C = require('../const')
const OK = C.OK;
 
const PRIVILEGE_TYPE = C.PRIVILEGE_TYPE;

module.exports= {
  list,
  get,
  update,
  del
}

async function list(ctx){

  //check Permission
  V.checkReadAdmin(ctx);

  var opt= { 
     marker: ctx.query.marker,
     limit: V.limit(ctx.query.limit) 
  }
  
   var akInfo = ctx._ak_info;
   var result = await adminService.list(akInfo, opt);
   
   ctx.body = {
     items: result.items||[],
     next_marker: result.next_marker || ''
   }
}

async function get(ctx){

  //check Permission
  V.checkReadAdmin(ctx);

  var user_id = ctx.params.userId;
  var akInfo = ctx._ak_info; 

  var adminInfo = await adminService.get(akInfo, {user_id});
  if(!adminInfo){
    throw new E.NotFound('admin not found')
  }

  ctx.body = adminInfo
}



async function update(ctx){

  V.checkGrantAdmin(ctx);

  var akInfo = ctx._ak_info;

  var privilege = ctx.request.body.privilege;
  
  var description = ctx.request.body.description; 
  V.description(description)
 

  var user_id = ctx.params.userId;
  if(user_id.length>100){
    throw new E.InvalidParameter('Invalid user_id')
  }

  var updated_at = new Date().toISOString();

  var userInfo = await adminService.get(akInfo, {user_id})
  if(!userInfo){ 
    //create
   
    userInfo = { 
      user_id: user_id, 
      privilege: V.contains(PRIVILEGE_TYPE, privilege, 'privilege'),
      description: description||'',

      created_at: updated_at,
      updated_at
    }

    console.log('add admin:'+user_id)
    await adminService.add(akInfo, userInfo);
  }else{

    var updateUserInfo = {user_id, updated_at};
    if(privilege) {
      V.contains(PRIVILEGE_TYPE, privilege)
      updateUserInfo.privilege = privilege;
    }
  
    if(description!=null) updateUserInfo.description = description;
    console.log('update admin, id:'+user_id);
    
    await adminService.update(akInfo, updateUserInfo);
  }

  ctx.body = OK
}

async function del(ctx){

  //check Permission
  V.checkGrantAdmin(ctx)

  var user_id = ctx.params.userId; 

  await adminService.del(ctx._ak_info,{user_id});

  ctx.status=204;
  ctx.body = null;
}
