const cacheModel = require('../models/cache.js');

module.exports = {
  get,
  add,
  del,
  update
}

function del(akInfo, {type, key}) {  
  return cacheModel.del(akInfo, {type, key}); 
}
async function get(akInfo, {type, key}) { 
  var item = await cacheModel.get(akInfo, {type, key});
  if(!item) return null;
  if(item.expires_time < new Date().toISOString()){
    await cacheModel.del(akInfo, {type, key});
    return null
  }
  return item.value; 
}

async function add(akInfo, {type, key,
  value, 
  expires_sec
}) { 
  var expires_time = new Date(Date.now() + expires_sec * 1000).toISOString();
  return await cacheModel.add(akInfo, {type, key}, {
    value, 
    expires_time
  });
}

async function update(akInfo, {type, key,
  value, 
  expires_sec
}) { 
  var expires_time = new Date(Date.now() + expires_sec * 1000).toISOString();
  return await cacheModel.update(akInfo, {type, key}, {
    value, 
    expires_time
  });
}

