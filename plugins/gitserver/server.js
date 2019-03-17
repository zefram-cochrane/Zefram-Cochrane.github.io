/*\
title: $:/plugins/xscale/gitserver/server.js
type: application/javascript
module-type: command

Serve tiddlers over http, save with git

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

if ($tw.node) {
	var save = require("$:/plugins/xscale/gitserver/git/save.js");
	var update = require("$:/plugins/xscale/gitserver/git/update.js");
	var util = require("util");
	var	fs = require("fs");
	var	url = require("url");
	var	path = require("path");
	var	http = require("http");

	process.on('unhandledRejection', (reason, p) => {
	  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	  // application specific logging, throwing an error, or other logic here
	});
}

exports.info = {
	name: "gitserver",
	synchronous: true
};


/*
A simple HTTP server with regexp-based routes
*/
function GitServer(options) {
	this.routes = options.routes || [];
	this.wiki = options.wiki;
	this.variables = options.variables || {};
}

GitServer.prototype.set = function(obj) {
	var self = this;
	$tw.utils.each(obj,function(value,name) {
		self.variables[name] = value;
	});
};

GitServer.prototype.get = function(name) {
	return this.variables[name];
};

GitServer.prototype.addRoute = function(route) {
	this.routes.push(route);
};

GitServer.prototype.findMatchingRoute = function(request,state) {
	var pathprefix = this.get("pathprefix") || "";
	for(var t=0; t<this.routes.length; t++) {
		var potentialRoute = this.routes[t],
			pathRegExp = potentialRoute.path,
			pathname = state.urlInfo.pathname,
			match;
		if (pathprefix) {
			if (pathname.substr(0,pathprefix.length) === pathprefix) {
				pathname = pathname.substr(pathprefix.length);
				match = potentialRoute.path.exec(pathname);
			} else {
				match = false;
			}
		} else {
			match = potentialRoute.path.exec(pathname);
		}
		if (match && request.method === potentialRoute.method) {
			state.params = [];
			for(var p=1; p<match.length; p++) {
				state.params.push(match[p]);
			}
			return potentialRoute;
		}
	}
	return null;
};

GitServer.prototype.checkCredentials = function(request,incomingUsername,incomingPassword) {
	var header = request.headers.authorization || "",
		token = header.split(/\s+/).pop() || "",
		auth = $tw.utils.base64Decode(token),
		parts = auth.split(/:/),
		username = parts[0],
		password = parts[1];
	if (incomingUsername === username && incomingPassword === password) {
		return "ALLOWED";
	} else {
		return "DENIED";
	}
};

GitServer.prototype.requestHandler = function(request,response) {
	// Compose the state object
	var self = this;
	var state = {};
	state.wiki = self.wiki;
	state.server = self;
	state.urlInfo = url.parse(request.url);
	// Find the route that matches this path
	var route = self.findMatchingRoute(request,state);
	// Check for the username and password if we've got one
	var username = self.get("username"),
		password = self.get("password");
	if (username && password) {
		// Check they match
		if (self.checkCredentials(request,username,password) !== "ALLOWED") {
			var servername = state.wiki.getTiddlerText("$:/SiteTitle") || "TiddlyWiki5";
			response.writeHead(401,"Authentication required",{
				"WWW-Authenticate": 'Basic realm="Please provide your username and password to login to ' + servername + '"'
			});
			response.end();
			return;
		}
	}
	// Return a 404 if we didn't find a route
	if (!route) {
		response.writeHead(404);
		response.end();
		return;
	}
	// Set the encoding for the incoming request
	// TODO: Presumably this would need tweaking if we supported PUTting binary tiddlers
	request.setEncoding("utf8");
	// Dispatch the appropriate method
	switch(request.method) {
		case "GET": // Intentional fall-through
		case "DELETE":
			route.handler(request,response,state);
			break;
		case "PUT":
		case "POST": // Intentional fall-through
			var data = "";
			request.on("data",function(chunk) {
				data += chunk.toString();
			});
			request.on("end",function() {
				state.data = data;
				route.handler(request,response,state);
			});
			break;
	}
};

GitServer.prototype.listen = function(port,host) {
	http.createServer(this.requestHandler.bind(this)).listen(port,host);
};

function toString(o) {
	if (typeof o === 'string') {
		return o;
	} else {
		return JSON.stringify(o);
	}
}

var Command = function(params,commander,callback) {
	this.params = params;
	this.commander = commander;
	this.callback = callback;
	// Set up server
	this.server = new GitServer({
		wiki: this.commander.wiki
	});
	// Add route handlers
	this.server.addRoute({
		method: "POST",
		path: /^\/save$/,
		handler: function(request, response, state) {
			save(state)
				.then(() => {
					response.writeHead(204, "OK");
					response.end();
				})
				.catch(e => {
					console.log(`Error saving: ${e}`);
					if (e.status) {
						response.writeHead(e.status, "Error");
						response.end($tw.utils.stringify(`${e.message}`), "utf8");
					} else {
						response.writeHead(500, "Server Error");
						response.end($tw.utils.stringify(`${e}`), "utf8");
					}
				})
				.catch(e => {
					console.log(`Unexpected error: ${e}`);
				});
		}
	});
	this.server.addRoute({
		method: "POST",
		path: /^\/update$/,
		handler: function(request, response, state) {
			update()
				.then(() => {
					response.writeHead(204, "OK");
					response.end();
				})
				.catch(e => {
					console.log(`Error updating: ${e}`);
					if (e.status) {
						response.writeHead(e.status, "Error");
						response.end($tw.utils.stringify(`${e.message}`), "utf8");
					} else {
						response.writeHead(500, "Server Error");
						response.end($tw.utils.stringify(`${e}`), "utf8");
					}
				});
		}
	});

	this.server.addRoute({
		method: "PUT",
		path: /^\/recipes\/default\/tiddlers\/(.+)$/,
		handler: function(request,response,state) {
			var title = decodeURIComponent(state.params[0]),
				fields = JSON.parse(state.data);
			// Pull up any subfields in the `fields` object
			if (fields.fields) {
				$tw.utils.each(fields.fields,function(field,name) {
					fields[name] = field;
				});
				delete fields.fields;
			}
			// Remove any revision field
			if (fields.revision) {
				delete fields.revision;
			}
			state.wiki.addTiddler(new $tw.Tiddler(state.wiki.getCreationFields(),fields,{title: title},state.wiki.getModificationFields()));
			var changeCount = state.wiki.getChangeCount(title).toString();
			response.writeHead(204, "OK",{
				Etag: "\"default/" + encodeURIComponent(title) + "/" + changeCount + ":\"",
				"Content-Type": "text/plain"
			});
			response.end();
		}
	});
	this.server.addRoute({
		method: "DELETE",
		path: /^\/bags\/default\/tiddlers\/(.+)$/,
		handler: function(request,response,state) {
			var title = decodeURIComponent(state.params[0]);
			state.wiki.deleteTiddler(title);
			response.writeHead(204, "OK", {
				"Content-Type": "text/plain"
			});
			response.end();
		}
	});
	this.server.addRoute({
		method: "GET",
		path: /^\/$/,
		handler: function(request,response,state) {
			response.writeHead(200, {"Content-Type": state.server.get("serveType")});
			var text = state.wiki.renderTiddler(state.server.get("renderType"),state.server.get("rootTiddler"));
			response.end(text,"utf8");
		}
	});
	this.server.addRoute({
		method: "GET",
		path: /^\/status$/,
		handler: function(request,response,state) {
			response.writeHead(200, {"Content-Type": "application/json"});
			var text = JSON.stringify({
				username: state.server.get("username"),
				space: {
					recipe: "default"
				},
				tiddlywiki_version: $tw.version
			});
			response.end(text,"utf8");
		}
	});
	this.server.addRoute({
		method: "GET",
		path: /^\/favicon.ico$/,
		handler: function(request,response,state) {
			response.writeHead(200, {"Content-Type": "image/x-icon"});
			var buffer = state.wiki.getTiddlerText("$:/favicon.ico","");
			response.end(buffer,"base64");
		}
	});
	this.server.addRoute({
		method: "GET",
		path: /^\/recipes\/default\/tiddlers.json$/,
		handler: function(request,response,state) {
			response.writeHead(200, {"Content-Type": "application/json"});
			var tiddlers = [];
			state.wiki.forEachTiddler({sortField: "title"},function(title,tiddler) {
				var tiddlerFields = {};
				$tw.utils.each(tiddler.fields,function(field,name) {
					if (name !== "text") {
						tiddlerFields[name] = tiddler.getFieldString(name);
					}
				});
				tiddlerFields.revision = state.wiki.getChangeCount(title);
				tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";
				tiddlers.push(tiddlerFields);
			});
			var text = JSON.stringify(tiddlers);
			response.end(text,"utf8");
		}
	});
	this.server.addRoute({
		method: "GET",
		path: /^\/recipes\/default\/tiddlers\/(.+)$/,
		handler: function(request,response,state) {
			var title = decodeURIComponent(state.params[0]),
				tiddler = state.wiki.getTiddler(title),
				tiddlerFields = {},
				knownFields = [
					"bag", "created", "creator", "modified", "modifier", "permissions", "recipe", "revision", "tags", "text", "title", "type", "uri"
				];
			if (tiddler) {
				$tw.utils.each(tiddler.fields,function(field,name) {
					var value = tiddler.getFieldString(name);
					if (knownFields.indexOf(name) !== -1) {
						tiddlerFields[name] = value;
					} else {
						tiddlerFields.fields = tiddlerFields.fields || {};
						tiddlerFields.fields[name] = value;
					}
				});
				tiddlerFields.revision = state.wiki.getChangeCount(title);
				tiddlerFields.type = tiddlerFields.type || "text/vnd.tiddlywiki";
				response.writeHead(200, {"Content-Type": "application/json"});
				response.end(JSON.stringify(tiddlerFields),"utf8");
			} else {
				response.writeHead(404);
				response.end();
			}
		}
	});
};

Command.prototype.execute = function() {
	if (!$tw.boot.wikiTiddlersPath) {
		$tw.utils.warning("Warning: Wiki folder '" + $tw.boot.wikiPath + "' does not exist or is missing a tiddlywiki.info file");
	}
	var port = this.params[0] || "8080",
		rootTiddler = this.params[1] || "$:/core/save/all",
		renderType = this.params[2] || "text/plain",
		serveType = this.params[3] || "text/html",
		username = this.params[4],
		password = this.params[5],
		host = this.params[6] || "127.0.0.1",
		pathprefix = this.params[7];
	this.server.set({
		rootTiddler: rootTiddler,
		renderType: renderType,
		serveType: serveType,
		username: username,
		password: password,
		pathprefix: pathprefix
	});
	this.server.listen(port,host);
	$tw.utils.log("GitServer!");
	$tw.utils.log("Serving on " + host + ":" + port, "brown/orange");
	$tw.utils.log("(press ctrl-C to exit)", "red");

	return null;
};

exports.Command = Command;

})();
