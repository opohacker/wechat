# wechat-server

> a wechat demo project

## Build Setup

``` bash
# install dependencies
npm install

# serve at localhost:9091
npm start

```

# 微信公众号开发
---

## 官方开发文档

可以按照开发文档流程学习微信公众号的开发

文档入口 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1445241432

## 申请微信公众号

公众号 https://mp.weixin.qq.com/

测试号 可以先在这上面熟悉下开发公众号的流程，调试下接口

申请入口 https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index

## ngrok

ngrok 是一个反向代理，可以临时地将一个本地的Web网站部署到外网

https://dashboard.ngrok.com/get-started
下载ngrok

```
ngrok http 9091
```

## 微信公众号常用的APIs

#### 获取access_token

```
https请求方式: GET
https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
```

参数 | 是否必须 | 说明
---|---|---
grant_type | 是 | 获取access_token填写client_credential
appid | 是 | 第三方用户唯一凭证
secret | 是 | 第三方用户唯一凭证密钥，即appsecret

```
{"access_token":"ACCESS_TOKEN","expires_in":7200}
```

参数 | 是否必须 说明
---|---|---
access_token | 获取到的凭证
expires_in | 凭证有效时间，单位：秒

#### 自定义菜单

###### 创建菜单

```
http请求方式：POST（请使用https协议）
https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
```
创建菜单

type：
- click
- view
- scancode_push
- scancode_waitmsg
- pic_sysphoto
- pic_photo_or_album
- pic_weixin
- location_select
- media_id
- view_limited

###### 删除菜单

```
http请求方式：GET
https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=ACCESS_TOKEN
```

## 微信公众号-消息管理

#####  接口配置信息
填写接口配置信息，此信息需要你有自己的服务器资源，填写的URL需要正确响应微信发送的Token验证

开发者服务器与微信服务器信息交互的API http://XXXXXX/api/callback

```
get /api/callback
用于验证消息的确来自微信服务器

post /api/callback
用于微信服务器将POST消息的XML数据包到开发者服务器
```


###### 接受消息：

普通消息的MsgType： text image voice video shortvideo location link...

事件推送的MsgType： event

###### 被动回复用户消息：

MsgType: text image voice video music news

*假如服务器无法保证在五秒内处理并回复，必须做出下述回复，这样微信服务器才不会对此作任何处理，并且不会发起重试（这种情况下，可以使用客服消息接口进行异步回复），否则，将出现严重的错误提示。详见下面说明：
1、直接回复success（推荐方式） 2、直接回复空串（指字节长度为0的空字符串，而不是XML结构体中content字段的内容为空）
一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：
1、开发者在5秒内未回复任何内容 2、开发者回复了异常数据，比如JSON数据等*

## 微信网页授权

在微信公众号请求用户网页授权之前，开发者需要先到公众平台官网中的“开发 - 接口权限 - 网页服务 - 网页帐号 - 网页授权获取用户基本信息”的配置选项中，修改授权回调域名。请注意，这里填写的是域名（是一个字符串），而不是URL，因此请勿加 http:// 等协议头


微信网页授权是通过OAuth2.0机制实现的

###### 1 第一步：用户同意授权，获取code

```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
```

参数 | 是否必须 | 说明
---|---|---
appid | 是 | 公众号的唯一标识
redirect_uri | 是 | 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理
response_type | 是 | 返回类型，请填写code
scope | 是 | 应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid），snsapi_userinfo （弹出授权页面，可通过openid拿到昵称、性别、所在地。并且， 即使在未关注的情况下，只要用户授权，也能获取其信息 ）
state | 否 | 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
#wechat_redirect | 是 | 无论直接打开还是做页面302重定向时候，必须带此参数

###### 2 第二步：通过code换取网页授权access_token


```
获取code后，请求以下链接获取access_token：  https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
```

参数 | 是否必须 | 说明
---|---|---
appid | 是 | 公众号的唯一标识
secret | 是 | 公众号的appsecret
code | 是 | 填写第一步获取的code参数
grant_type | 是 | 填写为authorization_code

```
{ "access_token":"ACCESS_TOKEN",
"expires_in":7200,
"refresh_token":"REFRESH_TOKEN",
"openid":"OPENID",
"scope":"SCOPE" }
```
首先请注意，这里通过code换取的是一个特殊的网页授权access_token,与基础支持中的access_token（该access_token用于调用其他接口）不同。公众号可通过下述接口来获取网页授权access_token。如果网页授权的作用域为snsapi_base，则本步骤中获取到网页授权access_token的同时，也获取到了openid，snsapi_base式的网页授权流程即到此为止。

###### 3 第三步：拉取用户信息(需scope为 snsapi_userinfo)

```
http：GET（请使用https协议） https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
```

参数 | 描述
---|---|---
access_token | 网页授权接口调用凭证,注意：此access_token与基础支持的access_token不同
openid | 用户的唯一标识
lang | 返回国家地区语言版本，zh_CN 简体，zh_TW 繁体，en 英语

```
{    "openid":" OPENID",
" nickname": NICKNAME,
"sex":"1",
"province":"PROVINCE"
"city":"CITY",
"country":"COUNTRY",
"headimgurl":    "http://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
"privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
"unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
}
```

## JSSDK使用

###### 1 绑定域名

先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。

###### 2 引入JS文件

在需要调用JS接口的页面引入如下JS文件，（支持https）：http://res.wx.qq.com/open/js/jweixin-1.4.0.js

###### 3 通过config接口注入权限验证配置

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用

```
wx.config({
    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: '', // 必填，公众号的唯一标识
    timestamp: , // 必填，生成签名的时间戳
    nonceStr: '', // 必填，生成签名的随机串
    signature: '',// 必填，签名
    jsApiList: [] // 必填，需要使用的JS接口列表
});
```

###### 4 使用相应的微信JS接口
比如：拍照或从手机相册中选图接口

```
wx.chooseImage({
count: 1, // 默认9
sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
success: function (res) {
var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
}
});
```

## 微信网页开发样式库

WeUI 微信设计团队精心打造 同微信客户端一致的视觉效果 一套样式

https://weui.io/

WeUI+ 是Zepto1.2和WeUI 1.1.3为基础,收集整理了上百个组件开发而成,兼容IOS和Android平台,主要用于微信/手机网站开发

http://weui.shanliwawa.top/