
const OtsModel = require('../utils/otsModel');


const cacheModel = new OtsModel('quota', [{
  name: "pk_type_key",
  pk: ["type", "key"]
}]);

var get = cacheModel.get.bind(cacheModel);
var add = cacheModel.add.bind(cacheModel);
var del = cacheModel.del.bind(cacheModel);

module.exports = {
  get,
  add,
  del
}