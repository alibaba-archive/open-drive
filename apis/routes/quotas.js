
exports.init = function(app){

  app.get('/quotas', async (ctx)=>{

    const Conf = ctx._cfg;
    
    ctx.body={
      authorize: {
        dingding: Conf.authorize.dingding && Conf.authorize.dingding.app_id ? {app_id: Conf.authorize.dingding.app_id}: undefined,
        alipay: Conf.authorize.alipay && Conf.authorize.alipay.app_id ? {app_id: Conf.authorize.alipay.app_id}: undefined
      }
    }
  });
}
