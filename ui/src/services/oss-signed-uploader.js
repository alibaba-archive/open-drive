
export default {
  create,
}

/**
* 直接 put 到 signedUrl
*
* @param cfg  {
  url: "http://oss-cn-hangzhou.aliyuncs.com/xxxxxx",
  toPath: ''
}
* @param file   Html5 FileInfo
*/
function create(cfg, file, callback) {

  return new Promise(function (resolve, reject) {


    var evtFns = [];

    var instance = {
      id: genId(),
      status: 'waiting',
      progress: 0, // 0-1
      startTime: Date.now(),

      checkpoint: null,

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


    function on(evtName, fn) {
      evtFns.push({ evtName, fn })
    }
    function emit(evtName, ...argv) {
      for (var n of evtFns) {
        if (evtName == n.evtName) n.fn.apply(n, argv)
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
    var last_parts_len = 0;



    if (typeof cfg.created == 'function') {
      cfg.created(instance);
    }
    //start();

    function stop() {
      // last_client =  client;
      // client.cancel()
      stopSpeedCounter();
      changeStatus('stopped')
    }


    function wait() {
      changeStatus('waiting');
      stopSpeedCounter();
    }

    var last_speed = 0;
    var last_loaded = 0;
    var speedTid;
    function stopSpeedCounter() {
      instance.speed = 0;
      instance.predictLeftTime = 0;
      clearInterval(speedTid);
    }

    function startSpeedCounter() {

      last_loaded = 0;
      last_speed = 0;

      clearInterval(speedTid);
      speedTid = setInterval(function () {

        instance.speed = Math.max(0, instance.progress * instance.from.size - last_loaded);
        //if(last_speed != instance.speed) emit('speedChange', instance.speed);
        last_speed = instance.speed;
        last_loaded = instance.progress * instance.from.size

        //推测耗时
        instance.predictLeftTime = instance.speed == 0
          ? 0
          : Math.floor((1 - instance.progress) * instance.from.size / instance.speed * 1000);

      }, 1000);
    }


    async function start(noRepeat) {
      changeStatus('running')
      startSpeedCounter()


      //client = new OSS.Wrapper(_ccc);

      // var _stsTokenInfo =  !cfg.access_key_secret ? await cfg.getStsTokenFn() : cfg;

      // var _authInfo = {
      //   accessKeyId: _stsTokenInfo.access_key_id,
      //   accessKeySecret: _stsTokenInfo.access_key_secret,
      //   stsToken: _stsTokenInfo.security_token,
      //   endpoint: _stsTokenInfo.endpoint,
      //   bucket: _stsTokenInfo.bucket,
      //   key: _stsTokenInfo.key,
      // };


      // _authInfo = JSON.parse(JSON.stringify(_authInfo));


      // client = new OSS(_authInfo);
      var from_path = file;

      //上传进度回调函数：
      function progressHandlingFunction(e) {
        if (e.lengthComputable) {
          instance.progress = e.loaded / e.total
          // console.log({ value: e.loaded, max: e.total }); //更新数据到进度条
          // var percent = e.loaded / e.total * 100;
          // console.log(e.loaded + "/" + e.total + " bytes. " + percent.toFixed(2) + "%");
        }
      }

      return $.ajax({
        url: cfg.url,
        method: 'PUT',
        data: file,
        processData: false,
        beforeSend(xhr) {
          xhr.setRequestHeader('Content-Type', file.type);
        },
        crossDomain: true,
        xhr: function () { //获取ajaxSettings中的xhr对象，为它的upload属性绑定progress事件的处理函数
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) { //检查upload属性是否存在
            //绑定progress事件的回调函数
            myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
          }
          return myXhr; //xhr对象返回给jQuery使用
        },
        success: function () {

          instance.progress = 1,
            emit('partComplete', 1);

          changeStatus('finished')
          instance.checkpoint = null;
          resolve();
        },
        error: function (xhr) {
          var err = xhr.responseJSON || xhr.responseText;
          changeStatus('failed')
          //instance.checkpoint=null;
          console.log('upload error:', err);
          reject(err);
        }
      });




      // let formData = new FormData();
      // formData.append('file', file); // 'file





      // 3. 直接 put
      // let formData = new FormData();
      // formData.append('file', file); // 'file

      // await http.put(signedInfo.url, formData, {
      //   //跨域请求时是否需要使用凭证
      //   withCredentials: false,
      //   headers:{'Content-Type':'multipart/form-data'},
      //   onUploadProgress:function(progressEvent){ //原生获取上传进度的事件
      //     console.log(progressEvent)
      //     // if(progressEvent.lengthComputable){
      //     //     //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
      //     //     //如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
      //     //     callback1(progressEvent);
      //     // }
      //   },
      // });

    }

  });
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
