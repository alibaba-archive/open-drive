# Admins API


> 本文档描述 Admins 相关 API。


## 1. 修改 Admin 信息

> 超级管理员才能调用此接口

### (1) 请求
```
PUT /api/admins/:userId
```

```json
{
  "description": "管理员1",
  "privilege": "writable"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |用户ID|
|description|否|body|描述|
|privilege|是|body| 权限: readonly, writable, grantable |

### (2) 返回

> 200

```json
{
  "code": "OK",
  "message": "success"
}
```

## 2. 删除 Admin

> 超级管理员才能调用此接口

### (1) 请求

```
DELETE /api/admins/:userId
```


#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |用户ID|


### (2) 返回

> 204


## 3. 获取 Admins 列表

> 管理员才能调用此接口

### (1) 请求
```
GET /api/admins
```

#### 参数

|参数|必选|描述|
|---|---|---|
|privilege|否|权限: readonly, writable, grantable   |
|marker|否|查询起始位置符|
|limit|否|制定返回结果的条数|

### (2) 返回

> 200

```json
{
  "items": [{
    "created_at": "2018-06-30T06:14:56.829Z",
    "description": "test",
    "privilege": "grantable",
    "updated_at": "2018-06-30T06:14:56.829Z",
    "user_id": "user-7wLunEU2iPXIotUVys4wT1wiEiE"
  }],
  "next_marker": ""
}
```

|字段名称|必选|描述|
|---|---|---|
|items|是|item数组|
|next_marker|否| 下一页的起始位符 |

* item 项说明:

|字段名称|必选|描述|
|---|---|---|
|user_id|是|用户ID|
|privilege|是|权限: readonly, writable, grantable |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 4. 查询 Admin 详情

> 管理员才能调用此接口

### (1) 请求
```
GET /api/admins/:userId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |用户ID|


### (2) 返回

> 200

```json
{
  "created_at": "2018-06-30T06:14:56.829Z",
  "description": "test",
  "privilege": "grantable",
  "updated_at": "2018-06-30T06:14:56.829Z",
  "user_id": "user-7wLunEU2iPXIotUVys4wT1wiEiE"
}
```

|字段名称|必选|描述|
|---|---|---| 
|user_id|是|用户ID|
|privilege|是|权限: readonly, writable, grantable |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
