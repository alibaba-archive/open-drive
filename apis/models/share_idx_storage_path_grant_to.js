
const OtsModel = require('../utils/otsModel');

const shareModel = new OtsModel('share_idx_storage_path_grant_to', [
  {
    name: "pk_storage_path",
    pk: ["storage_id",'storage_source_path']
  },
  {
    name: "pk_grant_to",
    pk: ["grant_to"] //user_id
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