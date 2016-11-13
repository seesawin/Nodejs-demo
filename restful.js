var http = require('http');
var url  = require('url');

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

var serverMVCRESTful = function(req, res) {

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

var server = http.createServer(serverMVCRESTful);
server.listen(1337, '127.0.0.1');