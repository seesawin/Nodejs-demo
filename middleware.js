var http = require('http');
var url  = require('url');

var routes = {'all' : []};
var app = {};
app.use = function(path) {
	console.log('**************** app.use start ****************');

	var handle = {};
	if(typeof path === 'string') {
		handle = {
			path : pathRegexp(path),
			stack : Array.prototype.slice.call(arguments, 1)
		}
	} else {
		handle = {
			path : pathRegexp('/'),
			stack : Array.prototype.slice.call(arguments, 0)
		}
	}
	
	routes.all.push(handle);
	console.log('**************** app.use end ****************');
}

var match = function(pathname, routes) {
	console.log('**************** match start ****************');
	console.log('length : ' + routes.length);

	var stacks = [];
	for(var i = 0; i < routes.length; i++) {
		var route = routes[i];
		var reg = route.path;
		console.log(route);
		console.log('reg : ' + reg);

		var matched = reg.exec(pathname);
		console.log('matched : ' + matched);

		if(matched) {
			console.log(55555555555555555555555555555555555);
			stacks = stacks.concat(route.stack);
		}
	}
	
	console.log('obj stack lenth : ' + stacks.length );
	console.log('**************** matched end **************** ');

	return stacks;
}

var handle = function(req, res, stack) {
	console.log('**************** handle start ****************');

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
	console.log('**************** handle end ****************');
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
	console.log('**************** done start ****************');
	(function(req, res) {
		console.log(req.query);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('測試中間件 OK!');
		console.log('**************** done end ****************');
	})(req, res);
}

var queryString = function(req, res, next) {
	console.log('**************** queryString start ****************');
	req.query = url.parse(req.url, true).query;
	next();
	console.log('**************** queryString end ****************');
}

var cookie = function(req, res, next) {
	console.log('**************** cookie start ****************');
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
	console.log('**************** cookie end ****************');
}

var serverMiddleware = function(req, res) {
	console.log('**************** init ****************');
	if (url.parse(req.url).pathname === '/favicon.ico') {
		console.log('everything here is ignored');
	} else {
		// 添加RESTful請求方法定義資源操作
		['get', 'post', 'delete', 'put'].forEach(function(method){
			routes[method] = [];
			app[method] = function(path, action) {
				routes[method].push({path : pathRegexp(path), stack : [action]});
			}
		})

		// 添加MVC對應
		app.use(queryString);
		app.use(cookie);
		app.get('/', done);
		app.post('/user/:username', done);
		app.delete('/user/:username', done);
		app.put('/user/:username', done);

		var pathname = url.parse(req.url).pathname;
		console.log('pathname : ' + pathname);

		var method = req.method.toLowerCase();
		console.log('method : ' + method);

		var stack = match(pathname, routes.all);
		console.log('001 stack.length =' + stack.length);

		if(routes.hasOwnProperty(method)) {
			console.log('result hasOwnProperty!');
			stack = stack.concat(match(pathname, routes[method]));
		} else {
			console.log('req err!');
			res.writeHead(400, {'Content-Type': 'text/plain'});
			res.end('系統錯誤!');
		}

		console.log('002 stack.length =' + stack.length);
		if(stack.length) {
			console.log('001');
			handle(req, res, stack);
		} else {
			console.log('002');
		}
	}
}

var server = http.createServer(serverMiddleware);
server.listen(1337, '127.0.0.1');