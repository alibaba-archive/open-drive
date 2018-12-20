
require('./init').init();

const E = require('./utils/exceptions.js')
const Formater = require('./utils/formater.js')
const C = require('./const.js')
const IdTokenGenerator = require('./utils/id-token-generator')
const parseURL = require('url').parse;
const OK = C.OK;

const router = require('koa-router')()
const apiRouter = require('koa-router')()

apiRouter.all('/(.*)', async (ctx, next)=>{
  var _cfg = require('./conf').getConfig();
  ctx._cfg = _cfg;
 
  var requestId = Formater.genId();

  ctx.headers['x-ca-request-id'] = ctx.headers['x-ca-request-id'] || 'req-'+requestId;

  var akInfo = {
    endpoint: _cfg.ots.endpoint,
    instancename: _cfg.ots.instance_name,
    accessKeyId:  _cfg.ots.access_key_id ,
    accessKeySecret:   _cfg.ots.access_key_secret,
    // securityToken: isInKoa ? null : ctx.context.credentials.securityToken
  }; 
  ctx._ak_info = akInfo;
  
  var uri = parseURL(ctx.path).pathname; 

  if(['/api/status','/api/quotas',
  '/api/refresh_token','/api/callback','/api/authorize','/api/token'].indexOf(uri)!=-1
  || !uri.startsWith('/api/')
  || uri.startsWith('/public/')
  || (ctx.method=='GET' && uri.endsWith('/avatar'))){  

    await next(ctx);
    return;
  }
  
 
  try{ 
    var idToken = ctx.headers['authorization'];
    console.log(ctx.method, uri, 'got authorization:', idToken)
    
    idToken = idToken.substring('Bearer '.length).trim();
    //过期的，会被报错
    var idTokenInfo = IdTokenGenerator.decode(idToken) || {};  
    ctx.userId = idTokenInfo.userId;
    ctx.customJson = JSON.parse(idTokenInfo.customJson) || {};

    if(isDev){
      console.log('userId', ctx.userId);
      console.log('customJson', ctx.customJson);
    }
    
  }catch(e){ 
    console.log(e)
    throw new E.InvalidParameter('Invalid authorization')
  }
 
  await next(ctx);

});


apiRouter.get('/status', async (ctx)=>{ ctx.body=OK; });

require('./routes/quotas.js').init(apiRouter) 
require('./routes/auth.js').init(apiRouter)
require('./routes/admins.js').init(apiRouter) 
require('./routes/users.js').init(apiRouter)
require('./routes/storages.js').init(apiRouter)
require('./routes/drives.js').init(apiRouter)
require('./routes/shares.js').init(apiRouter)
require('./routes/files.js').init(apiRouter) 

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())
module.exports = router