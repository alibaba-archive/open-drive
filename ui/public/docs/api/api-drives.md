# Drives API


> 本文档描述 Drives 相关 API。


## 1. 获取当前用户的 Drives 列表

> 登录用户可以调用此接口

### (1) 请求
```
GET /api/drives
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
  "items": [
    {
      "created_at": "2018-06-25T02:23:35.175Z",
      "description": "init",
      "drive_name": "default",
      "storage_id": "storage-3ef230f3e89a4e8a9aefc54961612d1e",
      "total_size": 1073741824,
      "updated_at": "2018-06-25T02:23:35.175Z",
      "used_size": 0,
      "grant_to": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "drive_id": "drive-2144b69ce32642d0a067d059b69b4f97"
    },
    {
      "created_at": "2018-06-25T01:58:32.689Z",
      "description": "tStorage",
      "drive_name": "tStorage",
      "storage_id": "storage-3ef230f3e89a4e8a9aefc54961612d1e",
      "total_size": 0,
      "updated_at": "2018-06-25T01:58:32.689Z",
      "used_size": 1655952,
      "grant_to": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
      "drive_id": "drive-ea3e8c2818cc4ef18d2298e822e4913c"
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
|drive_id|是| driveId |
|drive_name|是| drive名称 |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
|storage_id|是|对应storageId|
|total_size|是|Drive的总容量，0表示不限制容量|
|used_size|是|Drive的已使用容量|


## 2. 查询当前用户的某个 drive 详情

> 登录用户可以调用此接口

### (1) 请求
```
GET /api/drives/:driveId
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|driveId|是| path |drive ID|


### (2) 返回

> 200

```json
{
  "created_at": "2018-06-25T01:58:32.689Z",
  "description": "tStorage",
  "drive_name": "tStorage",
  "storage_id": "storage-3ef230f3e89a4e8a9aefc54961612d1e",
  "total_size": 0,
  "updated_at": "2018-06-25T01:58:32.689Z",
  "used_size": 1655952,
  "grant_to": "user-ding-tp9QxJ2xj8Hzvg5wQrDiPhQiEiE",
  "drive_id": "drive-ea3e8c2818cc4ef18d2298e822e4913c"
}
```

|字段名称|必选|描述|
|---|---|---|
|grant_to|是|用户ID|
|drive_id|是| driveId |
|drive_name|是| drive名称 |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |
|storage_id|是|对应storageId|
|total_size|是|Drive的总容量，0表示不限制容量|
|used_size|是|Drive的已使用容量|
