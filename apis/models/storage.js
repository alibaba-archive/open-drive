
const OtsModel = require('../utils/otsModel');

const storageModel = new OtsModel('storage', [
  {
    name: "pk_storage_id",
    pk: [ "storage_id"]
  }
]);

module.exports = {
  get: storageModel.get.bind(storageModel),
  add: storageModel.add.bind(storageModel),
  put: storageModel.put.bind(storageModel),
  del: storageModel.del.bind(storageModel),
  list: storageModel.list.bind(storageModel),
  update: storageModel.update.bind(storageModel) 
}
