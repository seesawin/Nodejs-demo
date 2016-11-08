var http = require('http');
var url  = require('url');

var sessions = {};
var key = 'session_id';
var EXPIRE = 20 * 60 * 1000;

// 產生session
var genSession = function() {
	var session = {};
	session.id = (new Date()).getTime() + Math.random();
	session.cookie = {
		expire : (new Date()).getTime() + EXPIRE
	};
	sessions[session.id] = session;
	return session;
}

var session1 = function(req, res) {

	req.cookies = req.headers.cookie;
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
				req.session = session;
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

var getUrl = function(_url, key, value) {
	var obj = url.parse(_url, true);
	obj.query[key] = value;
	console.log('003***************************');
	console.log(obj);
	console.log(url.format(obj));
	return url.format(obj);
}

var session2 = function(req, res) {

	var redirect = function(url) {
		res.setHeader('Location', url);
		res.writeHead(302);
		res.end();
	}

	req.query = url.parse(req.url, true).query;
	var id = req.query[key];
	console.log('001****************************');
	console.log(req.query);
	console.log('002****************************');
	console.log(id);

	if(!id) {
		console.log('001');
		var session = genSession();
		redirect(getUrl(req.url, key, session.id));
	} else {
		var session = sessions[id];
		if(session) {
			if(session.cookie.expire > (new Date()).getTime()) {
				session.cookie.expire = (new Date()).getTime() + EXPIRE;
				req.session = session;
				console.log('002-1')
			} else {
				delete sessions[id];
				var session = genSession();
				redirect(getUrl(req.url, key, session.id));
				console.log('002-3')
			}
		} else {
			var session = genSession();
			redirect(getUrl(req.url, key, session.id));
			console.log('003')
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

// var server = http.createServer(session1);
var server = http.createServer(session2);
server.listen(1337, '127.0.0.1');
