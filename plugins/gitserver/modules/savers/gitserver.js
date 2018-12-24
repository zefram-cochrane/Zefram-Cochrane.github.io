/*\
title: $:/plugins/xscale/gitserver/modules/savers/postgitserver.js
type: application/javascript
module-type: saver

Saves wiki by performing a POST request to the server

Works with any server which accepts a PPST request
to [hostname]/save, such as a WebDAV server.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Select the appropriate saver module and set it up
*/
var GitServerSaver = function(wiki) {
	this.wiki = wiki;
	var self = this;
	var uri = this.uri();
	// Retrieve ETag if available
	$tw.utils.httpRequest({
		url: uri,
		type: "HEAD",
		callback: function(err, data, xhr) {
			if (!err) {
				self.etag = xhr.getResponseHeader("ETag");
			}
		}
	});
};

GitServerSaver.prototype.uri = function() {
	return document.location.protocol + "//" + document.location.host;
};

GitServerSaver.prototype.save = function(text, method, callback) {
	this.request("/save", callback);
	return true;
};

GitServerSaver.prototype.update = function(text, method, callback) {
	this.request("/update", callback);
	return true;
};

// callback - status, data
GitServerSaver.prototype.request = function(path, callback) {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if(this.readyState === XMLHttpRequest.DONE) {
			if (this.status === 200 || this.status === 201 || this.status === 204) {
				callback(null); // success
			} else {
				callback(this.responseText); // fail
			}
		}
	};
	request.open("POST", this.uri() + path, true);
	request.send(null);
	return request;
};

/*
Information about this saver
*/
GitServerSaver.prototype.info = {
	name: "GitServerSaver",
	priority: 1000000,
	capabilities: ["save"]
};

/*
Static method that returns true if this saver is capable of working
*/
exports.canSave = function(wiki) {
	return /^https?:/.test(location.protocol);
};

/*
Create an instance of this saver
*/
exports.create = function(wiki) {
	return new GitServerSaver(wiki);
};

})();
