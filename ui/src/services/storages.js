
import http from './http'

export default {
  listAll,
  list,
  update,
  get,
  del
}
async function del(id, force){
  return http.delete(`${Global.endpoint}/storages/${id}${force?'?force=true':''}`,)
}
async function get(id){
  return http.get(`${Global.endpoint}/storages/${id}`)
}
async function update(opt){
  if(opt.access_key_secret.indexOf('*')==-1){
    //校验 ak 有效性
    try{
      await testAK(opt)
    }catch(e){
      Toast.error(e.message)
      throw e;
    }
  }
  if(opt.storage_id){
    return http.put(`${Global.endpoint}/storages/${opt.storage_id}`, opt)
  }
  return http.post(`${Global.endpoint}/storages`, opt)
}
async function listAll(){
  var opt={
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
  return http.get(`${Global.endpoint}/storages`,opt)
}

async function testAK(opt){
  var client = new OSS({
    accessKeyId: opt.access_key_id,
    accessKeySecret: opt.access_key_secret,
    endpoint: opt.oss_endpoint ? opt.oss_endpoint: `http://oss-${opt.region}.aliyuncs.com`,
    bucket: opt.oss_bucket,
  });
  try{
     return await client.list({prefix: opt.oss_key, 'max-keys':1})
  }catch(e){
    if(e.code=='RequestError'){
      e.message = '配置有问题，请检查 OSS Bucket 名称是否正确，并且配置了跨域配置'
    }
    throw e
  }
}
