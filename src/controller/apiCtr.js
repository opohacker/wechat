var express = require('express');
var bodyParser = require('body-parser');
var logger = require('../common/logger');
var httpRequest = require('../common/http-request');
var co = require('co');
var xml2js = require('xml2js');
var token = require('../util/token');
var util = require('../util/util');
var jsonDB = require('../util/jsonDB');
var config = require('../../project-config');
var menus = require('../entity/menu');
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
  var token = config.TOKEN;
  console.log(params);
  if (util.checkSignature(token, params.timestamp, params.nonce,
          params.signature)) {
    res.send(params.echostr);
  } else {
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
  handleMsg(req, res);
});

var handleMsg = function(req, res) {
  var buffer = [], that = this;

  //监听 data 事件 用于接收数据
  req.on('data', function(data) {
    buffer.push(data);
  });
  //监听 end 事件 用于处理接收完成的数据
  req.on('end', function() {
    var msgXml = Buffer.concat(buffer).toString('utf-8');
    //解析xml
    xml2js.parseString(msgXml, {explicitArray: false}, function(err, result) {
      if (!err) {
        result = result.xml;
        var toUser = result.ToUserName; //接收方微信
        var fromUser = result.FromUserName;//发送仿微信
        var reportMsg = ''; //声明回复消息的变量

        //判断消息类型
        if (result.MsgType.toLowerCase() === 'event') {
          //判断事件类型
          switch (result.Event.toLowerCase()) {
            case 'subscribe':
              console.log('subscribe')
              //回复消息
              var content = '欢迎关注 科达园区-公众号开发分享，回复以下数字获得相关资讯：\n';
              content += '1.关于公司\n';
              content += '2.关于这次分享\n';
              reportMsg = msg.txtMsg(fromUser, toUser, content);
              break;
            case 'location_select':
              console.log('location_select')
              //地理位置
              var content = '你的位置：\n';
              content += JSON.stringify(result.SendLocationInfo.Label) + '\n';
              console.log(content)
              reportMsg = msg.txtMsg(fromUser, toUser, content);
              console.log(reportMsg)
              break;
            case 'scancode_waitmsg':
              //二维码扫描
              console.log('scancode_waitmsg')
              var content = '二维码数据解析结果：\n';
              content += JSON.stringify(result.ScanCodeInfo) + '\n';
              reportMsg = msg.txtMsg(fromUser, toUser, content);
              break;
            case 'pic_weixin':
              //微信相册发图
                console.log(result.SendPicsInfo)
              var content = '你总共发送了 ' + result.SendPicsInfo.Count + '张图片\n';
              reportMsg = msg.txtMsg(fromUser, toUser, content);
              break;
            case 'click':
              var contentArr = [
                {
                  Title: '分享文档',
                  Description: '微信公众号-分享文档',
                  PicUrl: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                  Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                },
                {
                  Title: '分享文档2',
                  Description: '微信公众号-分享文档2',
                  PicUrl: 'https://www.kedacom.com/r/cms/www/kedacom/images/logo_blue.png',
                  Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                },
                {
                  Title: '分享文档2',
                  Description: '微信公众号-分享文档3',
                  PicUrl: 'www.kedacom.com/r/cms/www/kedacom/images/temp/solution_yl_hover.png',
                  Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                }
              ];
              //回复图文消息
              reportMsg = msg.graphicMsg(fromUser, toUser, contentArr);
              break;
          }
        } else {
          //判断消息类型为 文本消息
          if (result.MsgType.toLowerCase() === 'text') {
            //根据消息内容返回消息信息
            switch (result.Content) {
              case '1':
                reportMsg = msg.txtMsg(fromUser, toUser, 'Hello ！科达');
                break;
              case '2':
                reportMsg = msg.txtMsg(fromUser, toUser,
                    'Node.js是一个开放源代码、跨平台的JavaScript语言运行环境，采用Google开发的V8运行代码,使用事件驱动、非阻塞和异步输入输出模型等技术来提高性能，可优化应用程序的传输量和规模。这些技术通常用于数据密集的事实应用程序');
                break;
              case '文章':
                var contentArr = [
                  {
                    Title: '分享文档',
                    Description: '微信公众号-分享文档',
                    PicUrl: 'https://www.kedacom.com/r/cms/www/kedacom/images/logo_blue.png',
                    Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                  },
                  {
                    Title: '分享文档2',
                    Description: '微信公众号-分享文档2',
                    PicUrl: 'www.kedacom.com/r/cms/www/kedacom/images/temp/solution_jy_hover.png',
                    Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                  },
                  {
                    Title: '分享文档2',
                    Description: '微信公众号-分享文档3',
                    PicUrl: 'www.kedacom.com/r/cms/www/kedacom/images/temp/solution_yl_hover.png',
                    Url: 'https://wiki.kedacom.com/pages/viewpage.action?pageId=31951379',
                  },
                ];
                //回复图文消息
                reportMsg = msg.graphicMsg(fromUser, toUser, contentArr);
                break;
              default:
                reportMsg = msg.txtMsg(fromUser, toUser, '没有这个选项哦');
                break;
            }
          }
        }
        //返回给微信服务器
        res.send(reportMsg);

      } else {
        //打印错误
        console.log(err);
      }
    });
  });
};

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
    var result = yield httpRequest.postJson(url, menus);
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

app.post('/getMyInfo', function(req, res) {
  var TAG = logger.TAG(req);
  var code = req.body.code;
  console.log(code);
  co(function*() {
    var url = ' https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.APP_ID+'&secret='+config.APP_SECRET+'&code='+code+'&grant_type=authorization_code';
    var tokenObj = yield httpRequest.getJson(url);
    console.log(tokenObj);
    var url = ' https://api.weixin.qq.com/sns/userinfo?access_token='+tokenObj.access_token+'&openid='+tokenObj.openid+'&lang=zh_CN';
    var personInfo = yield httpRequest.getJson(url);
    var userList=yield jsonDB.getData('user')
    var existed=false;
    for(var i in userList){
      if(userList[i].openid===personInfo.openid){
        existed=true;
        break
      }
    }
    if(!existed){
      userList.push(personInfo)
      jsonDB.saveData('user',userList)
    }
    logger.info(TAG, personInfo);
    res.send(personInfo);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
});

var ticketObj = {};//[{ticket:xxx,expires_time:xxx}];

app.post('/getJSSDKConfig', function(req, res) {
  var TAG = logger.TAG(req);
  var reqUrl = req.body.url;
  co(function*() {
    'use strict';
    var nowTime = new Date().getTime();
    if (!ticketObj.ticket || nowTime > ticketObj.expires_time) {
      var tokenObj = yield token.get();
      var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tokenObj.access_token+'&type=jsapi';
      var ticketResult = yield httpRequest.getJson(url);
      console.log(ticketResult);
      ticketObj.ticket=ticketResult.ticket
      ticketObj.expires_time = nowTime + ticketResult.expires_in * 1000;
    }
    var jsapi_ticket=ticketObj.ticket;
    var timestamp=new Date().getTime();
    var noncestr=util.randomString();
    var signature=util.generateJSSDKSignature(noncestr, jsapi_ticket, timestamp, reqUrl);
    var sdkConfig={
      appId: config.APP_ID,
      timestamp:timestamp,
      nonceStr:noncestr,
      signature: signature
    }
    console.log(JSON.stringify(sdkConfig))
    res.send(sdkConfig);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
});

app.get('/getSubscribeUsers',function(req,res) {
  var TAG = logger.TAG(req);
  co(function*() {
    var userList=yield jsonDB.getData('user')
    logger.info(TAG, userList);
    res.send(userList);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
})

app.post('/sendLotteryMessage', function(req, res) {
  var data=req.body;
  var TAG = logger.TAG(req);
  logger.info(TAG, data);
  // var data = ['oGDtL1IgHlO0arLY7f11jqylHcFw','oGDtL1IgHlO0arLY7f11jqylHcFw']
  co(function*() {
    'use strict';
    var tokenObj = yield token.get();
    var url = 'https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=' + tokenObj.access_token;
    var params={
      touser:data.openIds,
      msgtype:'text',
      text: {content:'恭喜你获奖.'}
    }
    var result = yield httpRequest.postJson(url, params);
    console.log(result);
    res.send(result);
  }).catch(function(e) {
    logger.info(TAG, e);
  });
});
