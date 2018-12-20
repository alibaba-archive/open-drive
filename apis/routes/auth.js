
const Auth = require('../controllers/auth');

exports.init = function(app){

  app.get('/authorize', Auth.authorize);
  //通过 code 获取 access token 
  app.get('/token', Auth.token);
  //客户端模式
  app.post('/token', Auth.token);
  app.get('/callback', Auth.callback);
  app.post('/refresh_token', Auth.refreshToken);
  // app.post('/sso_ui', Auth.ssoUi);

}
