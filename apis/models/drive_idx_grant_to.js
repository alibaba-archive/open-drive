
const OtsModel = require('../utils/otsModel');

const driveModel = new OtsModel('drive_idx_grant_to', [
  {
    name: "pk_grant_to",
    pk: ["grant_to"] //user_id
  },
  {
    name: "pk_drive_id",
    pk: ["drive_id"]
  }
]);

var get = driveModel.get.bind(driveModel);
var add = driveModel.add.bind(driveModel);
var del = driveModel.del.bind(driveModel);
var list = driveModel.list.bind(driveModel);
var update = driveModel.update.bind(driveModel);
var put = driveModel.put.bind(driveModel);

module.exports = {
  get,
  add,
  del,
  list,
  update,
  put
}