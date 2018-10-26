var request = require('request');
var logger = require('./logger');
var getJson = function(url, callback) {
  var opts = {
    method: 'GET',
    url: url,
    json: true,
  };
  return Promise.resolve({
    then: function(onFulfill, onReject) {
      request(opts, function(error, ret, body) {
        if (error) {
          logger.error(url, error);
          onFulfill(error);
        }
        if (body) {
          onFulfill(body);
          logger.info(url, body);
        }
      });
    },
  }).then(function(ret) {
    if (callback) {
      callback(ret);
    }
    return ret;
  }, function(err) {
    if (callback) {
      callback({});
    }
    return {};
  });

};
var postJson = function(url, body, callback) {
  var opts = {
    method: 'POST',
    url: url,
    json: true,
    body: body,
  };
  return Promise.resolve({
    then: function(onFulfill, onReject) {
      request(opts, function(error, ret, body) {
        if (error) {
          onFulfill(error);
          logger.error(url, error);
        }
        if (body) {
          onFulfill(body);
          logger.info(url, body);
        }
      });
    },
  }).then(function(ret) {
    if (callback) {
      callback(ret);
    }
    return ret;
  }, function(err) {
    if (callback) {
      callback({});
    }
    return {};
  });
};

module.exports = {
  getJson: getJson,
  postJson: postJson,
};
