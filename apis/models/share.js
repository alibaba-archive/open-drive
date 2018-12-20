

const OtsModel = require('../utils/otsModel');

const shareModel = new OtsModel('share', [
  {
    name: "pk_share_id",
    pk: [ "share_id"]
  }
]);

module.exports = {
  get: shareModel.get.bind(shareModel),
  add: shareModel.add.bind(shareModel),
  del: shareModel.del.bind(shareModel),
  list: shareModel.list.bind(shareModel),
  update: shareModel.update.bind(shareModel),
  put: shareModel.put.bind(shareModel),
  listByPks: async function(akInfo, items){
    
    var pkArr = [];
    items.forEach((n) => {
      pkArr.push({
        share_id: n.share_id
      });
    });
    return await shareModel.batchGet(akInfo, pkArr)
  }
}