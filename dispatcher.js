var http = require('http');
var url  = require('url');
var fs   = require('fs');
var path = require('path');
var queryString = require('querystring');

// 產生建立server所需的物件
var serverSampleInit = function(req, res) {

	// 測試url : http://localhost:1337/?id=001&name=Frank&line=16888aaa&id=008
	// 取得查詢資訊
	var query = queryString.parse(url.parse(req.url).query);
	console.log(query);
	// or
	query = url.parse(req.url, true).query;
	console.log(query);

	// 掛載資訊於請求對象
	req.query = query;

	// 調用業務邏輯處理層
	(function(req, res) {
		let query = req.query;

		console.log('id  : ' + query.id);
		console.log('name: ' + query.name);
		console.log('line: ' + query.line);

		// 0. 最簡單的回應
		console.log('init server!');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('init server OK!');

	})(req, res);

}

var serverInitByMethod = function(req, res) {

	// 1. 根據請求方法決定響應行為
	console.log('req.method : ' + req.method);
	switch (req.method) {
		case 'POST':
			console.log('to update');
			// update(req, res);
			break;
		case 'DELETE':
			console.log('to remove');
			// remove(req, res);
			break;
		case 'PUT':
			console.log('to create');
			// create(req, res);
			break;
		case 'GET':
		default:
			console.log('to GET');
			// get(req, res);
	}

	res.writeHead(200);
	res.end('發送成功！');

}

var serverInitByURL = function(req, res) {

	// 2. 判斷url路徑決定響應行為
	// 測試url : http://localhost:1337/data.txt
	var pathName = url.parse(req.url).pathname;
	console.log('pathName : ' + pathName);
	console.log('__dirname : ' + __dirname);

	fs.readFile(path.join(__dirname, pathName), function(err, file) {

		console.log('err : ' + err);
		if (err) {
			res.writeHead(404);
			res.end('找不到相關文件！');
			return;
		}

		res.writeHead(200);
		res.end(file);

	});

}

// 建立一個物件以存放所有的業務邏輯函數
var handles = {
	controller: {
		action: {}
	}
};

// 建立一個業務邏輯函數
handles.controller.action = function(req, res, foo, bar) {
	console.log('調用service : foo == ' + foo);
	res.writeHead(200);
	res.end('調用service OK!');
};

var serverInitUsingController = function(req, res) {

	// 3. 解析url路徑決定對應的Controller與業務邏輯
	// 測試url : http://localhost:1337/controller/action/a/b/c
	var pathName   = url.parse(req.url).pathname;
	var paths      = pathName.split('/');
	var controller = paths[1] || 'controller';
	var action     = paths[2] || 'action';
	var args       = pathName.slice(3);

	console.log('pathName : ' + pathName);
	console.log('paths : ' + paths);
	console.log('controller : ' + controller + ', action : ' + action + ', args : ' + args);
	console.log('handles[controller] : ' + handles[controller]);
	console.log('handles[controller][action] : ' + handles[controller][action]);

	if (handles[controller] && handles[controller][action]) {
		// 調用對應的業務邏輯
		var serviceFunction = handles[controller][action];
		serviceFunction.apply(null, [req, res].concat(args));
	} else {
		res.writeHead(500);
		res.end('系統錯誤！');
	}

}

// 建立server
var server = http.createServer(serverSampleInit);
// var server = http.createServer(serverInitByMethod);
// var server = http.createServer(serverInitByURL);
// var server = http.createServer(serverInitUsingController);
server.listen(1337, '127.0.0.1');