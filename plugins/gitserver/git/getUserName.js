/*\
title: $:/plugins/xscale/gitserver/git/getUserName.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');

module.exports = function() {
  return git.raw(
    [
      'config',
      '--global',
      'user.name'
    ]
  );
};

})();
