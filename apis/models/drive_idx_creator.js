
const OtsModel = require('../utils/otsModel');

const driveModel = new OtsModel('drive_idx_creator', [
  {
    name: "pk_creator",
    pk: ["creator"] //user_id
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