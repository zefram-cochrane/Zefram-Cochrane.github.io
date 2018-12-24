/*\
title: $:/plugins/xscale/gitserver/git/GitError.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

class GitError {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }
}

module.exports = GitError;

})();
