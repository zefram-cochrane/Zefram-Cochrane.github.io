/*\
title: $:/plugins/xscale/gitserver/git/commitChanges.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');

module.exports = function() {
  $tw.utils.log("Commit changes...");
  return git.add('.')
    .then(() => git.status())
    .then(status => status.staged)
    .then(staged => {
      if (staged.length > 0) {
        return git.commit('Content updated via GitServer');
      }
    });
};

})();
