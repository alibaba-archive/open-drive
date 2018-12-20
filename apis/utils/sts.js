
const RPCClient = require('@alicloud/pop-core').RPCClient

module.exports = {
  assumeRole,
  getStsToken4Oss
}

//opt = { accountId, roleArn, bucket ,key , writable }
function getStsToken4Oss(akInfo, {
  accountId, 
  roleArn, 
  bucket,
  key, 
  writable,
  expires
}){

  var policy = key.endsWith('/') ?
  getPolicyOssFolderFull({
    accountId,
    bucket,
    key
  }) :
  getPolicyOssFile({
    accountId,
    bucket,
    key
  }, writable);

  var options = {
    RoleArn: roleArn,
    RoleSessionName: accountId,
    Policy: policy,
    DurationSeconds: expires || 3600
  };

  return assumeRole(akInfo, options)

}

function getPolicyOssFile({
  accountId,
  bucket,
  key
}, writable) {
  var policy = {
    "Version": "1",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": writable? [
          "oss:*"
        ]:[
          "oss:HeadObject",
          "oss:GetObject"
        ],
        "Resource": [
          "acs:oss:*:" + accountId + ":" + bucket + "/" + key
        ]
      }
    ]
  };

  return JSON.stringify(policy);
}

function getPolicyOssFolderFull({
  accountId,
  bucket,
  key
}) {
  key = key.replace(/(\/*$)/g,'');

  var policy = {
    "Version": "1",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "oss:*"
        ],
        "Resource": [
          "acs:oss:*:" + accountId + ":" + bucket + "/" + prefix + "/*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "oss:ListObjects"
        ],
        "Resource": [
          "acs:oss:*:" + accountId + ":" + bucket
        ],
        "Condition": {
          "StringLike": {
            "oss:Prefix": prefix + "/*"
          }
        }
      }
    ]
  };

  return JSON.stringify(policy);
}

function assumeRole(akInfo, opt){
  var client = getClient(akInfo)
  try{ 
    return client.request('AssumeRole', {
      Action: 'AssumeRole',
      RoleArn: opt.RoleArn,
      RoleSessionName: opt.RoleSessionName,
      Policy: opt.Policy,
      DurationSeconds: opt.DurationSeconds
    })
  }catch(e){
    console.log(e);
    throw new Internal('Failed to AssumeRole')
  }
}

function getClient(akInfo){
  return new RPCClient({
    accessKeyId: akInfo.accessKeyId,
    accessKeySecret: akInfo.accessKeySecret,
    endpoint: "https://sts.aliyuncs.com",
    apiVersion: '2015-04-01'
  });
}
