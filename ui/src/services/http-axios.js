//require jquery
import Toast from './toast.js'
import axios from 'axios'
import TokenStore from './TokenStore.js'


function handlerErr(options){
  return function(err){
   
    if((err.status==401 || err.data && err.data.message.indexOf('authorization') !=-1)
       && !window.MyApp.$route.path.startsWith("/public/")){
      //未登录
      TokenStore.remove();
      Toast.error('Token失效,请重新登录');
      if (["DingDingSignIn",'Docs'].indexOf(window.MyApp.$route.name)==-1){ 
      // if(window.MyApp.$route.name!="DingDingSignIn"){
        MyApp.$router.push({name:'SignIn'});
      }
      return;
    }

    if((!options.params || options.params.ignoreError!=true)
       && (!options.data || options.data.ignoreError!=true)){

      if(err.data.code){
        Toast.error(err.data.code+':'+err.data.message)
      }else{
        Toast.error(err.status)
      }
    }
    throw err;
  }

}

export default {
  get: get,
  post: post,
  put: put,
  head: head,
  delete: deleteFn
}
async function get(url, data, options){
  options = options || {}
  options.params = data;
  await wrapOptions(options)
  return axios.get(url, options).then(function(result){
    return result.data;
  },function(resp){
    handlerErr(options)(resp.response)
  });
}
async function post(url, data, options){
  options = options || {}
  options.data = data;
  await wrapOptions(options)
  return await axios.post(url, data, options).then(function(result){
    return result.data;
  },function(resp){
    handlerErr(options)(resp.response)
  });
}
async function put(url, data, options){
  options = options || {}
  options.data = data;
  await wrapOptions(options)
  return await axios.put(url, data, options).then(function(result){
    return result.data;
  },function(resp){
    handlerErr(options)(resp.response)
  });
}
async function head(url, data, options){
  options = options || {}
  options.params = data;
  await wrapOptions(options)
  return await axios.head(url, options).then(function(result){
    return result.data;
  },function(resp){
    handlerErr(options)(resp.response)
  });
}
async function deleteFn(url, data, options){
  options = options || {}
  options.params = data;
  await wrapOptions(options)
  return await axios.delete(url, options).then(function(result){
    return result.data;
  },function(resp){
    handlerErr(options)(resp.response)
  });
}

async function wrapOptions(options){
  var tokenInfo = await TokenStore.get()

  if(!tokenInfo.access_token){
    if (["DingDingSignIn",'Docs'].indexOf(window.MyApp.$route.name)==-1){  
      MyApp.$router.push({name:'SignIn'});
    }
    return;
  }

  options.headers = options.headers || {};
  options.headers['Authorization']='Bearer '+tokenInfo.access_token;
}
