

const MyShares = require('../controllers/my-shares.js');
const Shares = require('../controllers/shares.js');

exports.init = function(app){
  //my share
  app.get('/shares', MyShares.list);
  app.get('/shares/:shareId', MyShares.get);
  

  //user share, 管理员调用
  app.get('/users/:userId/shares', Shares.list);
  app.get('/users/:userId/shares/:shareId', Shares.get);
  app.put('/users/:userId/shares/:shareId', Shares.update);

  app.post('/users/:userId/shares', Shares.add)
  app.delete('/users/:userId/shares/:shareId', Shares.del)
  
  // 共享
  app.get('/public/shares/:shareId', MyShares.publicGet);
  app.post('/share_keys', Shares.genShareKey)
  app.post('/shares', Shares.createShareByKey)

}
