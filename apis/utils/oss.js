const OSS = require('ali-oss');
const debug = require('debug')('oss')

module.exports = {
  del,
  list,
  put,
  copy,
  head,
  putMeta,
  listBuckets,
  multipartUploadCopy,
  signatureUrl,
  isOssProcessImageType
}
function isOssProcessImageType(item){
  //图片处理支持的格式：jpg、png、bmp、gif、webp、tiff。
  return /(\.gif$)|(\.bmp$)|(\.jpg$)|(\.png$)|(\.webp$)|(\.tiff$)/i.test(item.name)
}
function head(akInfo, opt){
  debug(`head: ${JSON.stringify(opt)}`)
  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);
  return client.head(opt.key)
}

function listBuckets(akInfo, opt){
  debug(`listBuckets: ${JSON.stringify(opt)}`)

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
  }
  var client = getClient(akInfo);
  return client.listBuckets();
}

function signatureUrl(akInfo, opt){
  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);

  var _opt = {
    method: opt.method || 'GET', // PUT
    expires: opt.expires||3600,
    process: opt.process,
    response: opt.response
  };

  if(_opt.method==='PUT'){
    if(opt['Content-Type'])_opt['Content-Type'] = opt['Content-Type'];
    if(opt['Content-Md5'])_opt['Content-Md5'] = opt['Content-Md5'];
  }
  return client.signatureUrl(opt.key, _opt);
}

// opt = { bucket, key , from_bucket, from_key}
function copy(akInfo, opt){ 

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    //delete opt.bucket;
  }
  var client = getClient(akInfo);
  debug(`copy: oss://${opt.from_bucket}/${opt.from_key} to oss://${opt.bucket}/${opt.key}`)
  return client.copy(opt.key, `/${opt.from_bucket}/${opt.from_key}`)
}

function multipartUploadCopy(akInfo, opt){
  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    //delete opt.bucket;
  }
  var client = getClient(akInfo);
  debug(`multipartUploadCopy: oss://${opt.from_bucket}/${opt.from_key} to oss://${opt.bucket}/${opt.key}`)
  return client.multipartUploadCopy(opt.key, {
    sourceKey: opt.from_key,
    sourceBucketName: opt.from_bucket}, {
      parallel: 4,
      partSize: 1024 * 1024,
    });
}

// opt = { bucket, key , content, headers}
function put(akInfo, opt){
  debug(`put: ${JSON.stringify(opt)}`)

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);
  return client.put(opt.key, opt.content, {headers:opt.headers})
}

// opt = { bucket, key , meta}
function putMeta(akInfo, opt){
  debug(`putMeta: ${JSON.stringify(opt)}`)

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);
  return client.putMeta(opt.key, opt.meta);
}


//opt = { bucket, prefix, marker, max-keys }
function list(akInfo, opt){
  debug(`list: ${JSON.stringify(opt)}`)

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);

  return client.list(opt)
}

// opt = { bucket, key }
function del(akInfo, opt){
  debug(`delete: ${JSON.stringify(opt)}`)

  if(opt.bucket){
    akInfo.bucket = opt.bucket;
    delete opt.bucket;
  }
  var client = getClient(akInfo);
  return client.delete(opt.key)
}


function getClient(akInfo){
  if(!akInfo.region.startsWith("oss")){
    akInfo.region = `oss-${akInfo.region}`;
  }
  return new OSS({
    region: akInfo.region,
    accessKeyId: akInfo.accessKeyId,
    accessKeySecret: akInfo.accessKeySecret,
    securityToken: akInfo.securityToken,
    bucket: akInfo.bucket,
    // endpoint: akInfo.endpoint,
  });
}
