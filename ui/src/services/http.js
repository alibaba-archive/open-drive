//require jquery
import Toast from './toast.js'
import $ from 'jquery'
import TokenStore from './TokenStore.js'

$.ajaxSetup({
  complete: function(xhr){
    xhr.data = xhr.responseJSON || {code:'unknowned',message: xhr.responseText};
  },
  error: function(xhr){
    if(xhr.status==401 && !window.MyApp.$route.path.startsWith("/public/")){
      //未登录
      TokenStore.remove();
      Toast.error('Token失效,请重新登录');
      if(['DingDingSignIn','Docs'].indexOf(window.MyApp.$route.name)==-1){
        MyApp.$router.push({name:'SignIn'});
      }
      return;
    }
    xhr.data = xhr.responseJSON || {code:'unknowned',message: xhr.responseText};

    if(!xhr.ignoreError){
      if(xhr.data.code){
        Toast.error(xhr.data.code+':'+xhr.data.message)
      }else{
        Toast.error(xhr.status)
      }
    }
  }
});

export default {
  get: get,
  post: post,
  put: put,
  head: head,
  delete: deleteFn
}
function get(url, data, options){
  return _send('GET', url, data, options);
}
function post(url, data, options){
  return _send('POST', url, data, options);
}
function put(url, data, options){
  return _send('PUT', url, data, options);
}
function head(url, data, options){
  return _send('HEAD', url, data, options);
}
function deleteFn(url, data, options){
  return _send('DELETE', url, data, options);
}

async function _send(method, url, data, options){
   
  await delay(1);

  options = Object.assign({},options, {method, data, url});
  var tokenInfo = await TokenStore.get()

  if(!tokenInfo.access_token && 
    !window.MyApp.$route.path.startsWith("/public/") 
    && ['DingDingSignIn','Docs'].indexOf(MyApp.$route.name)==-1 ){
    
    if(MyApp.$route.name!='SignIn' == -1 && MyApp.$route.path != "/"){
      localStorage.setItem("login_redirect", MyApp.$route.path);
    }
    MyApp.$router.push({name:'SignIn'});
    return false;
  }

  // if(!options.headers) options.headers={};
  // if(!options.headers['x-token']){
  //   options.headers['x-token'] = tokenInfo.access_token;
  // }

  if(!options.data)options.data={};
  //options.data['token']=tokenInfo.access_token;

  options.headers = options.headers || {};
  // if(Global.stage) options.headers['X-Ca-Stage']= Global.stage
  options.headers['Authorization']='Bearer '+tokenInfo.access_token;

  // console.log(options)
  var xhr = $.ajax(options);
  xhr.ignoreError = data?data.ignoreError:false;
  return xhr
}
