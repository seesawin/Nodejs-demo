var http = require('http');
var url  = require('url');

// 判斷請求是否有內容
var hasBody = function(req) {
		console.log('transfer-encoding' in req.headers);
		console.log('content-length' in req.headers);
		return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
	}

// use curl : curl -d "user=Summer李&passwd=12345678" "http://127.0.0.1:1337/check_your_status"
var serverInit = function(req, res) {

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

var server = http.createServer(serverInit);
server.listen(1337, '127.0.0.1');