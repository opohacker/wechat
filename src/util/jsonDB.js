/**
 * Created by qingpeng on 2018/6/14.
 */
var fs = require('fs')

var entityBasePath = process.cwd() + '/src/entity/'

var getData = function (jsonName) {
  return new Promise(function (resolve, reject) {
    var path = getFilePath(jsonName)
    fs.readFile(path, function (err, data) {
      if (err) {
        reject(err)
      }
      var dataStr = data.toString()//将二进制的数据转换为字符串
      console.log(dataStr)
      var jsonData = JSON.parse(dataStr)//将字符串转换为json对象
      console.log(jsonData)
      resolve(jsonData)
    })
  })
}

var saveData = function (jsonName, json) {
  var path = getFilePath(jsonName)
  return new Promise(function (resolve, reject) {
    var str = JSON.stringify(json)//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
    fs.writeFile(path, str, function (err) {
      if (err) {
        reject(err)
      }
      resolve('success')
    })
  })
}

var getFilePath = function (jsonName) {
  return entityBasePath + jsonName + '.json'
}

module.exports = {
  getData: getData,
  saveData: saveData
}
