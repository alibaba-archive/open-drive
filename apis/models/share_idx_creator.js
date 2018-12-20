
const OtsModel = require('../utils/otsModel');

const shareModel = new OtsModel('share_idx_creator', [
  {
    name: "pk_creator",
    pk: ["creator"] //user_id
  },
  {
    name: "pk_share_id",
    pk: ["share_id"]
  }
]);

var get = shareModel.get.bind(shareModel);
var add = shareModel.add.bind(shareModel);
var del = shareModel.del.bind(shareModel);
var list = shareModel.list.bind(shareModel);
var update = shareModel.update.bind(shareModel);
var put = shareModel.put.bind(shareModel);

module.exports = {
  get,
  add,
  del,
  list,
  update,
  put
}