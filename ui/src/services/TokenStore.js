import $ from 'jquery'
const KEY = 'token-info'

export default {
  save,
  get ,
  remove
}

var isRefreshing=false;
async function get(){

  try{
    var tokenInfo = JSON.parse(localStorage.getItem(KEY)||'{}')
  }catch(e){
    return {}
  }

  if(!isRefreshing && tokenInfo.expires_time && tokenInfo.refresh_token){
    if(tokenInfo.expires_time < new Date(Date.now()+3600*1000).toISOString()){
      //console.log('old:',tokenInfo)
      try{
        console.log('access_token will be expired very soon, trying to refresh token...')
        isRefreshing=true;
        var tokenInfo = await refreshToken(tokenInfo)
        //console.log('new:', tokenInfo)
        save(tokenInfo)
        isRefreshing=false;
        console.log('done refreshing!')

        return tokenInfo;
      }catch(e){
        return {};
      }
    }
  }
  return tokenInfo
}

function refreshToken(info){
  var xhr = $.ajax({
    method: 'POST',
    url: Global.endpoint+'/refresh_token',
    data: {
      access_token: info.access_token,
      refresh_token: info.refresh_token
    }
  })
  xhr.ignoreError = true;
  return xhr;
}

function save(obj){
  localStorage.setItem(KEY, typeof(obj)=='object'?JSON.stringify(obj):obj)
}
function remove(){
  localStorage.removeItem(KEY)
}
