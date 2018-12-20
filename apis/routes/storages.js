
const Storages = require('../controllers/storages.js');

exports.init = function(app){

  app.get('/storages', Storages.list);
  app.get('/storages/:storageId', Storages.get);
  app.put('/storages/:storageId', Storages.update);
  app.post('/storages', Storages.add);
  app.delete('/storages/:storageId', Storages.del);

}
