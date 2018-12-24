/*\
title: $:/plugins/xscale/gitserver/git/resetFile.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');

module.exports = function(file) {
  $tw.utils.log(`Resetting ${file}...`);
  return git.raw(
    [
      'checkout',
      'HEAD',
      '--',
      file
    ]
  );
};

})();
