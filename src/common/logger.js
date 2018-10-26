var log4js = require('log4js');
log4js.configure('log4js-config.json');
var logInfo = log4js.getLogger('logger');
var logError = log4js.getLogger('error');
log4js.info = logInfo.info.bind(logInfo);
log4js.error = logError.error.bind(logError);
/**
  * logger tag
  * @param {Object} req
  */
log4js.TAG = function(req) {
  'use strict';
  var timestamp = new Date().getTime();
  if (req) {
    var loginid = '';
    if (req.headers.loginid) {
      loginid = req.headers.loginid;
    }
    return req.hostname + req.baseUrl + req.path + '[' + loginid + '][' +
        timestamp + ']>>>';
  } else {
    return '[' + timestamp + ']>>>';
  }

};
module.exports = log4js;