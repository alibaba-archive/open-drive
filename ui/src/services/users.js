import http from './http'
import TokenStore from './TokenStore'

export default {
  getUserInfo,
  logout,
  updateAvatar,

  list,
  get,
  update,
  del
}

function list(opt){
  return http.get(`${Global.endpoint}/users`, opt)
}
function get(userId, ignoreError){
  return http.get(`${Global.endpoint}/users/${userId}`, {ignoreError})
}
function update(userId, data){
  return http.put(`${Global.endpoint}/users/${userId}`,data)
}
function del(userId){
  return http.delete(`${Global.endpoint}/users/${userId}`)
}
////////////

function updateAvatar(avatar){
  return http.put(`${Global.endpoint}/userinfo/avatar`, {avatar:avatar})
}
function getUserInfo(data){
  return http.get(`${Global.endpoint}/userinfo`, data)
}

async function logout(){
  MyApp.$root.userInfo=null;
  MyApp.$root.$emit('load::UserInfo', null);

  TokenStore.remove();
  window.location.href = '/'
  
}
