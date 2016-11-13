var http = require('http');
var url  = require('url');

var done = function(req, res) {
	(function(req, res) {
		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('測試RESTful OK!');
	})(req, res);
}

var routes = {'all' : []};
var app = {};
app.use = function(path, action
	) {
	routes.all.push(pathRegexp(path), action);
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

var useRegrex = function (path, action) {
	routes.push([pathRegexp(path), action]);
};

// 添加RESTful請求方法定義資源操作
['get', 'post', 'delete', 'put'].forEach(function(method){
	routes[method] = [];
	app[method] = function(path, action) {
		routes[method].push([pathRegexp(path), action]);
	}
})

// 添加MVC對應
app.get('/user/:username', done);
app.post('/user/:username', done);
app.delete('/user/:username', done);
app.put('/user/:username', done);

var match = function(pathname, routes) {
	// console.log('routes: ' + routes);
	// console.log('routes.length: ' + routes.length);


	for(var i = 0; i < routes.length; i++) {
		var route = routes[i];
		// var reg = route[0].regexp;
		// var key = route[0].keys;

		var reg = route[0];
		// var key = route[0].keys;

		console.log(route);
		// console.log(reg);
		// console.log(key);

		var matched = reg.exec(pathname);
		console.log(matched);

		if(matched) {
			var params = {};

			// for(var j = 0; j < keys.length; j++) {
			// 	var value = matched[i + 1];
			// 	console.log(value);

			// 	if(value) {
			// 		params[keys[j]] = value;
			// 	}

			// }

			// requ.params = params;
			var action = route[1];
			// action(req, res);
			return action;

		}
	}
}

var serverMVCRESTful = function(req, res) {
	var pathname = url.parse(req.url).pathname;

	if(pathname === '/favicon.ico'){
        console.log('everything here is ignored');
    } else {
    	var method = req.method.toLowerCase();
    	console.log('start');
    	console.log(method);

    	if(routes.hasOwnProperty(method)) {
    		// 根據請求方法分發
    		if(match(pathname, routes[method])) {
    			console.log('根據請求方法分發');
    			var action = match(pathname, routes[method]);
    			action(req, res);
    			return;
    		} else if(match(pathname, routes.all)) {
    			return;
    		}
    	} else if(match(pathname, routes.all)) {
			return;
		}

    }

}

var server = http.createServer(serverMVCRESTful);
server.listen(1337, '127.0.0.1');