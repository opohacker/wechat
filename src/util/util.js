var crypto = require('crypto');

var checkSignature = function(token, timestamp, nonce, signature) {
  var array = [token, timestamp, nonce];
  array.sort();
  var arrayString = array.join('');
  var hashCode = crypto.createHash('sha1');
  var resultCode = hashCode.update(arrayString, 'utf8').digest('hex');
  console.log(resultCode);
  if (resultCode === signature) {
    return true;
  } else {
    return false;
  }
};

var generateJSSDKSignature = function(noncestr, jsapi_ticket, timestamp, url) {
  // var array = [noncestr, jsapi_ticket, timestamp, url];
  // array.sort();
  // console.log(array)
  // for (var i = 0; i < array.length; i++) {
  //   if (array[i] === noncestr) {
  //     array[i] = 'noncestr=' + array[i];
  //   } else if (array[i] === jsapi_ticket) {
  //     array[i] = 'jsapi_ticket=' + array[i];
  //   } else if (array[i] === timestamp) {
  //     array[i] = 'timestamp=' + array[i];
  //   } else if (array[i] === url) {
  //     array[i] = 'url=' + array[i];
  //   }
  // }
  // var arrayString = array.join('&');
  var arrayString = 'jsapi_ticket='+jsapi_ticket+'&noncestr='+noncestr+'&timestamp='+timestamp+'&url='+decodeURIComponent(url);
  console.log(arrayString)
  var hashCode = crypto.createHash('sha1');
  var resultCode = hashCode.update(arrayString, 'utf8').digest('hex');
  return resultCode;
};

var randomString = function(len) {
  len = len || 32;
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var maxPos = chars.length;
  var pwd = '';
  for (var i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

var util = {
  checkSignature: checkSignature,
  randomString:randomString,
  generateJSSDKSignature:generateJSSDKSignature
};

module.exports = util;