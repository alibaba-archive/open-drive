# 快速部署

## 1. 安装

安装 node.js 和 npm。

然后利用 npm 安装：

```
npm i -g @alicloud/open-drive
```

安装完成后，可以使用以下命令检查是否安装正确:

```
opendrive -h
```

如果能看到帮助信息，表示安装成功。

## 2. 准备配置文件

vim ./config.js

内容如下：
```js
// 配置文件
module.exports = {

    //对称加密的秘钥，用来加密存储 access_key_secret
    cipher_secret: 'my_secret',

    //允许调用API的客户端
    allow_clients: [{
        client_id: 'aliyun',
        //客户端模式登录时，需要secret，OAuth登录不需要
        secret: 'abcdef',
        //redirect_uri 如果为空，不校验
        redirect_uri: ''
    }],

    //OTS 存储实例配置 (数据库配置)
    ots: {
        instance_name: "{your_instance_name}",
        endpoint: "https://{your_instance_name}.cn-hangzhou.ots.aliyuncs.com",
        // 需要配置一个子账号的AK，需要有配置的 OTS 实例的 Full权限
        access_key_id: '{your_access_key_id}',
        access_key_secret: '{your_access_key_secret}',
    },

    //网页登录配置
    authorize: {
        //钉钉登录需要，需要到钉钉开放平台注册申请： https://open.dingtalk.com/
        dingding: {
            app_id: '{your_app_id}',
            app_secret: '{your_app_secret}'
        },
        //支付宝登录需求，如果不需要可以不配置。
        alipay: {
            app_id: '',
            private_key: ''
        }
    }

}
```

## 3. 启动服务

```
opendrive -c ./config.js
```
然后浏览器打开: http://localhost:3000 


后续如需修改端口等信息, 请看帮助:`opendrive -h`