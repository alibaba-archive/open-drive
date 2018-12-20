const otsQuota = require('../models/quota.js')

module.exports = {
  get,
  put,
  del
}

//opt = {type, key, value}
async function put(akInfo, opt) {
  return await otsQuota.put(akInfo, opt);
}

//opt = {type, key}
async function get(akInfo, opt) {
  return await otsQuota.get(akInfo, opt);
}

//opt = {type, key}
async function del(akInfo, opt) {
  return await otsQuota.del(akInfo, opt);
}
