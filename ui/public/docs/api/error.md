## 接口返回错误说明

所有返回（Response）都有requestId，通过消息头的`X-Ca-Request-Id`字段返回。


<!-- ### (1) API报错

如果使用了阿里云的API网关，API请求只到达网关就报错， 错误信息通过消息头 `X-Ca-Error-Message` 字段返回 。

请看： [API网关错误信息](https://help.aliyun.com/document_detail/43800.html)。 -->

### (1) 服务端报错

<!-- 程序通过了API网关，到达服务端，服务端校验报错。 -->

* 错误返回格式：

```json
{
  "code": "InvalidParameter",
  "message": "group_id is required"
}
```
* 字段解释

|字段名|描述|
|---|---|---|
|code|错误类型|
|message|错误描述|


* 错误列表：

| 错误               | HTTP状态码| 描述         |
| ---               | ---     | ---          |
| Internal          | 500     | 系统内部错误   |
| NotFound          | 404     | 未找到对象    |
| InvalidParameter  | 400     | 无效参数      |
| UnAuthorized      | 401     | 未鉴权        |
| NoPermission      | 403     | 没有访问权限   |
| AlreadyExists     | 409     | 对象已存在     |
| ThirdPartError    | 405     | 第三方错误     |
| NoAllowMethod     | 405     | 不允许调用的接口|
| ExceedQuota       | 403     | 超出配额       |
| NotEnoughSpace    | 403     | 可用空间不足    |
| NotEmpty          | 409     | 目录不为空     |
