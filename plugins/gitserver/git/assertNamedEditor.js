/*\
title: $:/plugins/xscale/gitserver/git/assertNamedEditor.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var GitError = require("$:/plugins/xscale/gitserver/git/GitError.js");
var getUserName = require("$:/plugins/xscale/gitserver/git/getUserName.js");

module.exports = function() {
  $tw.utils.log("Assert named editor...");
  return getUserName()
    .then(
      r => {
        if (r.trim()) {
          return null;
        } else {
          return Promise.reject(
            new GitError(
              400,
              "Saving requires a git editor name.\n" +
              "Please see ???"
            )
          );
        }
      },
      e => Promise.reject(new GitError(500, e.message))
    );
};

})();
