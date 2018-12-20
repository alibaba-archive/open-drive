
const Admins = require('../controllers/admins.js');


exports.init = function(app){

  //需要 admin
  app.get('/admins', Admins.list);
  app.get('/admins/:userId', Admins.get);
  app.put('/admins/:userId', Admins.update); //update or create
  app.delete('/admins/:userId', Admins.del);

}
