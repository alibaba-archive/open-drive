// 配置文件
module.exports = {
    
    //对称加密的秘钥，用来加密存储 access_key_secret, 可以配置任意字符串
    cipher_secret: 'my_secret',

    //允许调用API的客户端
    allow_clients: [{
        client_id: 'aliyun',
        //客户端模式登录时，需要secret，OAuth登录不需要
        secret: '',
        //redirect_uri 如果为空，不校验
        redirect_uri: ''
    }],

    //OTS 存储实例配置 (数据库配置)
    ots: {
        instance_name: 'opendrive',
        endpoint: 'https://opendrive.cn-hangzhou.ots.aliyuncs.com',
        // 需要配置一个子账号的AK，需要有配置的 OTS 实例的 Full权限
        access_key_id: '',
        access_key_secret: '',
    },

    //网页登录配置
    authorize: {
        //钉钉登录需要，需要到钉钉开放平台注册申请： https://open.dingtalk.com/
        dingding: {
            app_id: '',
            app_secret: ''
        },
        //支付宝登录需求，如果不需要可以不配置。
        alipay: {
            app_id: '',
            private_key: ''
        }
    }
    
}
