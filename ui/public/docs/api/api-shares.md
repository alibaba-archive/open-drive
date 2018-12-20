# Shares API


> 本文档描述 Shares 相关 API。


## 1. 获取当前用户的 Shares 列表

> 登录用户可以调用此接口

### (1) 请求
```
GET /api/shares
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|marker|否| query |查询起始位置符|
|limit|否| query| 制定返回结果的条数|

### (2) 返回

> 200

```json
{
  "items": [{
    "share_id": "share-3035120e-f339-4dc9-a7df-bac74845c195",
    "share_name": "xxxxxx",
    "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
    "updated_at": "2018-05-18T08:43:34.738Z",
    "description": "",
    "privilege": "readonly",
    "drive_id": "drive-bf810543-99ed-43ca-8534-b73f477ae6c2",
    "created_at": "2018-05-18T08:43:34.738Z",
    "expires_time": "Never"
  }]
}
```

|字段名称|必选|描述|
|---|---|---|
|items|是|item数组|
|next_marker|否| 下一页的起始位符 |

* item 项说明:

|字段名称|必选|描述|
|---|---|---|
|grant_to|是|被共享用户的ID|
|drive_id|是| 对应driveId |
|share_id|是| shareId |
|share_name|是| share名称 |
|privilege|是|权限: readonly, writable |
|description|否|描述 |
|expires_time|是|过期时间，or "Never"|
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 2. 查询当前用户的某个 share 详情

> 登录用户可以调用此接口

### (1) 请求
```
GET /api/shares/:shareId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|shareId|是| path |share ID|


### (2) 返回

> 200

```json
{
  "share_id": "share-3035120e-f339-4dc9-a7df-bac74845c195",
  "share_name": "xxxxxx",
  "grant_to": "user-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "updated_at": "2018-05-18T08:43:34.738Z",
  "description": "",
  "privilege": "readonly",
  "drive_id": "drive-bf810543-99ed-43ca-8534-b73f477ae6c2",
  "created_at": "2018-05-18T08:43:34.738Z",
  "expires_time": "Never"
}
```

|字段名称|必选|描述|
|---|---|---|
|grant_to|是|被共享用户的ID|
|drive_id|是| 对应driveId |
|share_id|是| shareId |
|share_name|是| share名称 |
|privilege|是|权限: readonly, writable |
|description|否|描述 |
|expires_time|是|过期时间，or "Never"|
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
