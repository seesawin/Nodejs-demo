var action = {
	init : function(req, res) {
		console.log('invoke init');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('調用 init Controller OK!');
	},
	set : function(req, res) {
		console.log('invoke set');
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('調用 set Controller OK!');
	}
}

module.exports = action;

exports.setting = function(req, res) {
	console.log('invoke set');
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('調用 setting Controller OK!');
}