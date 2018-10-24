var express = require('express');
var bodyParser = require('body-parser');
var logger = require('../../common/logger');
var httpRequest = require('../../common/http-request');
var token = require('../util/Token');
var co = require('co');
var xml2js = require('xml2js');
var app = module.exports = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/callback', function(req, res) {
  var params = req.query;
  console.log('API TEST!');
  console.log(params);
  // res.json(data.echostr)
  res.send(params.echostr);
});

app.post('/callback', function(req, res) {
  var buf = '';//添加接收变量
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    buf += chunk;
  });
  req.on('end', function() {
    var parseString = xml2js.parseString;
    parseString(buf, function(err, json) {
      if (err) {
        err.status = 400;
        res.send('400');
      } else {
        req.body = json;
        console.log(req.body);
        res.send('');
      }
    });
  });
});

app.get('/getAccessToken', function(req, res) {
  var TAG = logger.TAG(req);
  co(function*() {
    'use strict';
    var result = yield token.get();
    console.log(result);
    res.send(result);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
});

app.get('/createMenu', function(req, res) {
  var TAG = logger.TAG(req);
  co(function*() {
    'use strict';
    var savedToken = yield token.get();
    logger.info(TAG, savedToken);
    var url = ' https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' +
        savedToken.access_token;
    var params = {
      'button': [
        {
          'type': 'click',
          'name': '今日歌曲',
          'key': 'V1001_TODAY_MUSIC',
        },
        {
          'name': '菜单',
          'sub_button': [
            {
              'type': 'view',
              'name': '搜索',
              'url': 'http://www.soso.com/',
            },
            // {
            //   "type":"miniprogram",
            //   "name":"wxa",
            //   "url":"http://mp.weixin.qq.com",
            //   "appid":"wxa51f7006741786ca",
            //   "pagepath":"pages/lunar/index"
            // },
            {
              'type': 'click',
              'name': '赞一下我们',
              'key': 'V1001_GOOD',
            }],
        }],
    };
    var result = yield httpRequest.postJson(url, params);
    res.send(result);
    logger.info(TAG, result);
  }).catch(function(e) {
    logger.info(TAG, e);
    res.send(e);
  });
});

app.get('/deleteMenu', function(req, res) {
  var TAG = logger.TAG(req);
  co(function*() {
    'use strict';
    var tokenObj = yield token.get();
    var url = 'https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=' +
        tokenObj.access_token;
    var result = yield httpRequest.getJson(url);
    res.send(result);
    logger.info(TAG, result);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
});
