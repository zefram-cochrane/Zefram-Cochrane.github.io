/*\
title: $:/plugins/xscale/gitserver/git/update.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var revertUnwantedChanges = require('$:/plugins/xscale/gitserver/git/revertUnwantedChanges.js');
var mergeUpstream = require('$:/plugins/xscale/gitserver/git/mergeUpstream.js');

module.exports = function() {
  return assertIsRepo()
    .then(revertUnwantedChanges)
    .then(mergeUpstream);
};

})();
