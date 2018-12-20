import FilesAPI from '../files.js'
// import UploadJob from './upload-job.js'
import settingsSvs from '@/services/settingsSvs'
// import TokenStore from '@/services/TokenStore'

const STS_UPLOAD_SIZE = 4 * 1024 * 1024; // 4MB

var gUploadList_ref = null;
var concurrency=0
var userInfo = null;

export default {
  startAll,
  stopAll,
  uploadFiles,
  init,

  checkStart,
  saveProg
}

async function init(_userInfo, uploadList_ref){

  userInfo = _userInfo;
  gUploadList_ref = uploadList_ref;
  concurrency = 0;

  console.log('-------OssUploaderManager.init()-------')

  if(userInfo && isElectron){
    //初始化job
    var arr = await loadProg();
    console.log('saved prog:',arr)

    for(var _item of arr){
      (async (item)=>{

        await _uploadSingleFile(item, true)

        // var stsInfo = await createFileAndGetStsToken(item.type, item.driveId, item.storeType,
        //   item.from.name,item.from.size,
        //   item.to.dirPath, item.to.path)

        // //3. 创建一个 job，异步管理上传进度和状态
        // await uploadJob(Object.assign(item, stsInfo), function _created(job){
        //   if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();

        //   job.type=item.type;
        //   job.driveId= item.driveId;
        //   job.storeType = item.storeType;
        //   addEvents(job)
        // });


        // uploadFiles(item.type, item.driveId, item.storeType,
        //   item.to.path, [item.from], uploadList_ref, item.checkPoints, item.prog, true);




      })(_item);
      await delay(100);
    }
  }
}

async function _uploadSingleFile(item, isInit){
  console.log('-----upload file item:', item)

  var stsInfo = await createFileAndGetStsToken(item)

  Object.assign(item.to, {
    bucket: stsInfo.bucket,
    key: stsInfo.key,
  })

  //3. 创建一个 job，异步管理上传进度和状态

  await uploadJob(Object.assign(item, stsInfo), function _created(job){
    if(isInit){
      if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();
    }

    job.type=item.type;
    job.driveId= item.driveId;
    // job.storeType = item.storeType;
    addEvents(job, item)

    if(!isInit) checkStart();
  });


  //4. 修改文件状态
  await FilesAPI.complete(item.type, item.driveId, item.to.path);

  //need refres
  window.MyApp.$root.$emit('uploadListChanged', gUploadList_ref);
}

async function uploadFiles(type, driveId, storeType, toPath, files, uploadList_ref){
  console.log('UploadManager.uploadFiles:', type, driveId, storeType, toPath, files)

  if(!gUploadList_ref) gUploadList_ref=uploadList_ref;

  for(var _file of files){

    /*
    lastModified: 1523412999463
    lastModifiedDate: Date 2018-04-11T02:16:39.463Z
    name: "key.js"
    size: 733
    type: "application/x-javascript"
    webkitRelativePath: "sys/key.js"
    _webkitRelativePath: "sys/key.js"  //拖拽文件夹上传时自定义的Path
    */
    (async (file)=>{

      var getStsTokenPath = toPath + (file._webkitRelativePath||file.webkitRelativePath||file.name);
      var dirPath = getStsTokenPath.substring(0, getStsTokenPath.length-file.name.length);

      // var stsInfo = await createFileAndGetStsToken( type, driveId, storeType,
      //    file.name, file.size,
      //    dirPath, getStsTokenPath);

      //console.log('createFileAndGetStsToken:',stsInfo)

      var item = {
         type, driveId,
         from: {
           name: file.name,
           path: file.path,
           size: file.size,
           mineType: file.type||''
         },
         to: {
          //  bucket: stsInfo.bucket,
          //  key: stsInfo.key,

           path: getStsTokenPath,
           name: file.name,
           dirPath: dirPath,
         }
      };

      await _uploadSingleFile(item, false)


      // //3. 创建一个 job，异步管理上传进度和状态
      // await uploadJob(Object.assign(item, stsInfo), function _created(job){
      //   //if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();
      //   job.type= type;
      //   job.driveId= driveId;
      //   job.storeType = storeType;
      //   addEvents(job)
      //   //console.log('-------created job', job)
      //   checkStart();
      // });


      // //4. 修改文件状态
      // await FilesAPI.complete(type, driveId, getStsTokenPath);


      // //need refres
      // window.MyApp.$root.$emit('uploadListChanged', uploadList_ref);

    })(_file);

    //错开 100 ms
    await delay(100);
  }
}

function addEvents(job, item){
  //通过引用更新job列表
  gUploadList_ref.push(job);
  //need refresh
  window.MyApp.$root.$emit('uploadListChanged', gUploadList_ref);

  //流控
  job.on('statuschange', function(status){
    if(status=='stopped' || status=='failed' || status=='finished'){
      concurrency--;
      checkStart();
      saveProg()
    }
  });

  job.on('progress', function(prog){
    job.progress=prog.total?prog.loaded/prog.total:0;
    //console.log('upload progress:', job.progress)
  });

  job.on('partComplete', function(prog, cpt){
    console.log('[PartComplete]:', prog, cpt)
    saveProg()
    //console.log('save:',  progress, cpt, type, storeType, driveId, getStsTokenPath)
  });
}

async function createFileAndGetStsToken(item){

  // var [type, driveId, name, size, mineType, dirPath, toPath]=[item.type, item.driveId,
  //   item.from.name, item.from.size, item.from.mineType,
  //   item.to.dirPath, item.to.path];

  var {
    type, driveId,
    from: {
      name, size, mineType
    },
    to: {
      dirPath, path:toPath
    }
  } = item;

  var needSts = size > STS_UPLOAD_SIZE

  var createOpt = {
    name: name,
    type: 'file',
    dir_path:  dirPath,
    size: size,
    ignoreError: false
  }

  if(needSts){
    createOpt.return_ststoken = 'true';
  }else{
    createOpt.return_signed_url = "true";
    createOpt.content_type = mineType || '';
    // createOpt.signed_url_expires_sec=1;
  }

  //1. create file
  try{
    var result = await FilesAPI.create(type, driveId, createOpt);
    //console.log(result)

    //drive size changed
    window.MyApp.$root.$emit('driveSizeChanged')
  }catch(err){
    console.log(err);
    console.error(err.data.code+':'+err.data.message+': '+ toPath);
  }



  if(needSts){
    var sts= result.sts;

    sts.endpoint = fixEndpoint(sts.endpoint);
    sts.getStsTokenFn = async function(){
      return await FilesAPI.getStsToken(type, driveId, toPath, {
        token_type: 'upload'
      });
    }
    return sts
  }
  else{
    var signed = result.signed;
    signed.url = fixEndpoint(signed.url);
    signed.headers = signed.headers || {}
    signed.headers['Content-Type']=createOpt.content_type
    signed.getSignedUrlFn = async function(){
      return await FilesAPI.genSignedUrl(type, driveId, toPath, {
        type: 'upload',
        content_type: item.from.mintType||''
      });
    }
    return signed;
  }

}

function fixEndpoint(endpoint){
  if(!endpoint.startsWith(location.protocol)){
    endpoint = location.protocol + endpoint.substring(endpoint.indexOf(':')+1)
  }
  return endpoint;
}


//上传

function checkStart() {
  //流控, 同时只能有 n 个上传任务.
  var maxConcurrency = +settingsSvs.maxUploadJobCount.get();
  //console.log(concurrency , maxConcurrency);
  concurrency = Math.max(0,concurrency);
  if (concurrency < maxConcurrency) {
    var arr = gUploadList_ref;
    for (var i = 0; i < arr.length; i++) {
      if (concurrency >= maxConcurrency) return;

      var n = arr[i];
      if (n.status == 'waiting') {
        n.start();
        concurrency++;
      }
    }
  }
}

function startAll(){
  if(!gUploadList_ref)return;
  for(var n of gUploadList_ref){
    if (n && (n.status == 'stopped' || n.status == 'failed')){
      n.wait();
    }
    checkStart();
  }
}
function stopAll(){
  if(!gUploadList_ref)return;
  for(var n of gUploadList_ref){
    if (n && (n.status == 'running' || n.status == 'waiting')){
      n.stop();
    }
  }
}


function uploadJob(cfg, createdFn) {
  return new Promise(function(resolve, reject)  {

    if(!cfg.security_token){
      var opt = {
        signedInfo: {
          method: cfg.method,
          url: cfg.url,
          headers: cfg.headers
        },
        endpoint: cfg.endpoint,
        getSignedUrlFn: cfg.getSignedUrlFn
      };
    }else{
      var opt = {
        stsToken: {
          Credentials: {
            AccessKeyId: cfg.access_key_id,
            AccessKeySecret: cfg.access_key_secret,
            SecurityToken: cfg.security_token
          }
        },
        endpoint: cfg.endpoint,
        getStsTokenFn: cfg.getStsTokenFn
      };
    }


    var store = new ASNode.OssLoader(opt);
    //console.log('-----store', store)

    var job = store.createUploadJob(cfg);
    //console.log('---job:',job)
    job.progress = (cfg.prog&&cfg.prog.total)?cfg.prog.loaded/cfg.prog.total:0;

    job.on('complete', function () {
      resolve();
    });


    job.on('error', function(err){
      console.log('upload job error:', err)
      reject(err);
    });

    if(createdFn){
      createdFn(job);
    }
  });
}


function getBaseName(p) {
  return p.replace(/\/*$/, '').substring(p.lastIndexOf('/') + 1);
}

function getDirName(p) {
  return p.replace(/\/*$/, '').substring(0, p.lastIndexOf('/') + 1);
}
function saveProg(){
  if(!isElectron)return;

  delayRun('save_upload_prog', 1000, async function () {

    var t = [];
    gUploadList_ref.forEach( (n)=> {
      if (n.status == 'finished') return;

      // t.push({
      //   type: type,
      //   driveId: driveId,
      //   storeType: storeType,
      //
      //   crc64Str: n.crc64Str,
      //   checkpoint: n.checkpoint,
      //   region: n.region,
      //   to: n.to,
      //   from: n.from,
      //   status: n.status,
      //   message: '',
      //   progress: n.progress
      // });

      if (n.checkPoints && n.checkPoints.chunks) {
        var checkPoints = JSON.parse(JSON.stringify(n.checkPoints));
        delete checkPoints.chunks;
      }

      t.push({
        type: n.type,
        driveId: n.driveId,
        // storeType: n.storeType,

        crc64Str: n.crc64Str,
        checkPoints: checkPoints,
        region: n.region,
        to: n.to,
        from: n.from,
        status: n.status,
        message: n.message,
        prog: n.prog
      });

    });

    console.log('-----save', JSON.stringify(t,' ',2))
    ASNode.fs.writeFileSync(await getProgFilePath(), JSON.stringify(t));
  },20);
}


/**
 * 获取保存的进度
 */
async function loadProg() {
  if(!isElectron)return [];
  try {
    var data = ASNode.fs.readFileSync(await getProgFilePath());
    return JSON.parse(data ? data.toString() : '[]');
  } catch (e) {

  }
  return [];
}

//上传进度保存路径
async function getProgFilePath() {
  var folder = ASNode.path.join(ASNode.os.homedir(), '.opendrive');
  if(!ASNode.fs.existsSync(folder)){
     ASNode.fs.mkdirSync(folder);
  }

  return ASNode.path.join(folder, `up_${userInfo.group_id}_${userInfo.user_id}.json`);
}
