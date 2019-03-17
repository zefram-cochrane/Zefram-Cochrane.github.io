/*\
title: $:/plugins/xscale/gitserver/git/readfile.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var fs = require('fs');

module.exports = function (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      file,
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.toString().split('\n'));
        }
      }
    )
  });
};

})();
