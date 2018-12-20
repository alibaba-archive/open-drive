
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
  put
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
  return http.get(`${Global.endpoint}/drives`,opt)
}

async function getMy(driveId, ignoreError){
  return http.get(`${Global.endpoint}/drives/${driveId}`, {ignoreError:ignoreError})
}
///###################################


async function put(userId, driveId, opt){
  return http.put(`${Global.endpoint}/users/${userId}/drives/${driveId}`, opt);
}

async function del(userId, driveId, force){
  return http.delete(`${Global.endpoint}/users/${userId}/drives/${driveId}${force?'?force=true':''}`)
}
async function get(userId, driveId, ignoreError){
  return http.get(`${Global.endpoint}/users/${userId}/drives/${driveId}`, {ignoreError:ignoreError})
}
async function add(opt){
  return http.post(`${Global.endpoint}/users/${opt.grant_to}/drives`, opt)
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
  return http.get(`${Global.endpoint}/users/${opt.grant_to}/drives`,opt)
}
