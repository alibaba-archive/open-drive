const otsAdmin = require('../models/admin.js')

module.exports = { 
  add,
  get,
  list,
  update,
  del
}

async function add(akInfo, {user_id, privilege, description}) {
  var created_at = new Date().toISOString(); 
  var adminInfo = { privilege, description, created_at, updated_at:created_at}
  return await otsAdmin.add(akInfo, {user_id}, adminInfo);
}

async function update(akInfo, {user_id, privilege, description}) {
  var updated_at = new Date().toISOString(); 
  var adminInfo = { privilege, description, updated_at}
  return await otsAdmin.update(akInfo, {user_id}, adminInfo);
}

async function get(akInfo, {user_id}) {
  return await otsAdmin.get(akInfo,{user_id});
}

async function del(akInfo, {user_id}) {
  return await otsAdmin.del(akInfo, {user_id});
}

// opt = {  marker, limit }
async function list(akInfo, {marker, limit=100}) {
  return await otsAdmin.list(akInfo, {marker, limit});
}
