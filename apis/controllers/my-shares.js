
const shareService = require('../services/shares.js');

const E = require('../utils/exceptions.js')
const V = require('../utils/validator.js')
 

module.exports = {
  list,
  get,
  publicGet
}

async function list(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;

  var opt = { 
    grant_to: curUserId, 
    marker: ctx.query.marker,
    limit: V.limit(ctx.query.limit) 
  }

  var result = await shareService.listByGrantTo(akInfo, opt);
  if(result.items){
    result.items.forEach(n=>{ 
      //隐藏字段 
      delete n.source_path
      delete n.storage_source_path
      delete n.creator
    });
  }
  ctx.body = result;
}


async function get(ctx) {
  var curUserId = ctx.userId;
  var akInfo = ctx._ak_info;
 
  var share_id = ctx.params.shareId;

  var info = await shareService.get(akInfo, {share_id});
  if (!info) {
    throw new E.NotFound('share not found')
  }
  if (info.grant_to != curUserId && info.grant_to != "*") {
    throw new E.NotFound('share does not belongs to you')
  }

  //隐藏字段
  delete info.source_path
  delete info.storage_source_path
  delete info.creator

  ctx.body = info;
}

async function publicGet(ctx) {
  var akInfo = ctx._ak_info;
 
  var share_id = ctx.params.shareId;

  var info = await shareService.get(akInfo, {share_id});

  if(!info){
    throw new E.NotFound('share not found')
  }
   
  //隐藏字段
  delete info.source_path
  delete info.storage_source_path
  delete info.creator

  ctx.body = info;
}
