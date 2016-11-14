var http = require('http');
var url  = require('url');

var routes = {'all' : []};
var app = {};
app.use = function(path, action) {
	console.log('**************** app.use ****************');
	var handle = {
		path : pathRegexp(path),
		stack : Array.prototype.slice.call(arguments, 1)
	}
	routes.all.push(handle);
}

var match = function(pathname, routes) {
	console.log('**************** match ****************');

	for(var i = 0; i < routes.length; i++) {
		var route = routes[i];
		var reg = route.path;
		console.log(route);
		console.log(reg);

		var matched = reg.exec(pathname);
		console.log(matched);

		if(matched) {
			// handle(req, res, route.stack);
			return {
				state :true,
				stack : route.stack
			};
		}
	}
	return false;
}

var handle = function(req, res, stack) {
	console.log('**************** handle ****************');

	var next = function() {
		console.log('**************** next() 從stack取出中間件並執行 ****************');
		// 從stack取出中間件並執行
		var middleware = stack.shift();
		console.log(middleware);

		if(middleware) {
			// 傳入next函數自身，使中間件能夠執行結束後遞迴
			middleware(req, res, next);
		}
	}
	// 啟動
	next();
}

var pathRegexp = function(path) {
	var strict = true;
	path = path
		.concat(strict ? '' : '/?')
		.replace(/\/\(/g, '(?:/')
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
	optional, star){
		slash = slash || '';
		return ''
			+ (optional ? '' : slash)
			+ '(?:'
			+ (optional ? slash : '')
			+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
			+ (optional || '')
			+ (star ? '(/*)?' : '');
	})
	.replace(/([\/.])/g, '\\$1')
	.replace(/\*/g, '(.*)');
	return new RegExp('^' + path + '$');
}

var done = function(req, res) {
	console.log('**************** done ****************');
	(function(req, res) {
		console.log(req.query);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('測試中間件 OK!');
	})(req, res);
}

var queryString = function(req, res, next) {
	console.log('**************** queryString ****************');
	req.query = url.parse(req.url, true).query;
	next();
}

var cookie = function(req, res, next) {
	console.log('**************** cookie ****************');
	var cookie = req.headers.cookie;
	var cookies = {};
	if(cookie) {
		var list = cookie.split(';');
		for (var i = 0; i < list.length; i++) {
			let pair = list[i].split('=');
			cookies[pair[0].trim()] = pair[1];
		}
	}
	req.cookies = cookies;
	next();
}

var serverMiddleware = function(req, res) {
	console.log('**************** init ****************');
	if (url.parse(req.url).pathname === '/favicon.ico') {
		console.log('everything here is ignored');
	} else {
		app.use('/pathA/:username', queryString, cookie, done);

		var pathname = url.parse(req.url).pathname;
		console.log(pathname);

		var result = match(pathname, routes.all);
		if(result.state) {
			console.log('result ok!');
			handle(req, res, result.stack);
		} else {
			console.log('req err!');
			res.writeHead(400, {'Content-Type': 'text/plain'});
			res.end('系統錯誤!');
		}
	}
}

var server = http.createServer(serverMiddleware);
server.listen(1337, '127.0.0.1');