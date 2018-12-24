/*\
title: $:/plugins/xscale/gitserver/git/pushChanges.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');

module.exports = function() {
  $tw.utils.log("Push changes...");
  return git.push();
};

})();
