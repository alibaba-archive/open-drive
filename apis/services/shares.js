const otsShare = require('../models/share.js')

const idx_grant_to = require('../models/share_idx_grant_to.js')
const idx_creator = require('../models/share_idx_creator.js')
const idx_storage_path_grant_to = require('../models/share_idx_storage_path_grant_to.js')
const transaction = require('../utils/transaction.js')

module.exports = {
  get,
  put,
  update,
  del,
  list,
  listByGrantTo,
  listByOwner,
  listByPath,
  listByPathGrantTo
}

async function listByPath(akInfo, {storage_id, storage_source_path,  marker, limit=100 }) {
  //opt.prefix_range = true;
  var obj = await idx_storage_path_grant_to.list(akInfo, {storage_id, storage_source_path}, { marker, limit});
  var items = [];
  if(obj.items.length>0){
    var result = await otsShare.listByPks(akInfo, obj.items);
    items = result.items || [];
  }
  return formatListResult(items, obj.next_marker);

}

async function listByPathGrantTo(akInfo, {storage_id, storage_source_path, grant_to,  marker, limit=100 }) {
  var obj = await idx_storage_path_grant_to.list(akInfo, {storage_id, storage_source_path, grant_to}, { marker, limit });
  var items = [];
  if(obj.items.length>0){
    var result = await otsShare.listByPks(akInfo, obj.items);
    items = result.items || [];
  }
  return formatListResult(items, obj.next_marker);
}


async function listByOwner(akInfo, {creator,  marker, limit=100 }){
  var obj = await idx_creator.list(akInfo, {creator}, { marker, limit });
  var items = [];
  if(obj.items.length>0){
    var result = await otsShare.listByPks(akInfo, obj.items);
    items = result.items || [];
  }
  return formatListResult(items, obj.next_marker);
}


async function listByGrantTo(akInfo, {grant_to,  marker, limit=100 }){
  var obj = await idx_grant_to.list(akInfo, {grant_to}, { marker, limit });
  var items = [];
  if(obj.items.length>0){
    var result = await otsShare.listByPks(akInfo, obj.items);
    items = result.items || [];
  }
  return formatListResult(items, obj.next_marker);
} 


function formatListResult(items, next_marker){
  var t = [];
  items.forEach(async (item) => {
    if(item['expires_time'] && item['expires_time'] < new Date().toISOString()){
      await del(akInfo, {share_id:  item.share_id});
      return ;
    }
    t.push(item);
  });
  return {
    items: t, next_marker
  }
}


async function list(akInfo, {marker, limit=100}){
  var result = await otsShare.list(akInfo, {}, {marker, limit});
  return formatListResult(result.items, result.next_marker);
}
async function update(akInfo, {share_id, ...info}){
  return await otsShare.update(akInfo, share_id, info);
}


async function put(akInfo, {share_id, ...shareInfo}) {

  var {creator, storage_id, grant_to, storage_source_path} = shareInfo;

  await transaction.exec([{
    action: async function(){
      await otsShare.put(akInfo, {share_id}, shareInfo);
    },
    restore: async function(){
      await otsShare.del(akInfo, {share_id});
    }
  },{
    action: async function(){
      await idx_grant_to.put(akInfo, {grant_to, share_id});
    },
    restore: async function(){
      await idx_grant_to.del(akInfo, {grant_to, share_id});
    }
  },{
    action: async function(){
      await idx_creator.put(akInfo, {creator, share_id});
    },
    restore: async function(){
      await idx_creator.del(akInfo, {creator, share_id});
    }
  },{
    action: async function(){
      await idx_storage_path_grant_to.put(akInfo, {storage_id, storage_source_path, grant_to, share_id});
    },
    restore: async function(){
      await idx_storage_path_grant_to.del(akInfo, {storage_id, storage_source_path, grant_to, share_id});
    }
  }]);
}

async function get(akInfo, {share_id}) {

  var item = await otsShare.get(akInfo,{share_id});

  if(item && item['expires_time'] && item['expires_time'] < new Date().toISOString()){
    await del(akInfo, {share_id});
    return null;
  }

  return item;
}


async function del(akInfo, {share_id}) {
  var shareInfo = await otsShare.get(akInfo,{share_id});
  if(!shareInfo) return null;

  var {_share_id, ..._shareInfo} = shareInfo;
  var {creator, storage_id, grant_to, storage_source_path} = shareInfo;

  await transaction.exec([{
    action: async function(){
      await otsShare.del(akInfo, {share_id});
    },
    restore: async function(){
      await otsShare.put(akInfo, {share_id}, _shareInfo);
    }
  },{
    action: async function(){
      await idx_grant_to.del(akInfo, {grant_to, share_id});
    },
    restore: async function(){
      await idx_grant_to.put(akInfo, {grant_to, share_id});
    }
  },{
    action: async function(){
      await idx_creator.del(akInfo,  {creator, share_id});
    },
    restore: async function(){
      await idx_creator.put(akInfo, {creator, share_id});
    }
  },{
    action: async function(){
      await idx_storage_path_grant_to.del(akInfo, {storage_id, storage_source_path, grant_to, share_id});
    },
    restore: async function(){
      await idx_storage_path_grant_to.put(akInfo, {storage_id, storage_source_path, grant_to, share_id});
    }
  }]);
}
