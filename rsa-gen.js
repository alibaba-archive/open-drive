//手动创建 rsa key， 运行 node rsa-gen 即可
const jwk = require('node-jose').JWK

jwk.createKeyStore().generate('RSA', 2048).
    then(function (key) {
        var publicKey = key.toJSON();
        var privateKey = key.toJSON(true);
        var keyId = publicKey.kid;

        console.log(JSON.stringify({
            "keyId": keyId,
            "publicKeyText": JSON.stringify(publicKey),
            "privateKeyText": JSON.stringify(privateKey)
        }, ' ', 2));
    });
