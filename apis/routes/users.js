
const Users = require('../controllers/users.js'); 

exports.init = function(app){

  //无需验证
  app.get('/users/:userId/avatar', Users.getAvatar);

  //需要验证 user
  app.get('/userinfo', Users.getUserInfo);
  app.put('/userinfo/avatar', Users.updateAvatar);
 
  //需要 admin
  app.get('/users', Users.list);
  app.get('/users/:userId', Users.get);
  app.put('/users/:userId', Users.update);
  app.delete('/users/:userId', Users.del);

}
