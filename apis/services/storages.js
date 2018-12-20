const otsStorage = require('../models/storage.js')

const Cipher = require('../utils/cipher')
const C = require('../const')
const DEFAULT_LIMIT = C.DEFAULT_LIMIT;


module.exports = {
  get,
  put,
  update,
  del,
  list,
  listAll, 
}


function getCipherSecret(){
  var Conf = require('../conf').getConfig()
  const CIPHER_SECRET = Conf.cipher_secret;
  return CIPHER_SECRET
}
function _cipher(info, CIPHER_SECRET){
  if(info.access_key_secret){
    try{
      info.access_key_secret_cipher = Cipher.cipher(info.access_key_secret, CIPHER_SECRET);
    }catch(e){
      console.error('Cipher Error:'+JSON.stringify(e));
      info.access_key_secret_cipher = ''
    }
    delete info.access_key_secret;
  }
}
function _decipher(info, CIPHER_SECRET){
  if(info.access_key_secret_cipher){
    try{
      info.access_key_secret = Cipher.decipher(info.access_key_secret_cipher, CIPHER_SECRET);
    }catch(e){
      console.error('Decipher Error:'+JSON.stringify(e));
      info.access_key_secret = ''
    }
    delete info.access_key_secret_cipher;
  }
}

async function update(akInfo, {storage_id, ...info}) {
  var CIPHER_SECRET = getCipherSecret();
  _cipher(info, CIPHER_SECRET);
  return await otsStorage.update(akInfo, {storage_id}, info);
}

async function put(akInfo, {storage_id, ...info}) {
  var CIPHER_SECRET = getCipherSecret();
  _cipher(info, CIPHER_SECRET);
  return await otsStorage.put(akInfo, {storage_id}, info);
}

async function get(akInfo, {storage_id}) {
  var CIPHER_SECRET = getCipherSecret();
  var info = await otsStorage.get(akInfo, {storage_id});
  _decipher(info, CIPHER_SECRET);
  return info;
}

async function del(akInfo, {storage_id}) {
  return await otsStorage.del(akInfo,{storage_id});
}


async function listAll(akInfo){
  
  let opt = {marker:'',limit: DEFAULT_LIMIT}
  let t=[]
  do{
    let result = await list(akInfo, {}, opt)
    t = t.concat(result.items)
    if(result.next_marker){
      opt.marker = result.next_marker;
    }
  }while(opt.marker)


  var CIPHER_SECRET = getCipherSecret();
  t.forEach(info=>{
    _decipher(info, CIPHER_SECRET);
  });
  return t
}

async function list(akInfo, {marker, limit=100}) {
  var CIPHER_SECRET = getCipherSecret();
  var result= await otsStorage.list(akInfo, {}, {marker, limit});
  result.items.forEach(info=>{
    _decipher(info, CIPHER_SECRET);
  });
  return result;
}
