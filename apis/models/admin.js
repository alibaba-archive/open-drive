
const OtsModel = require('../utils/otsModel');

const adminModel = new OtsModel('admin', [{ 
  name: "pk_user_id",
  pk: ["user_id"]
}]);

var get = adminModel.get.bind(adminModel);
var del = adminModel.del.bind(adminModel);
var add = adminModel.add.bind(adminModel);
// var put = adminModel.put.bind(adminModel);
var update = adminModel.update.bind(adminModel);
var list = adminModel.list.bind(adminModel);

module.exports = {
  get,
  add,
  del,
  update,
  list,
  // put
}