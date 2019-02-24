/*\
title: $:/plugins/xscale/gitserver/git/save.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');

var assertIsRepo = require('$:/plugins/xscale/gitserver/git/assertIsRepo.js');
var assertIsAttached = require('$:/plugins/xscale/gitserver/git/assertIsAttached.js');
var assertNamedEditor = require('$:/plugins/xscale/gitserver/git/assertNamedEditor.js');
var revertUnwantedChanges = require('$:/plugins/xscale/gitserver/git/revertUnwantedChanges.js');
var mergeUpstream = require('$:/plugins/xscale/gitserver/git/mergeUpstream.js');
var updateEditors = require('$:/plugins/xscale/gitserver/git/updateEditors.js');
var generateIndexHtml = require('$:/plugins/xscale/gitserver/git/generateIndexHtml.js');
var commitChanges = require('$:/plugins/xscale/gitserver/git/commitChanges.js');
var pushChanges = require('$:/plugins/xscale/gitserver/git/pushChanges.js');

module.exports = function(state) {
  return assertIsRepo()
    .then(assertIsAttached)
    .then(assertNamedEditor)
    .then(revertUnwantedChanges)
    .then(() => git.status())
    .then(status => status.files)
    .then(files => {
      if (files.length > 0) {
        return mergeUpstream()
          .then(updateEditors)
          .then(() => generateIndexHtml(state))
          .then(commitChanges)
          .then(pushChanges);
      }
    });
};

})();
