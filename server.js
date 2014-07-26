var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// Handle 404
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

// Handle 200
function sendFile(response, filePath, fileContents) {
	response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		// Serve from cache
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				// Read the file
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						// Cache the data for later
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				// 404 file not found!
				send404(response);
			}
		});
	}
}

// Initialize the http server
var server = http.createServer(function(request, response) {
	var filePath = false;
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

// Initialize the chat server and bind to the web server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);