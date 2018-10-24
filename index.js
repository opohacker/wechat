var http = require('http');
var express = require('express');
var app = express();

app.use('/api/', require('./src/api/apiCtr'));
app.use('/', express.static(__dirname + '/src/static'));

var server = http.createServer(app);

server.listen(9091, function() {
  console.log('http://localhost:9091/api/');
});