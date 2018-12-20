const uuid = require('uuid/v4')
const parseURL = require('url').parse;
const crypto = require('crypto')
const C = require('../const.js');
const DRIVE_MAX_SIZE = C.DRIVE_MAX_SIZE;

module.exports = {
  genId,
  getEndpoint,
  getOssRegion,
  getOssURL,
  parseOssURL,
  getAccountIdFromStorage,
  parseBody,
  getAKFromStorage,
  getOssAkInfoFromStorage,
  getDriveFreeSize,

  hmacSha1Base64,
  joinPath
}

function joinPath(...arr){
  return arr.filter(n=>{return n!=='' && n!=='.'}).join('/').replace(/(\/+)/g, '/')
}


function hmacSha1Base64(signContent, secret) {
  // 根据secret创建签名
  const signature = crypto.createHmac('sha1', secret);
  // 得到签名信息
  return signature.update(Buffer.from(signContent, 'utf8')).digest('base64');
}

function getDriveFreeSize(driveInfo) {
  if(driveInfo.total_size == 0) {
    return DRIVE_MAX_SIZE - driveInfo.used_size;
  }
  return driveInfo.total_size - driveInfo.used_size;
}

function getAKFromStorage(storageInfo) {
  return {
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret
  }
}

function getAccountIdFromStorage(storageInfo) {
  return storageInfo.role_arn.split(":")[3];
}

function getOssAkInfoFromStorage(storageInfo) {
  return {
    region: storageInfo.region,
    bucket: storageInfo.bucket,
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret
  }
}

function parseOssURL(s){

  if(!s)return null;
  var arr = s.match(/^oss\:\/\/([^\/]+)\/*(.*)/)
  if(arr && arr.length>=3){
    return {bucket: arr[1], key: arr[2]}
  }else return null;
}

function parseBody(ctx_body){
  var { data: body} = ctx_body;
  if(body){
    //兼容 form 提交 data={}
    body = typeof(body)=='string' ? JSON.parse(body) : body;
  }else{
    // json 格式提交
    body = ctx_body
  }
  return body
}

function genId(){
   return uuid().replace(/\-/g, '');
}
function getOssRegion(storageInfo){
  if(storageInfo.region) return 'oss-'+storageInfo.region;
  var endpoint = storageInfo.oss_endpoint;
  return endpoint?endpoint.match(/^https?:\/\/([^.]+)/)[1]:''
  // return parseURL(endpoint.split(".")[0]).host;
}


function getOssURL(endpoint, bucket, key) {
  var hosturl = bucket + "." + parseURL(endpoint).host;
  return parseURL(endpoint).protocol + "//" + hosturl + "/" + encodeURI(key);
}

function getEndpoint(storageInfo, fieldName){
  switch(fieldName){
    case 'oss_endpoint': return storageInfo[fieldName] || `http://oss-${storageInfo.region}.aliyuncs.com`;
    case 'init_office_preview_endpoint':
    case 'init_video_analyse_endpoint':
    case 'init_photo_process_endpoint':return storageInfo[fieldName] || `http://imm.${storageInfo.region}.aliyuncs.com`;
    case 'bc_endpoint': return storageInfo[fieldName] || `http://batchcompute.${storageInfo.region}.aliyuncs.com`
  }
}
