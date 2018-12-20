
const Oss = require('../utils/oss');
const Sts = require('../utils/sts'); 
const Formater = require('../utils/formater.js'); 

module.exports= {
  
  getSignedUrlInner,
  getStsTokenInner,

  hasEnoughSpace,
  calcDriveUsedSize
}

function hasEnoughSpace(drive, oriFileSize, curFileSize) {
  if (!drive.total_size) {
    return true;
  }
  var availableSize = drive.total_size - drive.used_size + oriFileSize;
  if (availableSize >= curFileSize) {
    return true;
  }
  return false;
}

function calcDriveUsedSize(drive, oriFileSize, curFileSize) {
  drive.used_size = parseInt(drive.used_size) || 0;
  oriFileSize = parseInt(oriFileSize) || 0;
    curFileSize = parseInt(curFileSize) || 0;
  if (!hasEnoughSpace(drive, oriFileSize, curFileSize)) {
    return false;
  }
  return true;
}


async function getSignedUrlInner(storageInfo, oss_key, writable, name, expires_sec=3600, content_type='',content_md5=''){

  var ossAkInfo = {
    region: storageInfo.region,
    // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  }

  var ossEndpoint = Formater.getEndpoint(storageInfo, 'oss_endpoint');

  var expiration = new Date(Date.now()+expires_sec*1000).toISOString()

  var result_headers = {
    'Content-Type': content_type,
    'Content-Md5': content_md5,
  }

  var base_result = {
    endpoint: ossEndpoint,
    region: storageInfo.region,
    // region:  Formater.getOssRegion(storageInfo),
    bucket: storageInfo.oss_bucket,
    key: oss_key,
    expiration: expiration
  };

  if(writable){

    var signed_url_opt = Object.assign({
      method: 'PUT',
      bucket: storageInfo.oss_bucket,
      key: oss_key,
      expires: expires_sec
    }, result_headers);

    var url = Oss.signatureUrl(ossAkInfo, signed_url_opt);

    return Object.assign(base_result, {
      method: 'PUT',
      url: url,
      headers: result_headers
    })
  }else{


    var headInfo = await Oss.head(ossAkInfo, {
      bucket: storageInfo.oss_bucket,
      key: oss_key,
    });

    var url = Oss.signatureUrl(ossAkInfo, {
      bucket: storageInfo.oss_bucket,
      key: oss_key,
      expires: expires_sec,
      response: {
        'content-disposition': 'attachment;filename=' + encodeURIComponent(name)
      }
    });

    return Object.assign(base_result, {
      method: 'GET',
      url: url,
      headers: headInfo.res.headers
    })
  }
}

async function getStsTokenInner(storageInfo, oss_key, writable, seconds=3600) {
  var stsAkInfo = {
    endpoint: storageInfo.sts_endpoint,
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  }

  var result = await Sts.getStsToken4Oss(stsAkInfo, {
    roleArn: storageInfo.role_arn,
    accountId: storageInfo.account_id,
    bucket: storageInfo.oss_bucket,
    key: oss_key,
    seconds: seconds,
    writable: writable == true
  });

  var ossEndpoint = Formater.getEndpoint(storageInfo, 'oss_endpoint');

  return {
    account_id: storageInfo.account_id,
    access_key_id: result.Credentials.AccessKeyId,
    access_key_secret: result.Credentials.AccessKeySecret,
    security_token: result.Credentials.SecurityToken,
    expiration: result.Credentials.Expiration,
    region:  Formater.getOssRegion(storageInfo),
    endpoint: ossEndpoint,
    bucket: storageInfo.oss_bucket,
    key: oss_key,
    url: Formater.getOssURL(ossEndpoint, storageInfo.oss_bucket, oss_key)
  }
}
