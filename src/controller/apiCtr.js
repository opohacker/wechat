var express = require('express');
var bodyParser = require('body-parser');
var logger = require('../common/logger');
var httpRequest = require('../common/http-request');
var co = require('co');
var xml2js = require('xml2js');
var token = require('../util/Token');
var util = require('../util/util');
var config = require('../common/config');
var msg = require('../util/msg');
var app = module.exports = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/**
 * 微信接入验证
 * @param {Request} req Request 对象
 * @param {Response} res Response 对象
 */
// app.get('/callback', function(req, res) {
//   var params = req.query;
//   console.log(params);
//   res.send(params.echostr);
// });

app.get('/callback', function(req, res) {
  var params = req.query;
  var token=config.TOKEN;
  console.log(params);
  if(util.checkSignature(token,params.timestamp,params.nonce,params.signature)){
    res.send(params.echostr);
  }else {
    res.send('');
  }
});

// app.post('/callback', function(req, res) {
//   var buf = '';//添加接收变量
//   req.setEncoding('utf8');
//   req.on('data', function(chunk) {
//     buf += chunk;
//   });
//   req.on('end', function() {
//     var parseString = xml2js.parseString;
//     parseString(buf, function(err, json) {
//       if (err) {
//         err.status = 400;
//         res.send('400');
//       } else {
//         req.body = json;
//         console.log(req.body);
//         res.send('');
//       }
//     });
//   });
// });

app.post('/callback', function(req, res) {
  handleMsg(req,res)
});


var handleMsg = function(req,res){
  var buffer = [],that = this;

  //监听 data 事件 用于接收数据
  req.on('data',function(data){
    buffer.push(data);
  });
  //监听 end 事件 用于处理接收完成的数据
  req.on('end',function(){
    var msgXml = Buffer.concat(buffer).toString('utf-8');
    //解析xml
    xml2js.parseString(msgXml,{explicitArray : false},function(err,result){
      if(!err){
        result = result.xml;
        var toUser = result.ToUserName; //接收方微信
        var fromUser = result.FromUserName;//发送仿微信
        var reportMsg = ""; //声明回复消息的变量

        //判断消息类型
        if(result.MsgType.toLowerCase() === "event"){
          //判断事件类型
          switch(result.Event.toLowerCase()){
            case 'subscribe':
              //回复消息
              var content = "欢迎关注 科达园区-公众号开发分享，回复以下数字获得相关资讯：\n";
              content += "1.你是谁\n";
              content += "2.关于Node.js\n";
              content += "回复 “文章”  可以得到图文推送哦~\n";
              reportMsg = msg.txtMsg(fromUser,toUser,content);
              break;
            case 'click':
              var contentArr = [
                {Title:"Node.js 微信自定义菜单",Description:"使用Node.js实现自定义微信菜单",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72868520"},
                {Title:"Node.js access_token的获取、存储及更新",Description:"Node.js access_token的获取、存储及更新",PicUrl:"http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72783631"},
                {Title:"Node.js 接入微信公众平台开发",Description:"Node.js 接入微信公众平台开发",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72765279"}
              ];
              //回复图文消息
              reportMsg = msg.graphicMsg(fromUser,toUser,contentArr);
              break;
          }
        }else{
          //判断消息类型为 文本消息
          if(result.MsgType.toLowerCase() === "text"){
            //根据消息内容返回消息信息
            switch(result.Content){
              case '1':
                reportMsg = msg.txtMsg(fromUser,toUser,'Hello ！我的英文名字叫 H-VK');
                break;
              case '2':
                reportMsg = msg.txtMsg(fromUser,toUser,'Node.js是一个开放源代码、跨平台的JavaScript语言运行环境，采用Google开发的V8运行代码,使用事件驱动、非阻塞和异步输入输出模型等技术来提高性能，可优化应用程序的传输量和规模。这些技术通常用于数据密集的事实应用程序');
                break;
              case '文章':
                var contentArr = [
                  {Title:"Node.js 微信自定义菜单",Description:"使用Node.js实现自定义微信菜单",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72868520"},
                  {Title:"Node.js access_token的获取、存储及更新",Description:"Node.js access_token的获取、存储及更新",PicUrl:"http://img.blog.csdn.net/20170528151333883?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72783631"},
                  {Title:"Node.js 接入微信公众平台开发",Description:"Node.js 接入微信公众平台开发",PicUrl:"http://img.blog.csdn.net/20170605162832842?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaHZrQ29kZXI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast",Url:"http://blog.csdn.net/hvkcoder/article/details/72765279"}
                ];
                //回复图文消息
                reportMsg = msg.graphicMsg(fromUser,toUser,contentArr);
                break;
              default:
                reportMsg = msg.txtMsg(fromUser,toUser,'没有这个选项哦');
                break;
            }
          }
        }
        //返回给微信服务器
        res.send(reportMsg);

      }else{
        //打印错误
        console.log(err);
      }
    });
  });
}

/**
 * 获取微信 access_token
 * access_token的有效时间为2小时
 */
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
