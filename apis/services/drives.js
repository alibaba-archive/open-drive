const Ots = require('../utils/ots')
const TableStore = require('tablestore')
const debug = require('debug')('svs')
const otsDrive = require('../models/drive.js')
const idx_grant_to = require('../models/drive_idx_grant_to.js')
const idx_creator = require('../models/drive_idx_creator.js')
const idx_storage = require('../models/drive_idx_storage.js')
const transaction = require('../utils/transaction.js')
const E = require('../utils/exceptions.js')
const TABLE_NAME = 'drive';

module.exports = {
  get,
  put,
  del,
  list,
  update,

  updateSize,
  listByOwner,
  listByGrantTo,

  listByStorage
}


async function listByStorage(akInfo, {storage_id, marker, limit=100}){
  var obj = await idx_storage.list(akInfo, {storage_id},{marker, limit});

  var items = [];
  if(obj.items.length>0){ 
    var result = await otsDrive.listByPks(akInfo, obj.items);
    items = result.items;
  }
  return {
    items,
    next_marker: obj.next_marker
  }
}

async function listByOwner(akInfo, {creator, marker, limit=100}){
  var obj = await idx_creator.list(akInfo, {creator}, {marker, limit});
  var items = [];
  if(obj.items.length>0){ 
    var result = await otsDrive.listByPks(akInfo, obj.items);
    items = result.items;
  }
  return {
    items,
    next_marker: obj.next_marker
  }
}

async function listByGrantTo(akInfo, {grant_to, marker, limit=100}){
  var obj = await idx_grant_to.list(akInfo, {grant_to}, {marker, limit});
  var items = [];
  if(obj.items.length>0){ 
    var result = await otsDrive.listByPks(akInfo, obj.items);
    items = result.items;
  }
  return {
    items,
    next_marker: obj.next_marker
  }
}

async function list(akInfo, {marker, limit=100}){
  return await otsDrive.list(akInfo, {marker, limit});
}
async function update(akInfo, {drive_id, status, description}){
  return await otsDrive.update(akInfo, {drive_id}, {status, description});
}
// 更新used_size
async function updateSize(akInfo, originDriveInfo, usedSizeChangeValue) {
  var result, count = 0;

  originDriveInfo.total_size = parseInt(originDriveInfo.total_size, 10) || 0;

  var originUsedSize = parseInt(originDriveInfo.used_size, 10) || 0;

  usedSizeChangeValue = parseInt(usedSizeChangeValue, 10) || 0;

  var targetUsedSize = originUsedSize + usedSizeChangeValue;
  targetUsedSize = targetUsedSize < 0 ? 0 : targetUsedSize;

  if(originDriveInfo.total_size != 0 && originDriveInfo.total_size < targetUsedSize){
    throw new E.NotEnoughSpace('Not enough space');
  }

  var pk = [{
    pk_drive_id: originDriveInfo.drive_id
  }];

  do{
    try {
      result = await Ots.updateRow(akInfo, {
        tableName: TABLE_NAME,
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_EXIST,
          new TableStore.SingleColumnCondition('used_size', originUsedSize,
            TableStore.ComparatorType.EQUAL)),
        primaryKey: pk,
        updateOfAttributeColumns: [{
          'PUT': [{
            used_size: targetUsedSize
          }]
        }]
      });
    } catch (e) {

      result = null;
      await delay(random(1, 10));
      await updateDriveInfo();
    }
  } while(!result && count++ < 10);

  if(count >= 10){
    throw new E.Internal("Drive table is busy, please try again later.");
  }

  async function updateDriveInfo(){
    var drive = await get(akInfo, {drive_id: originDriveInfo.drive_id });
    drive.total_size = parseInt(drive.total_size) || 0;
    originUsedSize = parseInt(drive.used_size, 10) || 0;
    originUsedSize = originUsedSize < 0 ? 0 : originUsedSize;
    targetUsedSize = originUsedSize + usedSizeChangeValue;
    targetUsedSize = targetUsedSize < 0 ? 0 : targetUsedSize;
    if(drive.total_size != 0 && drive.total_size < targetUsedSize){
      throw new E.NotEnoughSpace('Not enough space');
    }
    return ;
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(function(){
        resolve();
      }, ms);
    });
  }

  function random(min, max) {
    var range = max - min;
    var rand = Math.random();
    var num = min + Math.round(rand * range); //四舍五入
    return num;
  }

  return result;
}

async function put(akInfo, {drive_id, ...driveInfo}) {
  
  var {grant_to, creator, storage_id} = driveInfo

  await transaction.exec([{
    action: async function(){
      await otsDrive.put(akInfo, {drive_id}, driveInfo);
    },
    restore: async function(){
      await otsDrive.del(akInfo, {drive_id});
    }
  },{
    action: async function(){
      await idx_grant_to.put(akInfo, {grant_to, drive_id});
    },
    restore: async function(){
      await idx_grant_to.del(akInfo, {grant_to, drive_id});
    }
  },{
    action: async function(){
      await idx_creator.put(akInfo, {creator, drive_id});
    },
    restore: async function(){
      await idx_creator.del(akInfo, {creator, drive_id});
    }
  },{
    action: async function(){
      await idx_storage.put(akInfo, {storage_id, drive_id});
    },
    restore: async function(){
      await idx_storage.del(akInfo, {storage_id, drive_id});
    }
  }]);
}

async function get(akInfo, {drive_id}) {
  return await otsDrive.get(akInfo, {drive_id});
}

async function del(akInfo,  {drive_id}) {
  var driveInfo = await otsDrive.get(akInfo, {drive_id});
  if(!driveInfo)return null;

  var {_drive_id, ..._driveInfo} = driveInfo;
  var {creator, grant_to ,storage_id} = driveInfo;


  await transaction.exec([{
    action: async function(){
      await otsDrive.del(akInfo, {drive_id});
    },
    restore: async function(){
      await otsDrive.put(akInfo, {drive_id}, _driveInfo);
    }
  },{
    action: async function(){
      await idx_grant_to.del(akInfo, {grant_to, drive_id});
    },
    restore: async function(){
      await idx_grant_to.put(akInfo, {grant_to, drive_id});
    }
  },{
    action: async function(){
      await idx_creator.del(akInfo, {creator, drive_id});
    },
    restore: async function(){
      await idx_creator.put(akInfo, {creator, drive_id});
    }
  },{
    action: async function(){
      await idx_storage.del(akInfo, {storage_id, drive_id});
    },
    restore: async function(){
      await idx_storage.put(akInfo, {storage_id, drive_id});
    }
  }]);
}
