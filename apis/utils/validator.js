const E = require('./exceptions.js')
const C = require('../const.js')

module.exports = {
  validateDirPath,
  description,
  name,
  contains,
  required,
  time,
  bool,
  storages,
  limit,

  regex,

  checkWriteAdmin,
  checkReadAdmin,
  checkGrantAdmin
}

function regex(v, reg, key){ 
  if(!v || !reg.test(v)){
    throw new E.InvalidParameter('Invalid '+key)
  }
  return v;
}
 
// 判断当前用户是否能访问当前资源
function checkReadAdmin(ctx) { 
  if(!ctx.customJson.isAdmin){
    throw new E.NoPermission('No admin privilege');
  }
  return true;
}

// 判断当前用户是否能操作当前资源
function checkWriteAdmin(ctx){
  if(!ctx.customJson.isAdmin || ctx.customJson.privilege == 'readonly'){
    throw new E.NoPermission('Require atleast writable admin privilege');
  }
  return true;
}

// 判断当前用户是否能操作当前资源
function checkGrantAdmin(ctx){
  if(!ctx.customJson.isAdmin || ctx.customJson.privilege != 'grantable'){
    throw new E.NoPermission('Require grantable admin privilege');
  }
  return true;
}

function limit(v){
  if(v==null) return C.DEFAULT_LIMIT
  v = parseInt(v) || C.DEFAULT_LIMIT
  if (v > C.MAX_LIMIT) {
    throw new E.InvalidParameter(`Invalid limit, it must be an positive integer and not greater than ${MAX_LIMIT}`)
  }
  return v;
}
function bool(value) {
  if(typeof value === "string" && value === "false"){
    return false;
  }
  return !!value;
}

function time(timeStr, key, minSec = 0) {
  if(!timeStr){
    throw new E.InvalidParameter(`Invalid ${key}`);
  }
  if(timeStr < new Date(Date.now() + minSec * 1000).toISOString()) { 
    throw new E.InvalidParameter(`Invalid ${key}`);
  }
  return timeStr;
}

function required(value, key) {
  if(!value){
    throw new E.InvalidParameter(`Invalid ${key}`);
  }
  return value;
}

function contains(arr, value, key) {
  if(arr.indexOf(value) === -1){
    throw new E.InvalidParameter(`Invalid ${key}`);
  }
  return value;
}

function storages(storages) {
  var obj = storages;
  if(typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch (e) {
      throw new E.InvalidParameter("Invalid storages");
    }
  }
  if(typeof obj !== "object" || isEmpty(obj)){
    throw new E.InvalidParameter("Invalid storages");
  }
  return JSON.stringify(obj);
}

function isEmpty(obj){
  return Object.keys(obj).length === 0;
}

function validateDirPath(dir_path, type) {
  if (!dir_path.startsWith('/')) {
    throw new E.InvalidParameter('Invalid ' + type)
  }

  var arr = dir_path.replace(/(^\/*)|(\/*$)/g, '').split('/')
  for (var n of arr) {
    if (n.length > C.MAX_LEN_FILE_NAME) {
      throw new E.InvalidParameter('Invalid length of ' + type)
    }
  }
}

function description(des){
  if(des && des.length > C.MAX_LEN_DESC){
    throw new E.InvalidParameter('Invalid description')
  }
  return des;
}

function name(name, key, length = C.MAX_LEN_NAME){
  if(!name){
    throw new E.InvalidParameter(`Invalid ${key}`);
  }
  if(name.length > length){
    throw new E.InvalidParameter(`Invalid ${key}`)
  }
  return name;
}

