var http = require('http');
var url  = require('url');

var serverInit = function(req, res) {

	// 使用curl tool產生http請求以及產生cookie
	// 指令：curl -v -H "Cookie: foo=bar; baz=val" "http://localhost:1337/?id=001&name=Frank&line=16888aaa&id=008"
	var cookies = req.headers.cookie;
	cookies = parseCookie(cookies);

	// 掛載資訊於請求對象
	req.cookies = cookies;

	// 調用業務邏輯處理層
	(function(req, res) {

		let cookies = req.cookies;
		console.log(cookies);

		if (!cookies.isVisit) {
			// 設定cookie
			res.setHeader('Set-cookie', serialize('isVisit', '1'));
			res.writeHead(200);
			res.end('Hi 歡迎光臨~');
		} else {
			res.writeHead(200);
			res.end('再次光臨！');
		}

	})(req, res);

}

var server = http.createServer(serverInit);
server.listen(1337, '127.0.0.1');

// 取得cookie
var parseCookie = function(cookie) {

	var cookies = {};
	if (!cookie) {
		return cookies;
	}

	var list = cookie.split(';');
	for (var i = 0; i < list.length; i++) {
		let pair = list[i].split('=');
		cookies[pair[0].trim()] = pair[1];
	}

	return cookies;

}

// 建立回傳cookie
var serialize = function(name, val, opt) {

	// var pairs = [name + '=' + encode(val)];
	var pairs = [name + '=' + val];
	opt = opt || {};

	if (opt.maxAge) pairs.push('maxAge=' + obj.maxAge);
	if (opt.domain) pairs.push('domain=' + opt.domain);
	if (opt.path) pairs.push('path=' + opt.path);
	if (opt.expires) pairs.push('expires=' + opt.expires);
	if (opt.httpOnly) pairs.push('httpOnly=' + opt.httpOnly);
	if (opt.secure) pairs.push('secure=' + opt.secure);
	console.log(pairs);

	return pairs;

}