/*\
title: $:/plugins/xscale/gitserver/git/generateIndexHtml.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var fs = require('fs');

module.exports = function(state) {
  $tw.utils.log("Generating index.html...");
  return new Promise(
    (resolve, reject) => {
      fs.writeFile(
        'index.html',
        state.wiki.renderTiddler(state.server.get("renderType"),state.server.get("rootTiddler")),
        function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    }
  );
};

})();
