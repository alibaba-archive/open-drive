# Users API


> 本文档描述 Users 相关 API。


## 1. 修改 User 信息

> 非只读管理员才能调用此接口

### (1) 请求
```
PUT /api/users/:userId
```

```json
{
  "description": "测试1",
  "status": "enabled"
}
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token | 
|userId|是| path |用户ID|
|description|否|body|描述|
|status|是|body| 状态: enabled, disabled |

### (2) 返回

> 200

```json
{
  "code": "OK",
  "message": "success"
}
```

## 2. 删除 User

> 非只读管理员才能调用此接口


### (1) 请求

```
DELETE /api/users/:userId
```


#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|userId|是| path |用户ID|


### (2) 返回

> 204


## 3. 获取 user 列表

> 管理员才能调用此接口


### (1) 请求
```
GET /api/users
```

#### 参数

|参数|必选|描述|
|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|marker|否|查询起始位置符|
|limit|否|制定返回结果的条数, 默认:100|

### (2) 返回

> 200

```json
{
  "items": [
    {
      "created_at": "2018-06-30T06:14:56.829Z",
      "description": "",
      "nick_name": "春长",
      "status": "enabled",
      "updated_at": "2018-06-30T06:14:56.829Z",
      "user_name": "$:LWCP_v1:$tkf9YONUeVmJxZSwZxesYg==",
      "user_type": "dingding",
      "user_id": "user-8vXEhLg142UiE",
      "avatar_url": "/users/user-8vXEhLg142UiE/avatar"
    }
  ],
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
|user_type|是|用户类型,如: dingding|
|user_name|是|用户名|
|nick_name|是|用户昵称|
|status|是|用户状态: enabled, disabled |
|avatar_url|是|用户头像 url |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 4. 查询 user 详情

> 管理员才能调用此接口


### (1) 请求
```
GET /api/users/:userId
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
  "description": "",
  "nick_name": "春长",
  "status": "enabled",
  "updated_at": "2018-06-30T06:14:56.829Z",
  "user_name": "$:LWCP_v1:$tkf9YONUeVmJxZSwZxesYg==",
  "user_type": "dingding",
  "user_id": "user-8vXEhLg142UiE",
  "avatar_url": "/users/user-8vXEhLg142UiE/avatar"
}
```

|字段名称|必选|描述|
|---|---|---|
|user_id|是|用户ID|
|user_type|是|用户类型,如: dingding|
|user_name|是|用户名|
|nick_name|是|用户昵称|
|status|是|用户状态: enabled, disabled |
|avatar_url|是|用户头像 url |
|description|否|描述 |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 5. 获取用户头像内容

> 公共接口，无需验证身份。

## (1) 请求

```
GET /api/users/:userId/avatar
```

#### 参数

|参数|必选|位置|描述|
|---|---|---|---|
|userId|是| path |用户ID|

### (2) 返回

> 200

> headers['Content-Type']='image/xxx'

```
image content buffer
```




## 6. 获取当前登录用户信息

> 已经登录的用户才能调用此接口

## (1) 请求

```
GET /api/userinfo
```

#### 参数


|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |

### (2) 返回

> 200


```json
{
  "created_at": "2018-06-30T06:14:56.829Z",
  "nick_name": "春长",
  "status": "enabled",
  "updated_at": "2018-06-30T06:14:56.829Z",
  "user_name": "$:LWCP_v1:$tkf9YONUeVmJxZSwZxesYg==",
  "user_type": "dingding",
  "user_id": "user-8vXEhLg142UiE",
  "avatar_url": "/users/user-8vXEhLg142UiE/avatar",
  "is_admin": true,
  "privilege": "grantable"
}
```

|字段名称|必选|描述|
|---|---|---|
|user_id|是|用户ID|
|user_type|是|用户类型,如: dingding|
|user_name|是|用户名|
|nick_name|是|用户昵称|
|status|是|用户状态: enabled, disabled |
|avatar_url|是|用户头像 url |
|description|否|描述 |
|is_admin|是| 是否是管理员 |
|privilege|是| 管理员权限, 如果不是管理员则没有此项。取值范围： readonly, writable, grantable |
|created_at|是| 创建时间 |
|updated_at|是| 最后修改时间 |


## 7. 修改当前登录用户的头像

> 已经登录的用户可以修改自己的头像

## (1) 请求

```
PUT /api/userinfo/avatar
```

#### 参数


|参数|必选|位置|描述|
|---|---|---|---|
| Authorization |是| headers | 'Bearer '+ access_token |
|avatar|是|body| base64 data URI|

### (2) 返回

> 200


```json
{
  "code": "OK",
  "message": "success"
}
```
