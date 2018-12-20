import FilesAPI from '../files.js'
import settingsSvs from '@/services/settingsSvs'

var gDownloadList_ref = null;
var concurrency=0
var userInfo = null;

export default {
  startAll,
  stopAll,
  downloadFiles,
  init,

  checkStart,
  saveProg
}

async function init(_userInfo, downloadList_ref){

  userInfo = _userInfo;
  gDownloadList_ref = downloadList_ref;
  concurrency = 0;

  console.log('-------OssDownloaderManager.init()-------')

  if(userInfo && isElectron){
    //初始化job
    var arr = await loadProg();
    console.log('saved prog:',arr)

    for(var _item of arr){
      (async (item)=>{

        _downloadSingleFile(item, true)
        // //1. get sts token
        // var stsInfo = await getStsToken(item.type, item.driveId, item.storeType,
        //   item.from.path)

        // //2. 创建一个 job，异步管理 进度和状态
        // await downloadJob(Object.assign(item, stsInfo), function _created(job){
        //   if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();

        //   job.type=item.type;
        //   job.driveId= item.driveId;
        //   job.storeType = item.storeType;
        //   addEvents(job)
        //   // if(!isInit)checkStart();
        // });

        // //need refresh
        // window.MyApp.$root.$emit('downloadListChanged', gDownloadList_ref);

      })(_item);
      await delay(100);
    }
  }
}

async function _downloadSingleFile(item, isInit){
  var signedInfo = await FilesAPI.genSignedUrl(item.type, item.driveId, item.from.path, {
    type: 'download'
  });

  item.from.bucket = signedInfo.bucket;
  item.from.key = signedInfo.key;
  item.from.url = fixEndpoint(signedInfo.url);
  item.endpoint = fixEndpoint(signedInfo.endpoint);

  item.signedInfo = signedInfo;

  item.getSignedUrlFn = async function(){
    return await FilesAPI.genSignedUrl(item.type, item.driveId, item.from.path, {
      type: 'download'
    });
  }


   //2. 创建一个 job，异步管理 进度和状态
   console.log(item)
   await downloadJob(item, function _created(job){
    if(isInit){
      if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();
    }

    job.type=item.type;
    job.driveId= item.driveId;
    // job.storeType = item.storeType;
    console.log('========', job)
    addEvents(job)
    if(!isInit)checkStart();
  });

  //need refresh
  window.MyApp.$root.$emit('downloadListChanged', gDownloadList_ref);

}

//toPath: 要下载到本地目录
//dirPath: 云盘中绝对路径
async function downloadFiles(type, driveId, storeType, toPath, dirPath, items, downloadList_ref){
  console.log('DownloadManager.downloadFiles:', type, driveId, storeType, toPath, items)

  if(!gDownloadList_ref) gDownloadList_ref=downloadList_ref;

  for(var _item of items){

    (async (item)=>{

      var filePath = ASNode.path.join(toPath, ASNode.path.relative(dirPath, item.path));

      if(item.type=='folder'){
        console.log('mkdir:', filePath)
        await mkdirs(filePath)

        var opt = {marker:'', limit:100, dir_path: item.path};
        do{
          var listResult = await FilesAPI.list(type, driveId, opt)
          console.log(listResult)
          opt.marker=listResult.next_marker||null;
          console.log(opt.marker)
          await downloadFiles(type, driveId, storeType, toPath, dirPath, listResult.items, downloadList_ref)
        }
        while(opt.marker)
      }
      else{




        // var stsInfo = await getStsToken(type, driveId, storeType,
        //    item.path);

        //console.log('getStsToken:',stsInfo)

        var item2 = {
           type, driveId,
           from: {
            //  bucket: stsInfo.bucket,
            //  key: stsInfo.key,
             size: item.size,
             path: item.path,
           },
           to: {
             name: item.name,
             path: filePath
           }
        };
        _downloadSingleFile(item2, false)

        // //3. 创建一个 job，异步管理进度和状态
        // await downloadJob(Object.assign(item2, stsInfo), function _created(job){
        //   //if(job.status=='waiting' || job.status=='running'|| job.status=='verifying') job.stop();
        //   job.type= type;
        //   job.driveId= driveId;
        //   job.storeType = storeType;
        //   addEvents(job)
        //   //console.log('-------created job', job)
        //   checkStart();
        // });

        // //need refresh
        // window.MyApp.$root.$emit('downloadListChanged', gDownloadList_ref);
      }



    })(_item);

    //错开 100 ms
    await delay(100);
  }
}

function mkdirs(s){
  console.log('创建目录:', s);

  return new Promise((a,b)=>{
    if(ASNode.fs.existsSync(s)){
      a();
      return;
    }
    ASNode.fs.mkdir(s, function(err){
      if(err)b(err)
      else a()
    })
  })
}

function addEvents(job){
  //通过引用更新job列表
  gDownloadList_ref.push(job);
  //need refresh
  window.MyApp.$root.$emit('downloadListChanged', gDownloadList_ref);

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
    // console.log('download progress:', job.progress)
  });

  job.on('partComplete', function(prog, cpt){
    console.log('[PartComplete]:', prog, cpt)
    saveProg()
    //console.log('save:',  progress, cpt, type, storeType, driveId, getStsTokenPath)
  });
}

// async function getStsToken(type, driveId, storeType, toPath){

//   //get upload token
//   var sts = await FilesAPI.getStsToken(type, driveId, toPath, {
//     token_type: 'download'
//   });
//   sts.endpoint = fixEndpoint(sts.endpoint);
//   sts.getStsTokenFn = async function(){
//     return await FilesAPI.getStsToken(type, driveId, toPath, {
//       token_type: 'download'
//     });
//   }
//   return sts;
// }

function fixEndpoint(endpoint){
  if(!endpoint.startsWith(location.protocol)){
    endpoint = location.protocol + endpoint.substring(endpoint.indexOf(':')+1)
  }
  return endpoint;
}


//上传

function checkStart() {
  //流控, 同时只能有 n 个上传任务.
  var maxConcurrency = +settingsSvs.maxDownloadJobCount.get();
  //console.log(concurrency , maxConcurrency);
  concurrency = Math.max(0,concurrency);
  if (concurrency < maxConcurrency) {
    var arr = gDownloadList_ref;
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
  if(!gDownloadList_ref)return;
  for(var n of gDownloadList_ref){
    if (n && (n.status == 'stopped' || n.status == 'failed')){
      n.wait();
    }
    checkStart();
  }
}
function stopAll(){
  if(!gDownloadList_ref)return;
  for(var n of gDownloadList_ref){
    if (n && (n.status == 'running' || n.status == 'waiting')){
      n.stop();
    }
  }
}


function downloadJob(cfg, createdFn) {
  return new Promise(function(resolve, reject)  {
    var store = new ASNode.OssLoader({
      signedInfo: cfg.signedInfo,
      getSignedUrlFn: cfg.getSignedUrlFn,

      // stsToken: {
      //   Credentials: {
      //     AccessKeyId: cfg.access_key_id,
      //     AccessKeySecret: cfg.access_key_secret,
      //     SecurityToken: cfg.security_token
      //   }
      // },
      endpoint: cfg.endpoint
    });
    //console.log('-----store', store)

    var job = store.createDownloadJob(cfg);
    //console.log('---job:',job)
    job.progress = (cfg.prog&&cfg.prog.total)?cfg.prog.loaded/cfg.prog.total:0;

    job.on('complete', function () {
      resolve();
    });


    job.on('error', function(err){
      console.log('download job error:', err)
      reject(err);
    });

    if(createdFn){
      createdFn(job);
    }
  });
}


// function getBaseName(p) {
//   return p.replace(/\/*$/, '').substring(p.lastIndexOf('/') + 1);
// }
//
// function getDirName(p) {
//   return p.replace(/\/*$/, '').substring(0, p.lastIndexOf('/') + 1);
// }
function saveProg(){
  if(!isElectron)return;

  delayRun('save_download_prog', 1000, async function () {

    var t = [];
    gDownloadList_ref.forEach( (n)=> {
      if (n.status == 'finished') return;

      t.push({
        type: n.type,
        driveId: n.driveId,
        // storeType: n.storeType,

        checkPoints: n.checkPoints,
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

  return ASNode.path.join(folder, `down_${userInfo.group_id}_${userInfo.user_id}.json`);
}
