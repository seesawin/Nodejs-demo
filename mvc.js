var http = require('http');
var url  = require('url');

var done = function(req, res) {
	(function(req, res) {
		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('自然映射 OK!');
	})(req, res);
}

// 模擬的controller
exports.setting = function(req, res) {
	done(req, res);
}

// 請求路徑與Controller對應
var routes = [];
var use = function(path, action) {
	routes.push([path, action]);
}

// 手工映射
var serverSampleInit = function(req, res) {

	// 註冊對應
	use('/pathA', exports.setting);

	var pathname = url.parse(req.url).pathname;
	console.log(pathname);

	for(var i = 0; i < routes.length; i++) {
		var route = routes[i];
		if(pathname === route[0]) {
			var action = route[1];
			console.log(action);
			action(req, res);
		}
	}
}

// 建立server
var server = http.createServer(serverSampleInit);
server.listen(1337, '127.0.0.1');