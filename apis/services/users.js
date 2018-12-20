const otsUser = require('../models/user.js')

module.exports = {
  addIfNotExists,
  get,
  put,
  update,
  list,
  del
}

async function addIfNotExists(akInfo, {user_id, ...userInfo}) {
 
  var info = await otsUser.get(akInfo, { user_id });
  if (!info) {  
    await otsUser.put(akInfo, { user_id }, userInfo)
    return userInfo;
  }
  else {
    var nick_name = userInfo.nick_name; 
    info.nick_name = nick_name;
    await otsUser.update(akInfo, { user_id }, {nick_name})
  }
  return info;
}

async function update(akInfo, {user_id, ...userInfo}) {
  return await otsUser.update(akInfo,  {user_id}, userInfo);
}
async function put(akInfo, {user_id, ...userInfo}) {
  return await otsUser.put(akInfo,  {user_id}, userInfo);
}

async function get(akInfo, {user_id}) {
  return await otsUser.get(akInfo, {user_id});
}

async function del(akInfo, {user_id}) {
  return await otsUser.del(akInfo,  {user_id});
}

async function list(akInfo, {marker, limit=100}) {
  return await otsUser.list(akInfo, {}, {marker, limit});
}

