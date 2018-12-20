# User Drives API


> 本文档描述 User Drives 相关 API。


## 1. 创建用户 Drive

> 需要非只读管理员权限才能调用此接口

### (1) 请求
```
POST /api/users/:userId/drives
```

```json
{
  "description": "a",
  "drive_name": "drive-test",
  "storage_id": "storage-****",
  "total_size": 0
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被授权的用户ID|
|drive_name|否|body|drive名称, 最多255字符|
|description|否|body|描述, 最多255字符|
|status|否|body|状态，默认enabled，取值范围：enabled，disabled|
|storage_id|是|body| 对应storage的名称 |
|total_size|是|body| Drive的总容量，单位Byte， 0代表不限制容量 |

### (2) 返回

> 200

```json
{
  "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "drive_id": "drive-459a07b0-7d86-452e-ade7-53522c195678"
}
```

## 2. 删除用户的 Drive

> 需要非只读管理员权限才能调用此接口

### (1) 请求

```
DELETE /api/users/:userId/drives/:driveId
```


#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被授权的用户ID|
|driveId|是| path |drive ID|



### (2) 返回

> 204



## 3. 获取用户的 Drives 列表

> 需要管理员权限才能调用此接口

### (1) 请求
```
GET /api/users/:userId/drives
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被授权的用户ID|
|marker|否|path |查询起始位置符|
|limit|否|path |制定返回结果的条数|

### (2) 返回

> 200

```json
{
  "items": [
    {
      "created_at": "2018-06-30T06:14:56.829Z",
      "creator": "user-tp9xxxxxxxxQiEiE",
      "description": "",
      "drive_name": "asd1111111",
      "source_path": "/asd/",
      "storage_id": "storage1",
      "storage_source_path": "/storage1/asd/",
      "status": "enabled",
      "total_size": 0,
      "updated_at": "2018-06-30T06:14:56.829Z",
      "used_size": 0,
      "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "drive_id": "drive-2b51eab0-c46b-407d-a0e8-9b6dfb01cd47"
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
|grant_to|是|用户ID|
|creator|是|创建者用户ID|
|storage_source_path|是|当前drive在storage中的绝对路径|
|storage_id|是|对应storage的名称|
|source_path|是| 对应source中的路径 |
|status|是| 状态: enabled, disabled |
|drive_id|是| driveId |
|drive_name|是| drive名称 |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
|total_size|是| drive的总容量，0表示不限制大小 |
|used_size|是| drive的已使用容量 |
|status|否|状态，取值范围：enabled，disabled|


## 4. 查询用户的某个 Drive 详情

> 需要管理员权限才能调用此接口

### (1) 请求
```
GET /api/users/:userId/drives/:driveId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被授权的用户ID|
|driveId|是| path |Drive ID|


### (2) 返回

> 200

```json
{
  "created_at": "2018-06-30T06:14:56.829Z",
  "creator": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "description": "",
  "drive_name": "asd1111111",
  "source_path": "/asd/",
  "storage_id": "storage1",
  "storage_source_path": "/storage1/asd/",
  "status": "enabled",
  "total_size": 0,
  "updated_at": "2018-06-30T06:14:56.829Z",
  "used_size": 0,
  "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "drive_id": "drive-2b51eab0-c46b-407d-a0e8-9b6dfb01cd47"
}
```

|字段名称|必选|描述|
|---|---|---|
|字段名称|必选|描述|
|---|---|---|
|grant_to|是|用户ID|
|creator|是|创建者用户ID|
|storage_source_path|是|当前drive在storage中的绝对路径|
|storage_id|是|对应storage的名称|
|source_path|是| 对应source中的路径 |
|drive_id|是| driveId |
|drive_name|否|drive名称|
|description|否|描述|
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
|total_size|是| drive的总容量，0表示不限制大小 |
|used_size|是| drive的已使用容量 |
|status|否|状态，取值范围：enabled，disabled|


## 5. 修改用户 Drive

> 需要非只读管理员权限才能调用此接口

### (1) 请求
```
PUT /api/users/:userId/drives
```

```json
{
  "description": "a",
  "drive_name": "drive-test",
  "total_size": 0
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |创建Drive的用户ID|
|drive_name|否|body|drive名称, 最多255字符|
|description|否|body|描述, 最多100字符|
|total_size|否|body| Drive的总容量，单位Byte， 0代表不限制容量 |
|status|否|body|状态，取值范围：enabled，disabled|
### (2) 返回

> 200

```json
{
  "code": "OK",
  "message": "success"
}
```
