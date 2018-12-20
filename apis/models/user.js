
const OtsModel = require('../utils/otsModel');

const userModel = new OtsModel('user', [{ 
  name: "pk_user_id",
  pk: ["user_id"]
}]);

var get = userModel.get.bind(userModel);
var del = userModel.del.bind(userModel);
var add = userModel.add.bind(userModel);
var put = userModel.put.bind(userModel);
var update = userModel.update.bind(userModel);
var list = userModel.list.bind(userModel);

module.exports = {
  get,
  add,
  del,
  update,
  list,
  put
}