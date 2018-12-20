import http from './http'
import Users from './users'

export default {
  listAll,
  list,
  get,
  update,
  del
}
async function listAll(loadUserInfo){
  var opt={
    marker: '',
    limit: 100
  };
  var t=[];
  do{
    var result = await list(opt)

    if(loadUserInfo){
      for(var item of result.items){
        var userInfo =await Users.get(item.user_id, true)
        item.nick_name= userInfo.nick_name;
        item.avatar_url = userInfo.avatar_url;
      }
    }
    t= t.concat(clone(result.items))
    opt.marker = result.next_marker||'';
  }while(opt.marker)
  return t;
}

function list(opt){
  return http.get(`${Global.endpoint}/admins`, opt)
}
function get(userId, ignoreError){
  return http.get(`${Global.endpoint}/admins/${userId}`, {ignoreError})
}
function update(userId, data){
  return http.put(`${Global.endpoint}/admins/${userId}`,data)
}
function del(userId){
  return http.delete(`${Global.endpoint}/admins/${userId}`)
}
