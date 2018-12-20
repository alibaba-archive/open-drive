
const crypto = require('crypto');
const ALGORITHM = 'aes192';
const KEY = 'kkoo22xx##8';

module.exports= {
  cipher: cipher,
  decipher: decipher
};

function cipher(buf, key, algorithm) {
  if(!buf instanceof Buffer){
    buf = new Buffer(buf);
  }
  var encrypted = "";
  var cip = crypto.createCipher(algorithm||ALGORITHM, key||KEY);
  encrypted += cip.update(buf, 'utf8', 'hex');
  encrypted += cip.final('hex');
  return encrypted;
};

function decipher(encrypted, key, algorithm) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm||ALGORITHM, key||KEY);
    decrypted += decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
