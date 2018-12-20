# Storages API


> 本文档描述 Storages 相关 API。


## 1. 创建 Storages 信息

> 非只读管理员才能调用此接口

### (1) 请求
```
POST /api/storages
```

```json
{
  "storage_name": "测试Storage",
  "description": "1023210024677934",
  "region": "cn-shanghai",
  "oss_bucket": "drive-test-data",
  "oss_key": "",
  "role_arn": "acs:ram::1023210024677934:role/ststest",
  "access_key_id": "LT******6G",
  "access_key_secret": "P7******Kk",
  "init_drive_on": true,
  "init_drive_name": "Default",
  "init_drive_size": "1073741824"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|storage_name|是| body |storage 名称|
|description|否|body|描述, 最多100个字符|
|region|是|body| 云服务region。 |
|oss_bucket|是|body| OSS Bucket |
|oss_key|是|body|需要配置为Storage的 OSS目录的Key|
|role_arn|是|body| 云账号角色, 有配置Storage的OSS目录的读写权限。请登录[RAM控制台](https://ram.console.aliyun.com)创建。 |
|sts_endpoint|否|body| 预留可选字段。STS服务的Endpoint, 默认：https://sts.aliyuncs.com |
|access_key_id|是|body| 子用户AK id，该子用户需要有assumeRole权限 |
|access_key_secret|是|body| 子用户AK secret |
|init_drive_on|否| body| 是否开启初始化云盘功能，开启后相关参数为必填。可选值:[true,false]。 |
|init_drive_size|否| body| 初始化云盘大小，单位Byte，如果为0则是不限制大小。 |
|init_drive_name|否| body|每个用户初始化云盘名称，最多20个字符。 |


### (2) 返回

> 201

```json
{
  "storage_id": "storage-xxxxx"
}
```

## 2. 删除 Storage

> 非只读管理员才能调用此接口

### (1) 请求

```
DELETE /api/storages/:storageId
```


#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|storageId|是| path |storage Id|


### (2) 返回

> 204


## 3. 获取 Storage 列表

> 管理员才能调用此接口

### (1) 请求
```
GET /api/storages
```

#### 参数

|参数|必选|描述|
|---|---|---|
|marker|否|查询起始位置符|
|limit|否|制定返回结果的条数|

### (2) 返回

> 200

```json
{
  "items": [
    {
      "access_key_id": "LT******6G",
      "access_key_secret": "P7******Kk",
      "account_id": "10******34",
      "created_at": "2018-06-25T01:58:24.074Z",
      "description": "1023210024677934",
      "creator": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "init_drive_name": "default",
      "init_drive_on": true,
      "init_drive_size": 1073741824,
      "oss_bucket": "drive-test-data",
      "oss_key": "",
      "region": "cn-shanghai",
      "role_arn": "acs:ram::1023210024677934:role/ststest",
      "storage_name": "tStorage",
      "sts_endpoint": "https://sts.aliyuncs.com",
      "updated_at": "2018-06-25T01:58:24.074Z",
      "storage_id": "storage-3ef230f3e89a4e8a9aefc54961612d1e",
      "root_drive_id": "drive-fef230f3e89b4e8a9aefc54967612d11"
    },
    {
      "access_key_id": "LT******6G",
      "access_key_secret": "P7******Kk",
      "account_id": "10******34",
      "created_at": "2018-06-25T06:06:49.780Z",
      "description": "1023210024677934",
      "init_drive_name": "Default",
      "init_drive_on": true,
      "creator": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "init_drive_size": 1073741824,
      "oss_bucket": "drive-test-data",
      "oss_key": "",
      "region": "cn-shanghai",
      "role_arn": "acs:ram::1023210024677934:role/ststest",
      "storage_name": "测试Storage",
      "sts_endpoint": "https://sts.aliyuncs.com",
      "updated_at": "2018-06-25T06:06:49.780Z",
      "storage_id": "storage-fd9c32423cad4af5ab20edaa8f9e6ccf",
      "root_drive_id": "drive-fef230f3e89b4e8a9aefc54967612d11"
    }
  ],
  "next_marker": null
}
```

|字段名称|必选|描述|
|---|---|---|
|items|是|item数组|
|next_marker|否| 下一页的起始位符 |

* item 项说明:

|字段名称|必选|描述|
|---|---|---|
|storage_id|是 |storage Id|
|description|否| 描述|
|oss_bucket|是| OSS Bucket |
|oss_key|是| 需要配置为Storage的 OSS目录的Key|
|region|是| region |
|account_id|是| 云账号AccountId |
|role_arn|是| 云账号角色, 有配置Storage的OSS目录的读写权限。 |
|sts_endpoint|是|STS Endpoint|
|access_key_id|是| 子用户AK id，该子用户需要有assumeRole权限 |
|access_key_secret|是| 子用户AK secret |
|creator|是| 创建者ID |
|init_drive_on|否| boolean类型, 是否开启初始化云盘功能，开启后相关参数为必填。 |
|init_drive_size|否| 初始化云盘大小，单位Byte，如果为0则是不限制大小。 |
|init_drive_name|否| 每个用户初始化云盘名称 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
|root_drive_id|是|Storage的根Drive ID，作为Storage的一个根目录，管理员可以进入此目录管理所有文件。|


## 4. 查询 storage 详情

> 管理员才能调用此接口

### (1) 请求
```
GET /api/storages/:storageId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|storageId|是| path |storage Id|


### (2) 返回

> 200

```json
{
  "access_key_id": "LT******6G",
  "access_key_secret": "P7******Kk",
  "account_id": "10******34",
  "created_at": "2018-06-25T06:06:49.780Z",
  "description": "1023210024677934",
  "init_drive_name": "Default",
  "init_drive_on": true,
  "init_drive_size": 1073741824,
  "creator": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "oss_bucket": "drive-test-data",
  "oss_key": "",
  "region": "cn-shanghai",
  "role_arn": "acs:ram::1023210024677934:role/ststest",
  "storage_name": "测试Storage",
  "sts_endpoint": "https://sts.aliyuncs.com",
  "updated_at": "2018-06-25T06:06:49.780Z",
  "storage_id": "storage-fd9c32423cad4af5ab20edaa8f9e6ccf",
  "root_drive_id": "drive-fef230f3e89b4e8a9aefc54967612d11"
}
```


|字段名称|必选|描述|
|---|---|---|
|storage_id|是 |storage Id|
|description|否| 描述|
|region |是| region |
|oss_bucket|是| OSS Bucket |
|oss_key|是| 需要配置为Storage的 OSS目录的Key|
|account_id|是| 云账号AccountId |
|role_arn|是| 云账号角色, 有配置Storage的OSS目录的读写权限。 |
|sts_endpoint|是|STS Endpoint|
|access_key_id|是| 子用户AK id，该子用户需要有assumeRole权限 |
|access_key_secret|是| 子用户AK secret |
|init_drive_on|否| boolean类型, 是否开启初始化云盘功能，开启后相关参数为必填。 |
|init_drive_size|否|  初始化云盘大小，单位Byte，如果为0则是不限制大小。 |
|init_drive_name|否| 每个用户初始化云盘名称 |
|creator|是| 创建者ID |
|created_at|是| 创建时间|
|updated_at|是| 最后修改时间|
|root_drive_id| 是 | Storage的根Drive ID，作为Storage的一个根目录，管理员可以进入此目录管理所有文件。|


## 4. 修改 Storages 信息

> 非只读管理员才能调用此接口


### (1) 请求
```
PUT /api/storages/:storageId
```

```json
{ 
  "description": "test",
  "role_arn": "acs:ram::1023210024677934:role/ststest",
  "access_key_id": "LT******6G",
  "access_key_secret": "P7******Kk",
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|storageId|是| path |storage Id|
|description|否|body|描述, 最多100个字符|
|role_arn|是|body| 云账号角色, 有配置Storage的OSS目录的读写权限。 |
|access_key_id|是|body| 子用户AK id，该子用户需要有assumeRole权限 |
|access_key_secret|是|body| 子用户AK secret |

### (2) 返回

> 200

```json
{
  "code": "OK",
  "message": "success"
}
```
