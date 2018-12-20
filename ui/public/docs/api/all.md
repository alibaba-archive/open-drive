# API 概览

### [登录API](#/docs/api%2Fapi-auth)

|Method|URI|Description|
|----|----|----|
|GET|/api/authorize| 第三方登录跳转 |
|GET|/api/callback| 第三方登录后回调 |
|GET|/api/token| 获取 access_token |
|GET|/api/refresh_token| 延长 id_token 的有效期 |
|POST|/api/token| 客户端模式登录 |

### [User API](#/docs/api%2Fapi-users)

|Method|URI|Description|
|----|----|----|
|GET|/api/users/:userId/avatar| 获取用户头像内容 |
|GET|/api/userinfo| 获取当前登录用户信息 |
|PUT|/api/userinfo/avatar| 修改当前登录用户的头像 |

### [Clients API](#/docs/api%2Fapi-clients)

|Method|URI|Description|
|----|----|----|
|POST|/api/clients| 创建 Client |
|PUT|/api/clients| 修改 Client |
|DELETE|/api/clients/:clientId| 删除 Client |
|GET|/api/clients| 获取 Client 列表 |
|GET|/api/clients/:clientId| 查询 Client 详情 |


### [ Users API](#/docs/api%2Fapi-groupusers)

|Method|URI|Description|
|----|----|----|
|PUT|/api/users/:userId| 修改 User 信息 |
|DELETE|/api/users/:userId| 删除 User |
|GET|/api/users| 获取 user 列表 |
|GET|/api/users/:userId| 查询 user 详情 |
|GET|/api/users/:userId/avatar|获取用户头像内容|
|GET|/api/userinfo|获取当前登录用户信息|
|PUT|/api/userinfo/avatar|修改当前登录用户的头像|

### [User Drives API](#/docs/api%2Fapi-userdrives)

|Method|URI|Description|
|----|----|----|
|POST|/api/users/:userId/drives| 创建用户 Drive |
|DELETE|/api/users/:userId/drives/:driveId| 删除用户的 Drive |
|GET|/api/users/:userId/drives| 获取用户的 Drives 列表 |
|GET|/api/users/:userId/drives/:driveId| 查询用户的某个 Drive 详情 |

### [User Shares API](#/docs/api%2Fapi-usershares)

|Method|URI|Description|
|----|----|----|
|POST|/api/users/:userId/shares| 创建用户 Share |
|DELETE|/api/users/:userId/shares/:shareId| 删除用户的 Share |
|GET|/api/users/:userId/shares| 获取用户的 Shares 列表 |
|GET|/api/users/:userId/shares/:shareId| 查询用户的某个 Share 详情 |

### [Storages API](#/docs/api%2Fapi-storages)

|Method|URI|Description|
|----|----|----|
|PUT|/api/storages/:storageId| 创建或修改 Storages 信息 |
|DELETE|/api/storages/:storageId| 删除 Storage |
|GET|/api/storages| 获取 Storage 列表 |
|GET|/api/storages/:storageId| 查询 storage 详情 |

### [Drives API](#/docs/api%2Fapi-drives)

|Method|URI|Description|
|----|----|----|
|GET|/api/drives| 获取当前用户的 Drives 列表 |
|GET|/api/drives/:driveId| 查询当前用户的某个 drive 详情 |


### [Drive Files API](#/docs/api%2Fapi-drive-files)

|Method|URI|Description|
|----|----|----|
|POST|/api/drives/:driveId/files| 创建文件或目录 |
|GET|/api/drives/:driveId/files/:filePath/sts_token| 获取文件上传下载 sts token |
|POST|/api/drives/:driveId/files/:filePath/complete| 完成文件上传后complete |
|GET|/api/drives/:driveId/files| 获取文件列表 |
|GET|/api/drives/:driveId/files/:filePath| 查询文件详情 |
|POST|/api/drives/:driveId/files/:filePath/copy| 复制文件 |
|POST|/api/drives/:driveId/files/:filePath/move| 移动文件 |
|DELETE|/api/drives/:driveId/files/:filePath| 删除文件 |


### [Shares API](#/docs/api%2Fapi-shares)

|Method|URI|Description|
|----|----|----|
|GET|/api/shares| 获取当前用户的 Shares 列表 |
|GET|/api/shares/:shareId| 查询当前用户的某个 share 详情 |


### [Share Files API](#/docs/api%2Fapi-share-files)

|Method|URI|Description|
|----|----|----|
|POST|/api/shares/:shareId/files| 创建文件或目录 |
|GET|/api/shares/:shareId/files/:filePath/sts_token| 获取文件上传下载 sts token |
|POST|/api/shares/:shareId/files/:filePath/complete| 完成文件上传后complete |
|GET|/api/shares/:shareId/files| 获取文件列表 |
|GET|/api/shares/:shareId/files/:filePath| 查询文件详情 |
|POST|/api/shares/:shareId/files/:filePath/copy| 复制文件 |
|POST|/api/shares/:shareId/files/:filePath/move| 移动文件 |
|DELETE|/api/shares/:shareId/files/:filePath| 删除文件 |
