var http = require('http');
var url  = require('url');

var serverInit = function(req, res) {


}

var server = http.createServer(serverInit);
server.listen(1337, '127.0.0.1');