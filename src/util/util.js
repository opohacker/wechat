var crypto = require('crypto');

var checkSignature=function(token,timestamp,nonce,signature) {
  var array=[token,timestamp,nonce];
  array.sort();
  var arrayString=array.join('');
  var hashCode = crypto.createHash('sha1');
  var resultCode = hashCode.update(arrayString,'utf8').digest('hex');
  console.log(resultCode);
  if(resultCode===signature){
    return true;
  }else{
    return false;
  }
}

var util = {
  checkSignature: checkSignature,
};

module.exports = util;