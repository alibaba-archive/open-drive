
import http from './http'

export default {
  listMyAll,
  listMy,
  getMy,
  listAll,
  list,
  add,
  get,
  del,
  share_keys,
  create_share_by_keys
}
async function share_keys(opt){
  return http.post(`${Global.endpoint}/share_keys`, opt)
}

async function create_share_by_keys(opt){
  return http.post(`${Global.endpoint}/shares`, opt)
}

async function listMyAll(){
  var opt={
    marker: '',
    limit: 100
  };
  var t=[];
  do{
    var result = await listMy(opt)
    t= t.concat(clone(result.items))
    opt.marker = result.next_marker||'';
  }while(opt.marker)
  return t;
}

function listMy(opt){
  return http.get(`${Global.endpoint}/shares`,opt)
}

async function getMy(shareId, ignoreError){
  return http.get(`${Global.endpoint}/shares/${shareId}`, {ignoreError:ignoreError})
}

///###################################



async function del(userId, shareId){
  return http.delete(`${Global.endpoint}/users/${userId}/shares/${shareId}`)
}
async function get(userId, shareId, ignoreError){
  return http.get(`${Global.endpoint}/users/${userId}/shares/${shareId}`, {ignoreError:ignoreError})
}
async function add(opt){
  return http.post(`${Global.endpoint}/users/${opt.grant_to}/shares`, opt)
}
async function listAll(userId){
  var opt= {
    grant_to: userId,
    marker: '',
    limit: 100
  };

  var t=[];
  do{
    var result = await list(opt)
    t= t.concat(clone(result.items))
    opt.marker = result.next_marker||'';
  }while(opt.marker)
  return t;
}

function list(opt){
  return http.get(`${Global.endpoint}/users/${opt.grant_to}/shares`,opt)
}
