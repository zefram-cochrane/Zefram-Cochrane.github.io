/*\
title: $:/plugins/xscale/gitserver/git/writefile.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var fs = require('fs');

module.exports = function (file, lines) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      file,
      Array.isArray(lines) ? lines.join('\n') : lines,
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    )
  });
};

})();
