#!/usr/bin/env node
const program = require('commander');
const path = require('path')
// const os = require('os')
// const fs = require('fs')

program
  .option('-c,--config <config_file>', 'Set configure')
  .option('-d, --debug', 'print more logs')
  .option('-r, --rsa <rsa_file>', 'specify a rsa file')
  .option('-p, --port <port>', 'specify port')
  .parse(process.argv);


if (program.config){
   var cfgFile = getRealPath(program.config)
   global._cfg = require(cfgFile); 
   console.log('using config file:', cfgFile);
}

if(program.rsa){
    var _rsa_path = getRealPath(program.rsa)
    global._rsa_path = _rsa_path
    console.log('using rsa file:', _rsa_path);
} 

if (program.port){
    process.env.PORT=parseInt(program.port)||null
}

if(program.debug){
    process.env.NODE_ENV='development'
    process.env.DEBUG=['ots','oss','svs*']
}else{
    process.env.NODE_ENV='production' 
}
require('./www')


function getRealPath(p){
    return p.startsWith('/')?p:path.join(process.cwd(), p);
}