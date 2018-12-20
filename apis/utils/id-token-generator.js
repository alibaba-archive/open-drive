const jwt = require('jsonwebtoken');  

module.exports = {
  gen,
  decode
}


function gen(obj, seconds){ 
  var token = jwt.sign(obj, global._rsa.privateKeyPEM, { keyid: global._rsa.keyId, expiresIn: seconds||60, algorithm: 'RS256' });
  return token;
}

function decode(token){ 
  return jwt.verify(token, global._rsa.publicKeyPEM, { 
    ignoreExpiration: false,
    ignoreNotBefore: false
  });
}
