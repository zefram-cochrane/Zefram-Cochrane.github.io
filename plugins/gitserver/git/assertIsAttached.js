/*\
title: $:/plugins/xscale/gitserver/git/assertIsAttached.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');
var GitError = require("$:/plugins/xscale/gitserver/git/GitError.js");

module.exports = function() {
  $tw.utils.log("Assert HEAD is attached...");
  return git.branch()
    .then(summary => {
      if (!summary.detached) {
        return null;
      } else {
        return Promise.reject(
          new GitError(
            400,
            "Current project has a detached head, aborting to avoid data loss.\n" +
            "Please see ???"
          )
        );
      }
    });
};

})();
