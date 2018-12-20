const os = require('os')
const path = require('path')


var cfg;
exports.getConfig = function (){
   
  if(global._cfg){
    cfg = global._cfg;
    return global._cfg
  }
  
  if(cfg && cfg.expires_time > Date.now()) return cfg;
  else{
    this.getConfigImmediately();
    return cfg;
  }
}

exports.getConfigImmediately = function (){
  var cfg_str = process.env['ENV_CONFIG']

  if(cfg_str){
    cfg= JSON.parse(cfg_str)
  }
  else{
    cfg= require(path.join(os.homedir(),'.open-drive-config'));
  }

  cfg.expires_time = Date.now() + 5*60*1000; //5min 
  global._cfg = cfg;
}
