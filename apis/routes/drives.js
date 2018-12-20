

const MyDrives = require('../controllers/my-drives.js');
const Drives = require('../controllers/drives.js');

exports.init = function(app){
  //my drive
  app.get('/drives', MyDrives.list);
  app.get('/drives/:driveId', MyDrives.get);

  //user drive， 管理员调用
  app.get('/users/:userId/drives', Drives.list);
  app.get('/users/:userId/drives/:driveId', Drives.get);
  app.put('/users/:userId/drives/:driveId', Drives.update);

  app.post('/users/:userId/drives', Drives.add)
  app.delete('/users/:userId/drives/:driveId', Drives.del)

}
