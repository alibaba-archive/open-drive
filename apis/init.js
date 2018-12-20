const jwk = require('node-jose').JWK
const fs = require('fs')
const path = require('path')
 
const TableStore = require('tablestore')
const jwkToPem = require('jwk-to-pem');

var rsa_path = global._rsa_path || path.join(process.cwd(), 'rsa-key.js');

module.exports = {
    init
}


async function init() {
    
    //初始化OTS表
    await init_ots_tables()

    //生成rsa key
    await gen_rsa_key()

}

async function gen_rsa_key() {
    var kp = process.env['KEY_PAIR']
    if(kp){
        var rsa_info = JSON.parse(kp)
        rsa_info.publicKeyPEM = jwkToPem(JSON.parse(rsa_info.publicKeyText)) 
        rsa_info.privateKeyPEM = jwkToPem(JSON.parse(rsa_info.privateKeyText), {private:true}) 
        global._rsa = rsa_info;
        global._cfg.rsa= rsa_info;
        return;
    }

    if (!fs.existsSync(rsa_path)){
        var key = await jwk.createKeyStore().generate('RSA', 2048);
        var publicKey = key.toJSON();
        var privateKey = key.toJSON(true);
        var keyId = publicKey.kid;
    
        console.log('...generating rsa-key.js...');
    
        fs.writeFileSync(rsa_path, '//自动生成的配置,勿删 \nmodule.exports = ' + JSON.stringify({
            "keyId": keyId,
            "publicKeyText": JSON.stringify(publicKey),
            "privateKeyText": JSON.stringify(privateKey)
        }, ' ', 2));     
    }

    console.log('load rsa keys:'+ rsa_path)
    var rsa_info = require(rsa_path)
    rsa_info.publicKeyPEM = jwkToPem(JSON.parse(rsa_info.publicKeyText)) 
    rsa_info.privateKeyPEM = jwkToPem(JSON.parse(rsa_info.privateKeyText), {private:true}) 
    global._rsa = rsa_info;
    global._cfg.rsa= rsa_info;

    
}

async function init_ots_tables() {
    var conf = require('./conf').getConfig();

    var client = new TableStore.Client({
        accessKeyId: conf.ots.access_key_id,
        secretAccessKey: conf.ots.access_key_secret,
        endpoint: conf.ots.endpoint,
        instancename: conf.ots.instance_name
    });

    var arr = require(path.join(__dirname, '..', 'conf', 'ots-table-meta'))
    for(var n of arr) await createOtsTableIfNotExists(client, n)

}



async function createOtsTableIfNotExists(client, {tableName, primaryKey}) {
    try {
        await client.describeTable({
            tableName
        })
        console.log(`${tableName} already exists`)
    } catch (e) {
        if (e.code == 404) {
            console.log(e.message, ', create table: ${tableName}...')
            //OTSObjectNotExistRequested

            await client.createTable({
                tableMeta: {
                    tableName,
                    primaryKey 
                },
                reservedThroughput: {
                    capacityUnit: {
                        read: 0,
                        write: 0
                    }
                },
                tableOptions: {
                    timeToLive: -1,// 数据的过期时间, 单位秒, -1代表永不过期. 假如设置过期时间为一年, 即为 365 * 24 * 3600.
                    maxVersions: 1// 保存的最大版本数, 设置为1即代表每列上最多保存一个版本(保存最新的版本).
                },
                streamSpecification: {
                    enableStream: true, //开启Stream
                    expirationTime: 24 //Stream的过期时间，单位是小时，最长为168，设置完以后不能修改
                }

            });

            console.log(`${tableName} created!`)
        }
        else{
            console.log(e)
            process.exit(-1)
        }
    }
}


