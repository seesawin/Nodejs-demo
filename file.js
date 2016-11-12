var http = require('http');
var url  = require('url');
var queryString = require('querystring');
var xml2js = require('xml2js');
var formidable = require('formidable');

// 判斷請求是否有內容
var hasBody = function(req) {
	console.log('transfer-encoding' in req.headers);
	console.log('content-length' in req.headers);
	return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
}

// use curl : curl -d "user=Summer李&passwd=12345678" "http://127.0.0.1:1337/check_your_status"
var serverInit1 = function(req, res) {

	if(hasBody(req)) {

		var buffers = [];

		req.on('data', function(chunk){
			console.log('in data');
			buffers.push(chunk);
		}) 

		req.on('end', function(){
			console.log('in end');

			req.rawBody = Buffer.concat(buffers).toString();
			console.log(req.rawBody);
			console.log(buffers);

			// 調用業務邏輯處理層
			(function(req, res) {

				console.log('init server!');
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end('init server OK!');

			})(req, res);
		})

	} else {
		// 調用業務邏輯處理層
		(function(req, res) {

			console.log('init server!');
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('init server OK!');

		})(req, res);
	}

}

// 接收form表單資訊
var serverInit2 = function(req, res) {

	if(req.headers['content-type'] === 'application/x-www-form-urlencoded') {
		req.body = queryString.parse(req.rawBody);
	}

	// 調用業務邏輯處理層
	(function(req, res) {

		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('init server OK!');

	})(req, res);

}

// 取得mime
var mime = function(req) {
	var type = req.headers['content-type'] || '';
	return type.split(';')[0];
}

// 接收JSON格式
var serverInit3 = function(req, res) {

	if(mime(req) === 'application/json') {
		try{
			req.body = JSON.parse(req.rawBody);
		} catch (e){
			res.writeHead(400);
			res.end('Invelid JSON');
		}
	}

	// 調用業務邏輯處理層
	(function(req, res) {

		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('init server OK!');

	})(req, res);

}

// 接收XML格式
var serverInit3 = function(req, res) {

	if(mime(req) === 'application/xml') {
		xml2js.parseString(req.rawBody, function(err, xml){
			if(err) {
				res.writeHead(400);
				res.end('Invelid XML');
			}

			req.body = xml;

			// 調用業務邏輯處理層
			(function(req, res) {

				console.log(req.body);
				console.log('init server!');
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end('get xml OK!');

			})(req, res);

		});
	}

	// 調用業務邏輯處理層
	(function(req, res) {

		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('get xml OK!');

	})(req, res);

}

// 模擬處理邏輯
var done = function(req, res) {
	(function(req, res) {
		console.log(req.body);
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('get file OK!');
	})(req, res);
}

// 接收文件格式
var serverInit3 = function(req, res) {

	if(hasBody(req)) {
		if(mime(req) === 'application/xml') {
			done(req, res);
		} else if(mime(req) === 'application/json') {
			done(req, res);
		} else if(mime(req) === 'application/form-data') {
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files) {
				req.body = files;
				req.files = files;
				done(req, res);
			});	
		}
	} else {
		done(req, res);
	}

}

// var server = http.createServer(serverInit1);
// var server = http.createServer(serverInit2);
var server = http.createServer(serverInit3);
server.listen(1337, '127.0.0.1');