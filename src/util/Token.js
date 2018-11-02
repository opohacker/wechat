var logger = require('../common/logger');
var config = require('../../project-config');
var httpRequest = require('../common/http-request');
var co = require('co');
var token = {};//[{wx_appid:xxx,token:xxx,expires_time:xxx}];
var TAG = 'Token>>>';

var get = function() {
  var nowTime = new Date().getTime();
  logger.info(TAG, token);
  return new Promise(function(resolve, reject) {
    if (token.access_token && nowTime <= token.expires_time) {
      resolve(token);
    } else {
      var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.APP_ID + '&secret=' + config.APP_SECRET;
      co(function*() {
        'use strict';
        var result = yield httpRequest.getJson(url);
        logger.info(TAG, result);
        if (result.access_token) {
          token.access_token = result.access_token;
          token.expires_time = nowTime + result.expires_in * 1000;
          resolve(token);
        } else {
          reject({});
        }
      }).catch(function(e) {
        logger.info(TAG, e);
        reject({});
      });
    }
  });

};
var result = {
  get: get,
};

module.exports = result;
