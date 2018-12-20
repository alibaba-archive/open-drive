const Oss = require('../utils/oss')
const path = require('path')
const C = require('../const.js')
const Formater = require('../utils/formater')

const DEFAULT_LIMIT = C.DEFAULT_LIMIT
const IMAGE_SN_PROCESS='image/resize,m_pad,h_64,w_64'
const joinPath = Formater.joinPath;
module.exports = {
  list,
  get,
  del,
  copy,
  move,
  delRecursion,
  copyRecursion,
  moveRecursion,
  createFolder
}


async function copy(storageInfo, opt){
  var ossAkInfo = {
    region: storageInfo.region,
    // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  };

  var pre_path = joinPath(storageInfo.oss_key, opt.storage_source_path);

  var ossOpt = { 
    from_bucket: storageInfo.oss_bucket,
    from_key: joinPath(pre_path, opt.dir_path, opt.name, opt.file_path.endsWith('/')?'/':''),

    bucket: storageInfo.oss_bucket,
    key:  joinPath(pre_path, opt.new_dir_path, opt.new_name, opt.file_path.endsWith('/')?'/':''),
  };

  ossOpt.from_key = ossOpt.from_key.replace(/^\//, '');
  ossOpt.key = ossOpt.key.replace(/^\//, '');
 
  try{
    var headResult = await Oss.head(ossAkInfo, {
      bucket: ossOpt.from_bucket,
      key: ossOpt.from_key
    });

    var size = parseInt(headResult.res.headers['content-length'])||0;
    var copyFn = size > 1000*1000*1000 ? 'multipartUploadCopy': 'copy';


    await Oss[copyFn](ossAkInfo, ossOpt)
  }catch(e){
    if(e.code!='NoSuchKey'){
       throw e;
    }
  }

  var res = { 
    path: joinPath(opt.new_dir_path, opt.new_name,  opt.file_path.endsWith('/')?'/':'')
  };

  if(opt.share_id){
    res.share_id = opt.share_id;
  }else{
    res.drive_id = opt.drive_id;
  }
  return res;
}

async function move(storageInfo, opt){
  await copy(storageInfo, opt)
  await del(storageInfo, opt)
}

async function createFolder(storageInfo, opt) {

  var ossAkInfo = {
    region: storageInfo.region,
    // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  };

  var pre_path = joinPath(storageInfo.oss_key, opt.storage_source_path);

  var ossOpt = { 
    drive_id: opt.drive_id,
    bucket: storageInfo.oss_bucket,
    key: joinPath(pre_path, opt.dir_path, opt.name, '/'),
    content: Buffer.from('')
  };

  ossOpt.key = ossOpt.key.replace(/^\//, '');

  await Oss.put(ossAkInfo, ossOpt)

  return { 
    drive_id: opt.drive_id,
    path: joinPath(opt.dir_path, opt.name, '/')
  }
}

async function del(storageInfo, opt) {
  var ossAkInfo = {
    region: storageInfo.region,
    // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  }

  var pre_path = joinPath(storageInfo.oss_key, opt.storage_source_path).replace(/^\//, '');

  var ossOpt = { 
    drive_id: opt.drive_id,

    bucket: storageInfo.oss_bucket,
    key: joinPath(pre_path, opt.file_path)
  };

  ossOpt.key = ossOpt.key.replace(/^\//, '');

  try{
    return await Oss.del(ossAkInfo, ossOpt)
  }catch(e){
    if(e.code!='NoSuchKey'){
      throw e;
    }
  }
}

async function get(storageInfo, opt) {
 
  var pre_path = joinPath(storageInfo.oss_key, opt.storage_source_path);

  opt.prefix = joinPath(pre_path, opt.dir_path, opt.name)
 
  opt.limit = 1;
  //通过list 来判断 文件和目录是否存在。
  var result = await list(storageInfo, opt, true)
  return result.items.length > 0 ? result.items[0] : null;
}


async function list(storageInfo, opt, show_self) {
  var ossAkInfo = {
    // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
    region: storageInfo.region,
    accessKeyId: storageInfo.access_key_id,
    accessKeySecret: storageInfo.access_key_secret,
    bucket: storageInfo.oss_bucket,
  }
  //需要截断的前缀
  var pre_path = joinPath(storageInfo.oss_key, opt.storage_source_path)//.replace(/^\//, '');

  var ossOpt = { 
    drive_id: opt.drive_id,

    bucket: storageInfo.oss_bucket,
    prefix: opt.prefix || joinPath(pre_path, opt.dir_path),
    marker: opt.marker,
    delimiter: '/',
    'max-keys': opt.limit
  };

  if(ossOpt.prefix.startsWith(".")){
    ossOpt.prefix = ossOpt.prefix.substring(1);
  }

  ossOpt.prefix = ossOpt.prefix.replace(/^\//, '');

  var ossListResult = await Oss.list(ossAkInfo, ossOpt);


  var fileList = ossListResult.objects || [];
  var folderList = ossListResult.prefixes || [];

  var t1 = [];
  folderList.forEach(n => {
    let _name = path.basename(n);
    let _dir_path = joinPath('/',path.dirname(n.substring(pre_path.length)),'/');
    t1.push({
      name: _name,
      dir_path: _dir_path,
      path: joinPath(_dir_path, _name,'/' ),
      size: 0,
      type: 'folder',
      status: 'normal',
      drive_id: opt.drive_id 
    })
  })
  var t2 = [];
  fileList.forEach(n => {

    if (!show_self && n.name == ossOpt.prefix) return;

    let _name = path.basename(n.name);
    let _dir_path = joinPath('/', path.dirname(n.name.substring(pre_path.length)), '/');
    let _obj = {
      name: _name,
      dir_path: _dir_path,
      path: joinPath(_dir_path, _name),
      size: n.size,
      type: 'file',
      status: 'normal',
      updated_at: Date.parse(n.lastModified),
      drive_id: opt.drive_id, 
      download_url: Oss.signatureUrl(ossAkInfo, {bucket: ossOpt.bucket,key: n.name, expires: opt.url_expires_sec||3600, response:{
        'content-disposition':'attachment;filename='+encodeURIComponent(_name)
      }})
    }
    if(Oss.isOssProcessImageType(_obj)){
      _obj['image_snap_url'] = Oss.signatureUrl(ossAkInfo, {bucket: ossOpt.bucket,key: n.name, expires: opt.url_expires_sec||3600, process: opt.image_snap_url_process})
    }
    t2.push(_obj)
  })

  return {
    items: t1.concat(t2),
    next_marker: ossListResult['nextMarker']
  }

}


async function delRecursion(akInfo, storageInfo, driveInfo, opts) {

  // var ossAkInfo = {
  //   region: storageInfo.region,
  //   // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
  //   accessKeyId: storageInfo.access_key_id,
  //   accessKeySecret: storageInfo.access_key_secret,
  //   bucket: storageInfo.oss_bucket,
  // }

  // 如果参数为空则返回
  if(!opts || !opts.length || opts.length == 0){
    return ;
  }

  var storage_source_path = opts[0].storage_source_path;

  async function recursion(items) {

    for(var item of items) {
      item.storage_source_path = storage_source_path;
      item.file_path = item.file_path || item.path;
      if (item.type == 'folder') {
        let marker;
        let listOption = {};
        do{
          listOption.marker = marker;
          listOption.storage_source_path = item.storage_source_path; 
          listOption.drive_id = item.drive_id;
          listOption.dir_path = joinPath(item.dir_path, item.name, "/");
          listOption.limit = DEFAULT_LIMIT;
          let listResult = await list(storageInfo, listOption);
          let arr = listResult.items;

          await recursion(arr);

          marker=listResult.next_marker;
        }
        while(marker);
      }

      await DriveService.updateSize(akInfo, driveInfo, -item.size);
      await del(storageInfo, item);
    };

  }

  await recursion(opts);
}


async function copyRecursion(akInfo, storageInfo, driveInfo, opt) {

  // var ossAkInfo = {
  //   region: storageInfo.region,
  //   // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
  //   accessKeyId: storageInfo.access_key_id,
  //   accessKeySecret: storageInfo.access_key_secret,
  //   bucket: storageInfo.oss_bucket,
  // }

  var old_dir_path = opt.dir_path;
  var old_name = opt.name;

  var new_dir_path = opt.new_dir_path;
  var new_name = opt.new_name;

  var storage_source_path = opt.storage_source_path;

  var info = await get(storageInfo, opt);

  async function recursion(items) {

    for(var item of items) {
      let marker;
      let listOption = {};
      item.storage_source_path = storage_source_path;
      item.file_path = item.file_path || item.path;

      let newItem = Object.assign({}, item);

      var obj = getNewNameDirPath(old_dir_path, new_dir_path, newItem.dir_path, newItem.name, new_name);
      newItem.dir_path = obj.dir_path;
      newItem.name = obj.name;
      newItem.dir_path = getDirPath(old_dir_path, new_dir_path, newItem.dir_path, newItem.name);

      if (item.type == 'folder') {
        await createFolder(storageInfo, newItem);
        listOption.storage_source_path = item.storage_source_path; 
        listOption.drive_id = item.drive_id;
        listOption.dir_path = joinPath(item.dir_path, item.name, "/");
        do{
          listOption.marker = marker;
          listOption.limit = DEFAULT_LIMIT;
          let listResult = await list(storageInfo, listOption);
          let arr = listResult.items;

          await recursion(arr);

          marker=listResult.next_marker;
        }
        while(marker);
      }
      else{
        newItem.new_dir_path = newItem.dir_path;
        newItem.new_name = newItem.name;
        newItem.dir_path = item.dir_path;
        newItem.name = item.name;


        // 将文件size加入drive的used_size
        if(newItem.size && newItem.size > 0){
          await DriveService.updateSize(akInfo, driveInfo, newItem.size);
        }

        await copy(storageInfo, newItem);
      }
    };

  }

  await recursion([info]);
}


async function moveRecursion(storageInfo, opt) {

  // var ossAkInfo = {
  //   region: storageInfo.region,
  //   // endpoint: Formater.getEndpoint(storageInfo, 'oss_endpoint'),
  //   accessKeyId: storageInfo.access_key_id,
  //   accessKeySecret: storageInfo.access_key_secret,
  //   bucket: storageInfo.oss_bucket,
  // }

  var old_dir_path = opt.dir_path;
  var old_name = opt.name;

  var new_dir_path = opt.new_dir_path;
  var new_name = opt.new_name;

  var storage_source_path = opt.storage_source_path;

  var info = await get(storageInfo, opt);

  async function recursion(items) {

    for(var item of items) {
      let marker;
      let listOption = {};
      item.storage_source_path = storage_source_path;
      item.file_path = item.file_path || item.path;

      let newItem = Object.assign({}, item);

      var obj = getNewNameDirPath(old_dir_path, new_dir_path, newItem.dir_path, newItem.name, new_name);
      newItem.dir_path = obj.dir_path;
      newItem.name = obj.name;
      newItem.dir_path = getDirPath(old_dir_path, new_dir_path, newItem.dir_path, newItem.name);

      if (item.type == 'folder') {
        await createFolder(storageInfo, newItem);
        await del(storageInfo, item);
        listOption.storage_source_path = item.storage_source_path; 
        listOption.drive_id = item.drive_id;
        listOption.dir_path = joinPath(item.dir_path, item.name, "/");
        do{
          listOption.marker = marker;
          listOption.limit = DEFAULT_LIMIT;
          let listResult = await list(storageInfo, listOption);
          let arr = listResult.items;

          await recursion(arr);

          marker=listResult.next_marker;
        }
        while(marker);
      }
      else{
        newItem.new_dir_path = newItem.dir_path;
        newItem.new_name = newItem.name;
        newItem.dir_path = item.dir_path;
        newItem.name = item.name;
        await copy(storageInfo, newItem);
        await del(storageInfo, item);
      }
    };

  }

  await recursion([info]);
}


function getDirPath(fromDir, toDir, dirPath, name){
  var k = dirPath;
  if(dirPath.startsWith(fromDir)){
    k = dirPath.substring(fromDir.length);
  }
  return toDir.replace(/(\/*$)/g,'') +'/' + (k.replace(/(^\/*)/,''));
}

function getNewNameDirPath(fromDir, toDir, dirPath, name, newName) {
  var k = dirPath.substring(fromDir.length);
  var arr = k.split("/").filter(n => !!n);
  if(arr.length > 0){
    arr[0] = newName;
    return {
      name: name,
      dir_path: arr.length > 0 ? "/" + arr.join("/") + "/" : "/"
    }
  }else{
    name = newName;
    return {
      name: name,
      dir_path: dirPath
    }
  }
}
