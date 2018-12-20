# User Shares API


> 本文档描述 User Shares 相关 API。


## 1. 创建用户 Share

> 需要非只读管理员权限才能调用此接口

### (1) 请求
```
POST /api/users/:userId/shares
```

```json
{
  "description": "a",
  "share_name": "share-test",
  "drive_id": "drive-6408a532-6d8c-49c0-9421-4bca547751bc",
  "source_path": "/",
  "privilege": "readonly",
  "expires_time": "Never"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被共享的用户ID|
|share_name|是|body|share名称,最大255字符|
|description|否|body|描述,最大255字符|
|drive_id|是|body|关联的drive ID|
|privilege|是|body| 权限: readonly, writable |
|expires_time|是|body|过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z，Never代表永不过期 |
|source_path|是|body| drive中的路径 |

### (2) 返回

> 200

```json
{
    "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
    "share_id": "share-459a07b0-7d86-452e-ade7-53522c195678"
}
```

## 2. 删除用户的 Share

> 需要非只读管理员权限才能调用此接口

### (1) 请求

```
DELETE /api/users/:userId/shares/:shareId
```


#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被共享的用户ID|
|shareId|是| path |share ID|



### (2) 返回

> 204



## 3. 获取用户的 Shares 列表

> 需要管理员权限才能调用此接口

### (1) 请求
```
GET /api/users/:userId/shares
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|userId|是| path |被共享的用户ID|
|marker|否|path |查询起始位置符|
|limit|否|path |制定返回结果的条数|

### (2) 返回

> 200

```json
{
  "items": [
    {
      "created_at": "2018-06-30T06:14:56.829Z",
      "creator": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "description": "",
      "drive_id": "drive-6408a532-6d8c-49c0-9421-4bca547751bc",
      "expires_time": "Never",
      "privilege": "writable",
      "share_name": "bky-test",
      "source_path": "/bky-test/",
      "storage_source_path": "/drive/bky-test/",
      "updated_at": "2018-06-30T06:14:56.829Z",
      "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "share_id": "share-a3845096-e4b7-4c20-8d61-0d8359def91e"
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
|grant_to|是|被授权的用户ID|
|creator|是|创建者用户ID|
|storage_source_path|是|share在storage中的绝对路径|
|source_path|是| 对应Drive在storage中的路径 |
|drive_id|是| 对应driveId |
|share_id|是| share ID|
|share_name|是| share名称 |
|privilege|是|权限: readonly, writable |
|description|否|描述 |
|expires_time|是|过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z，"Never"表示永不过期|
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 4. 查询用户的某个 Share 详情

> 需要管理员权限才能调用此接口

### (1) 请求
```
GET /api/users/:userId/shares/:shareId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被共享的用户ID|
|shareId|是| path |Share ID|


### (2) 返回

> 200

```json
{
    "created_at": "2018-06-30T06:14:56.829Z",
    "creator": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
    "description": "",
    "drive_id": "drive-6408a532-6d8c-49c0-9421-4bca547751bc",
    "expires_time": "Never",
    "privilege": "writable",
    "share_name": "bky-test",
    "source_path": "/bky-test/",
    "storage_source_path": "/storage1/bky-test/",
    "updated_at": "2018-06-30T06:14:56.829Z",
    "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
    "share_id": "share-a3845096-e4b7-4c20-8d61-0d8359def91e"
}
```

|字段名称|必选|描述|
|---|---|---|
|grant_to|是|被授权的用户ID|
|creator|是|创建者用户ID|
|storage_source_path|是|share在storage中的绝对路径|
|source_path|是| 对应Drive在storage中的路径 |
|drive_id|是| 对应driveId |
|share_id|是| share ID|
|share_name|是| share名称 |
|privilege|是|权限: readonly, writable |
|description|否|描述 |
|expires_time|是|过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z，"Never"表示永不过期|
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |



## 5. 修改用户 Share

> 需要非只读管理员权限才能调用此接口

### (1) 请求
```
PUT /api/users/:userId/shares
```

```json
{
  "description": "a",
  "share_name": "drive-test",
  "expires_time": "Never",
  "privilege": "readonly"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |被共享的用户ID|
|share_name|是|body|share名称,最大255字符|
|description|否|body|描述,最大255字符|
|privilege|是|body| 权限: readonly, writable |
|expires_time|是|body|过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z，Never代表永不过期 |

### (2) 返回

> 200

```json
{
  "code": "OK",
  "message": "success"
}
```



## 6. 创建用户 Share key

> 通过此方法，得到一个key，再通过key，创建 share。适用于link分享的场景。登录用户可以调用。


### (1) 请求
```
POST /api/share_keys
```

```json
{
  "type" : "all",
  "description": "a",
  "share_name": "share-test",
  "drive_id": "drive-6408a532-6d8c-49c0-9421-4bca547751bc",
  "source_path": "/",
  "privilege": "readonly",
  "expires_time": "Never",
  "key_expires_time": "2018-06-30T06:14:56.829Z"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|type|是|body|type, 取值范围:[all\|one\|public]|
|share_name|是|body|share名称,最大255字符|
|description|否|body|描述,最大100字符|
|drive_id|是|body|关联的drive ID|
|privilege|是|body| 权限: readonly, writable |
|expires_time|是|body|过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z，Never代表永不过期 |
|key_expires_time|是|body|key的过期时间，所有时间格式，均为 ISOString 格式, 如: 2018-06-30T06:14:56.829Z |
|source_path|是|body| drive中的路径 |

### (2) 返回

> 200

```json
{
  "key": "J2xj8Hzvg5w********QrDiPhQiEiE"
}
```



## 7. 通过 key 创建 Share

> 适用于link分享的场景。


### (1) 请求
```
POST /api/shares
```

```json
{
  "key": "J2xj8Hzvg5w********QrDiPhQiEiE"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|key|是|body| 通过 share_keys 得到的 key|

### (2) 返回

> 200

```json
{
  "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "share_id": "share-459a07b0-7d86-452e-ade7-53522c195678"
}
```
