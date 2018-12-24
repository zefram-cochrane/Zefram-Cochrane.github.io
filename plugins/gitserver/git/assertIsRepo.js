/*\
title: $:/plugins/xscale/gitserver/git/assertIsRepo.js
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
  $tw.utils.log("Assert is repo...");
  return git.checkIsRepo()
    .then(isRepo => {
      if (isRepo) {
        return null;
      } else {
        return Promise.reject(
          new GitError(
            400,
            "Current project is not a valid git repository.\n" +
            "Please see ???"
          )
        );
      }
    });
};

})();
