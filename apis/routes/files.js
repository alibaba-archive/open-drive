

const DriveFiles = require('../controllers/files-drive.js');
const ShareFiles = require('../controllers/files-share.js');
const FilesExt = require('../controllers/files-ext.js');

exports.init = function (app) {

  // 查询文件列表
  app.get('/drives/:driveId/files', DriveFiles.list);
  // 获取文件信息
  app.get('/drives/:driveId/files/:filePath', DriveFiles.get);
  // 创建文件或目录
  app.post('/drives/:driveId/files', DriveFiles.add)

  //复制文件
  app.post('/drives/:driveId/files/:filePath/copy', DriveFiles.copy);
  // 移动重命名
  app.post('/drives/:driveId/files/:filePath/move', DriveFiles.move);
  // 删除 文件
  app.delete('/drives/:driveId/files/:filePath', DriveFiles.del)

  // 上传
  app.post('/drives/:driveId/files/:filePath/sts_token', FilesExt.getStsToken)
  // 生成上传或下载链接
  app.post('/drives/:driveId/files/:filePath/signed_url', FilesExt.getSignedUrl)


  // complete
  app.post('/drives/:driveId/files/:filePath/complete', DriveFiles.complete)

  // complete
  app.post('/drive/complete_for_callback', DriveFiles.completeForCallback)

  /**************************/
  
  // 查询文件列表
  app.get('/shares/:shareId/files', ShareFiles.list);

  // 获取文件信息
  app.get('/shares/:shareId/files/:filePath', ShareFiles.get);
  // 创建文件或目录
  app.post('/shares/:shareId/files', ShareFiles.add)

  //复制文件
  app.post('/shares/:shareId/files/:filePath/copy', ShareFiles.copy);
  // 移动重命名
  app.post('/shares/:shareId/files/:filePath/move', ShareFiles.move);
  // 删除 文件
  app.delete('/shares/:shareId/files/:filePath', ShareFiles.del)

  // 上传
  app.post('/shares/:shareId/files/:filePath/sts_token', FilesExt.getStsToken)
  // 生成下载链接
  app.post('/shares/:shareId/files/:filePath/signed_url', FilesExt.getSignedUrl)


  // complete
  app.post('/shares/:shareId/files/:filePath/complete', ShareFiles.complete)

  // complete
  app.post('/share/complete_for_callback', ShareFiles.completeForCallback)

}
