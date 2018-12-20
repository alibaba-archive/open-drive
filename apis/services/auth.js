const C = require('../const.js');
const $ = require('axios');
const E = require('../utils/exceptions')
const moment = require('moment')

const DING_API = C.DING_API;
const AlipaySdk = require('alipay-sdk').default;

module.exports = {
  getUserInfoByScope
}


async function getUserInfoByScope(scope, appInfo, code) {
  switch (scope) {
    default:
    case 'dingding_login':
    case 'dingding_qrcode':

      var user_info = await getDingDingUserInfo(appInfo.appId, appInfo.appSecret, code);
      console.log(`getDingDingUserInfo: ${JSON.stringify(user_info)}`)
      return user_info;
    case 'alipay':
      var user_info = await getAlipayUserByCode(appInfo.appId, appInfo.privateKey, code)
      console.log(`getAlipayUserInfo: ${JSON.stringify(user_info)}`)
      return user_info;
  }
}




async function getAlipayUserByCode(appId, privateKey, code) {
  // https://docs.open.alipay.com/289/105656
  var params = {
    timestamp: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
    method: "alipay.system.oauth.token",
    app_id: appId,
    sign_type: "RSA2",
    version: "1.0",
    charset: "utf-8",
    code: code,
    grant_type: "authorization_code"
  };

  const alipayClient = new AlipaySdk({
    appId: appId,
    privateKey: privateKey
  });

  var result = await alipayClient.exec(params.method, params);
  
  if(!result.userId) {
    throw new E.ThirdPartError("Login failed");
  }

  // var userId = result.userId;
  var access_token = result.accessToken;


  // 获取用户信息
  var userInfoParams = {
    timestamp: moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
    method: "alipay.user.info.share",
    app_id: appId,
    sign_type: "RSA2",
    version: "1.0",
    charset: "utf-8",
    auth_token: access_token
  };

  var userInfo = await alipayClient.exec(userInfoParams.method, userInfoParams);

  if(userInfo.code != '10000') {
    throw new E.ThirdPartError("Get user info failed");
  }

  // { code: '10000',
  //   msg: 'Success',
  //   avatar: 'https://tfs.alipayobjects.com/images/partner/T11z4cXnpqXXXXXXXX',
  //   city: '杭州市',
  //   gender: 'm',
  //   is_certified: 'T',
  //   is_student_certified: 'F',
  //   nick_name: '春长',
  //   province: '浙江省',
  //   user_id: '2088102987470510',
  //   user_status: 'T',
  //   user_type: '2' }
  
  return {
    user_name: userInfo.nick_name || "ALIPAY-" + userInfo.userId,
    nick_name: userInfo.nick_name || "ALIPAY-" + userInfo.userId,
    user_type: "alipay",
    user_id: "ALIPAY-" + userInfo.userId,
    avatar: userInfo.avatar,
    description: '',
    ori_data: userInfo
  }
}


// Document: https://open-doc.dingtalk.com/docs/doc.htm?treeId=385&articleId=104968&docType=1#s0
async function getDingDingUserInfo(appId, appSecret, code) {
  var url1 = `${DING_API}/sns/gettoken?appid=${appId}&appsecret=${appSecret}`;
  console.log('1. GET', url1)
  var result = await $.get(url1);
  console.log('result:' + JSON.stringify(result.data))
  //{"errcode":0,"access_token":"8e510e29e021346695673285fa6e6bcb","errmsg":"ok"}

  if (result.data.errcode != 0) {
    throw new E.ThirdPartError(result.data.errmsg)
  }
  var access_token = result.data.access_token;

  var url2 = `${DING_API}/sns/get_persistent_code?access_token=${access_token}`
  console.log('2. POST', url2, code)
  var result2 = await $.post(url2, { tmp_auth_code: code });
  console.log('result2:' + JSON.stringify(result2.data))
  if (result2.data.errcode != 0) {
    throw new E.ThirdPartError(result2.data.errmsg)
  }

  var url3 = `${DING_API}/sns/get_sns_token?access_token=${access_token}`
  console.log('3. POST', url3)
  var result3 = await $.post(url3, { openid: result2.data.openid, persistent_code: result2.data.persistent_code });
  console.log('result3:' + JSON.stringify(result3.data))
  if (result3.data.errcode != 0) {
    throw new E.ThirdPartError(result3.data.errmsg)
  }

  var url4 = `${DING_API}/sns/getuserinfo?sns_token=${result3.data.sns_token}`
  console.log('4. GET', url4)
  var result4 = await $.get(url4);
  console.log('result4:' + JSON.stringify(result4.data))
  if (result4.data.errcode != 0) {
    throw new E.ThirdPartError(result4.data.errmsg)
  }

  var user_info = result4.data.user_info;
  //console.log(`getDingDingUserInfo: ${JSON.stringify(user_info)}`)

  //{"nick":"春长","unionid":"8vXEhLg142UiE","dingId":"$:LWCP_v1:$tkf9YONUeVmJxZSwZxesYg==","openid":"iS3ZQ62PsY1UiE"}

  var userInfo = {
    user_type: 'dingding',
    user_id: 'user-ding-' + user_info.unionid,
    user_name: user_info.dingId,
    nick_name: user_info.nick,
    avatar: '',
    description: user_info.maskedMobile,
    ori_data: JSON.stringify(user_info)
  };

  return userInfo;
}
