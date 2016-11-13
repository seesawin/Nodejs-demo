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
// 01 手工註冊
var serverMVCManual = function(req, res) {

	// 手工註冊對應
	use('/pathA', exports.setting);
	use('/pathB/ABC', exports.setting);

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

// 產生正則表達式
// /profile/:username => /profile/jacksontian, /profile/hoover
// /user.:ext => /user.xml, /user.json
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
	console.log(pathRegexp(path));
};

// 手工映射
// 02 正則批配
var serverMVCRegrex = function(req, res) {

	if(url.parse(req.url).pathname === '/favicon.ico'){
        console.log('everything here is ignored');
    
    } else {
		useRegrex('/pathA/:username', exports.setting);
		useRegrex('/user.:ext', exports.setting);

		var pathname = url.parse(req.url).pathname;
		console.log(pathname);

		for(var i = 0; i < routes.length; i++) {
			var route = routes[i];

			// 測試路徑是否與符合表達式
			if(route[0].exec(pathname)) {
				var action = route[1];
				console.log(action);
				action(req, res);
			}
			
		}
    }

}

// 自然映射
var serverMVCNatural = function(req, res) {
	if(url.parse(req.url).pathname === '/favicon.ico'){
        console.log('everything here is ignored');
    } else {
		// 測試url :
		// http://localhost:1337/controller/init/a/b/c
		// http://localhost:1337/controller/set/a/b/c
		var pathName   = url.parse(req.url).pathname;
		var paths      = pathName.split('/');
		var controller = paths[1] || 'controller';
		var action     = paths[2] || 'action';
		var args       = pathName.slice(3);
		var module;


		console.log('pathName : ' + pathName);
		console.log('paths : ' + paths);
		console.log('controller : ' + controller + ', action : ' + action + ', args : ' + args);

		try{
			module = require('./controllers/' + controller);
			console.log(module);
		} catch(e) {
			console.log(e);
		}

		var method = module[action];
		console.log(method);

		if(method) {
			method.apply(null, [req, res].concat(args));
		}
    }

}

// 建立server
// var server = http.createServer(serverMVCManual);
var server = http.createServer(serverMVCRegrex);
// var server = http.createServer(serverMVCNatural);
server.listen(1337, '127.0.0.1');