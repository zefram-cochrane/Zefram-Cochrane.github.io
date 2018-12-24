/*\
title: $:/plugins/xscale/gitserver/git/updateEditors.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');
var getUserName = require("$:/plugins/xscale/gitserver/git/getUserName.js");

module.exports = function() {
  $tw.utils.log("Update editors...");
  return git.status()
    .then(
      statusSummary =>
        statusSummary.files
          .filter(f => f.working_dir !== 'D')
          .map(f => f.path)
    )
    .then(fs => Array.from(new Set(fs)))
}

})();
