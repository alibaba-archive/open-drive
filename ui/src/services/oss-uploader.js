
export default {
  create,
}

/**
* 直传参考： https://help.aliyun.com/document_detail/32069.html
*
* @param cfg  {
  "getStsTokenFn": null,
  checkpoint: null,
  "toPath": '/',
  "access_key_id": "STS.xxxxx",
  "access_key_secret": "",
  "security_token": "",
  "expiration": "2017-08-31T10:56:27Z",
  "bucket": "luogc-hangzhou",
  "key": "ss-cloud-disk/203d84f9-5fb3-4348-80a8-dd8bdd544f0b",
  "region": "oss-cn-hangzhou",
  "endpoint": "http://oss-cn-hangzhou.aliyuncs.com"
}
* @param file   Html5 FileInfo
*/
function create(cfg, file, callback) {

  return new Promise(function(resolve, reject)  {


    var evtFns= [];

    var instance = {
      id: genId(),
      status: 'waiting',
      progress: 0, // 0-1
      startTime: Date.now(),

      checkpoint: cfg.checkpoint || null,

      speed: 0,

      from: {
        name: file.name,
        path: file.path,
        size: file.size,
        mineType: file.type
      },
      to: {
        path: cfg.toPath,
        name: getBaseName(cfg.toPath),
        dirPath: getDirName(cfg.toPath) || '/',
      },
      // oss: {
      //   region: cfg.region,
      //   endpoint: cfg.endpoint,
      //   bucket: cfg.bucket,
      //   key: cfg.key
      // },
      stop,
      start,
      wait,
      on
    };


    function on(evtName, fn){
      evtFns.push({evtName, fn})
    }
    function emit(evtName ,...argv){
      for(var n of evtFns){
        if(evtName==n.evtName) n.fn.apply(n, argv)
      }
    }

    function changeStatus(status) {
      instance.status = status;
      emit('statuschange', instance.status);

      if (status == 'failed' || status == 'stopped' || status == 'finished') {
        instance.endTime = Date.now();
      }
    }

    // var _ccc= {
    //   accessKeyId: cfg.access_key_id,
    //   accessKeySecret: cfg.access_key_secret,
    //   stsToken: cfg.security_token,
    //   endpoint: cfg.endpoint,
    //   bucket: cfg.bucket
    // };

    var client;
    var last_client;
    var last_parts_len=0;



    if (typeof cfg.created == 'function') {
      cfg.created(instance);
    }
    //start();

    function stop() {
      last_client =  client;
      client.cancel()
      stopSpeedCounter();
      changeStatus('stopped')
    }


    function wait() {
      changeStatus('waiting');
      stopSpeedCounter();
    }

    var last_speed=0;
    var last_loaded = 0;
    var speedTid;
    function stopSpeedCounter(){
      instance.speed = 0;
      instance.predictLeftTime= 0;
      clearInterval(speedTid);
    }

    function startSpeedCounter(){

      last_loaded = 0;
      last_speed = 0;

      clearInterval(speedTid);
      speedTid = setInterval(function(){

        instance.speed = Math.max(0, instance.progress * instance.from.size - last_loaded);
        //if(last_speed != instance.speed) emit('speedChange', instance.speed);
        last_speed = instance.speed;
        last_loaded = instance.progress * instance.from.size

        //推测耗时
        instance.predictLeftTime = instance.speed == 0
        ? 0
        : Math.floor((1-instance.progress)*instance.from.size/instance.speed*1000);

      },1000);
    }


    async function start(noRepeat) {
      changeStatus('running')
      startSpeedCounter()


      //client = new OSS.Wrapper(_ccc);

      var _stsTokenInfo =  !cfg.access_key_secret ? await cfg.getStsTokenFn() : cfg;

      var _authInfo = {
        accessKeyId: _stsTokenInfo.access_key_id,
        accessKeySecret: _stsTokenInfo.access_key_secret,
        stsToken: _stsTokenInfo.security_token,
        endpoint: _stsTokenInfo.endpoint,
        bucket: _stsTokenInfo.bucket,
        key: _stsTokenInfo.key,
      };


      _authInfo = JSON.parse(JSON.stringify(_authInfo));


      client = new OSS(_authInfo);
      var from_path = file;


      client.multipartUpload(_authInfo.key, from_path, {
        parallel: 4,
        partSize: getSensibleChunkSize(file.size),//1024 * 1024,
        mime: file.type,
        checkpoint: instance.checkpoint,
        progress: async function (p, cpt, res) {
          instance.progress = p;
          //console.log('upload process: ',p);
          instance.checkpoint = cpt;

          if(cpt && cpt.doneParts && last_parts_len!=cpt.doneParts.length){
            last_parts_len = cpt.doneParts.length

            emit('partComplete', p, cpt);
          }
        },
        callback: callback
      }).then(function(result) {
        //console.log('upload success:',result);

        //console.log('success',checkpoint)
        emit('partComplete', instance.progress);

        changeStatus('finished')
        instance.checkpoint = null;
        resolve();



      }).catch(function(err) {

        if(last_client && last_client.isCancel()){
           //cancel
        }else{
          console.log(err)
          if((err.code=='SecurityTokenExpired'||err.code=='InvalidAccessKeyIdError') && _stsTokenInfo.getStsTokenFn && !noRepeat){
            //token过期，重新获取
            start(1);
            return;
         }

          changeStatus('failed')
          //instance.checkpoint=null;
          console.log('upload error:', err);
          reject(err);
        }

      });

    }

  });
}


/**
 * @param total size
 */
function getSensibleChunkSize(size) {

  var chunkSize = 1 * 1024 * 1024; //1MB

  // if(size < chunkSize){
  //   return size;
  // }
  // else if(size < 10 * 1024*1024){
  //   chunkSize = 1* 1024 * 1024; //1MB
  // }
  // else if(size < 100 * 1024*1024){
  //   chunkSize = 10 * 1024 * 1024; //10MB
  // }
  // else if(size < 500 * 1024*1024){
  //   chunkSize = 20 * 1024 * 1024; //20MB
  // }
  // else if(size < 1024 * 1024*1024){
  //   chunkSize = 30 * 1024 * 1024; //30MB
  // }
  // else if(size < 5* 1024 * 1024*1024){
  //   chunkSize = 40 * 1024 * 1024; //40MB
  // }
  // else{
  //   chunkSize = 50 * 1024 * 1024; //50MB
  // }

  var c = Math.ceil(size/10000);
  return Math.max(c, chunkSize);

}

function genId() {
  return 'id-' + Date.now() + '-' + (('' + Math.random()).substring(2));
}

function getBaseName(p) {
  return p.replace(/\/*$/, '').substring(p.lastIndexOf('/') + 1);
}

function getDirName(p) {
  return p.replace(/\/*$/, '').substring(0, p.lastIndexOf('/') + 1);
}
