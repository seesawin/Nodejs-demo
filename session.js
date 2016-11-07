var http = require('http');
var url  = require('url');

var sessions = {};
var key = 'session_id';
var EXPIRE = 20 * 60 * 1000;

// 產生session
var genSession = function() {
	var session = {};
	session.id = (new Date()).getTime() + Math.radom();
	session.cookie = {
		expire : (new Date()).getTime() + EXPIRE
	};
	sessions[session.id] = session;
	return session;
}

var serverInit = function(req, res) {

	var id = req.cookies[key];
	console.log(id)

	if(!id) {
		console.log('001')
		req.session = genSession();
	} else {
		var session = sessions[id];
		if(session) {
			if(session.cookie.expire > (new Date()).getTime()) {
				session.cookie.expire = (new Date()).getTime() + EXPIRE;
				console.log('002-1')
			} else {
				delete sessions[id];
				req.session = genSession();
				console.log('002-3')
			}
		} else {
			req.session = genSession();
			console.log('003')
		}

		// 重寫res.writeHead方法
		var writeHead = res.writeHead;
		res.writeHead = function() {
			var cookies = res.getHeader('Set-Cookie');
			var session = serialize('Set-Cookie', req.session.id);

			console.log(cookies);
			console.log(session);

			cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session];
			res.setHeader('Set-Cookie', cookies);

			return writeHead.apply(this, arguements);
		}

		// 調用業務邏輯處理層
		(function(req, res) {

			if(!req.session.isVisit) {
				req.session.isVisit = true;
				res.writeHead(200);
				res.end('Hi 歡迎光臨~');
			} else {
				res.writeHead(200);
				res.end('再次歡迎您！');
			}

		})(req, res);
	}

}

var server = http.createServer(serverInit);
server.listen(1337, '127.0.0.1');
