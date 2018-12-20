
const DriveService = require('../services/drives.js');
 
const E = require('../utils/exceptions.js')

const C = require('../const')
const V = require('../utils/validator.js')

module.exports = {
  list,
  get,
}

async function list(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var opt = { 
    grant_to: curUserId,
    
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit)  
  }
 
  var result = await DriveService.listByGrantTo(akInfo,  opt);
  var driveArr = [];
  if(result.items){
    result.items.forEach(n=>{
      if(n.status && n.status === "disabled"){
        return ;
      }
      //隐藏字段
      delete n.creator
      delete n.storage_source_path
      delete n.source_path

      driveArr.push(n)
    });
  }
  result.items = driveArr;
  ctx.body = result;
}


async function get(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var drive_id = ctx.params.driveId;

  var info = await DriveService.get(akInfo, {drive_id});

  if(!info){
    throw new E.NotFound('drive not found')
  }
  else{
    if(info.grant_to != curUserId){
      throw new E.NoPermission('no permission')
    }
    if(info.status && info.status === "disabled"){
      throw new E.NoPermission('no permission')
    }

    //隐藏字段
    delete info.creator
    delete info.storage_source_path
    delete info.source_path

  }

  ctx.body = info;
}
