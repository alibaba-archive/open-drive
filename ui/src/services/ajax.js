import Vue from 'vue';
import TokenStore from './TokenStore.js'

/**
 * @desc set Authorization in request header
 */
async function setHeader() {
  var tokenInfo = await TokenStore.get();

  if (!tokenInfo.access_token) {
    if (["DingDingSignIn",'Docs'].indexOf(window.MyApp.$route.name)==-1) {
      MyApp.$router.push({ name: 'SignIn' });
    }
    return;
  }

  return {
    'Authorization': 'Bearer '+tokenInfo.access_token
  };
}

/**
 * @desc http error handler
 * @param {object} err http response for error condition
 * @param {boolean} ignoreError whether ignore error which configure in http request query or body
 */
function handlerErr(err, ignoreError) {
  const { body, status } = err;
  if ((status == 401 || body && body.message.indexOf('Invalid authorization') != -1)
    && !window.MyApp.$route.path.startsWith("/public/")) {
    // not login or session expires
    TokenStore.remove();
    Toast.error('Token失效,请重新登录');

    if (["DingDingSignIn",'Docs'].indexOf(window.MyApp.$route.name)==-1) {
      MyApp.$router.push({ name: 'SignIn' });
    }
    return;
  }

  if (!ignoreError) {
    if (body.code) {
      Toast.error(`${body.code}: ${body.message}`);
    } else {
      Toast.error(status);
    }
  }

  throw new Error(`${body.code}: ${body.message}`);
}

/**
 * @desc http method generate factory
 * @param {string} method http method like get/post 
 */
function httpFactory(method) {
  return async function(url, ...args) {
    // http method which has no body
    const noBodyMethod = ['get', 'delete', 'head', 'jsonp'];
    let params = {};
    let body = {};
    let config = {};
    let argList = [];

    const headerOptions = await setHeader();
    if (noBodyMethod.indexOf(method) > -1) {
      [ params = {}, config = {} ] = args;

      config.headers = Object.assign(config.headers || {}, headerOptions);
      argList = [{
        ...config,
        params
      }];
    } else {
      [ body = {}, config = {} ] = args;

      config.headers = Object.assign(config.headers || {}, headerOptions);
      argList = [
        body,
        config
      ];
    }
  
    return Vue.http[method](url, ...argList).then(response => {
      return response.body;
    }, response => {
      const ignoreError = body && body.ignoreError || params && params.ignoreError;
      return handlerErr(response, ignoreError);
    });
  }
}

export default {
  get: httpFactory('get'),
  post: httpFactory('post'),
  delete: httpFactory('delete'),
  put: httpFactory('put'),
  jsonp: httpFactory('jsonp'),
  head: httpFactory('head'),
  patch: httpFactory('patch')
};
