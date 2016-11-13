var http = require('http');
var url  = require('url');

var done = function(req, res) {
	(function(req, res) {
		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('測試中間件 OK!');
	})(req, res);
}