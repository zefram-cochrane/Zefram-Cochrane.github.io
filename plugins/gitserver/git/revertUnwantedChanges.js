/*\
title: $:/plugins/xscale/gitserver/git/revertUnwantedChanges.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var resetFile = require('$:/plugins/xscale/gitserver/git/resetFile.js');
var git = require('$:/plugins/xscale/gitserver/git/git.js');

var blackList = [
  'tiddlers/favicon.ico',
  'favicon.ico',
  'index.html'
];

function inBlackList(file) {
  return Promise.resolve(blackList.includes(file));
}

function changeLines(diffString) {
  return (diffString.match(/[^\r\n]+/g) || [])
    .filter(
      l =>
        (l.startsWith('+') || l.startsWith('-')) &&
        !(l.startsWith('+++') || l.startsWith('---'))
    )
    .map(l => l.substring(1));
}

function isDate(changeLine) {
  return changeLine.startsWith('created: ') ||
    changeLine.startsWith('modified: ') ||
      changeLine.startsWith('type: ');
}

function onlyTimeChanges(file) {
  return git.diff(['--', file])
    .then(
      diffString =>
        changeLines(diffString)
          .filter(l => !isDate(l))
          .length === 0
    );
}

function shouldReset(f) {
  return Promise.all([inBlackList(f), onlyTimeChanges(f)])
    .then(
      preds =>
        preds.reduce(
          (acc, p) => acc || p,
          false
        )
    );
}

module.exports = function() {
  $tw.utils.log("Revert unwanted changes...");
  return git.status()
    .then(statusSummary => statusSummary.modified)
    .then(
      modified =>
        modified
          .map(f => f.replace(/^"(.*?)"$/, '$1'))
          .map(
            f =>
              shouldReset(f)
                .then(
                  shouldReset =>
                    shouldReset && resetFile(f)
                )
          )
    )
    .then(ps => Promise.all(ps));
}

})();
