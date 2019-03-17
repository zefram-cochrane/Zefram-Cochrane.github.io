/*\
title: $:/plugins/xscale/gitserver/git/updateEditors.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var git = require('$:/plugins/xscale/gitserver/git/git.js');
var readfile = require('$:/plugins/xscale/gitserver/git/readfile.js');
var writefile = require('$:/plugins/xscale/gitserver/git/writefile.js');
var getUserName = require("$:/plugins/xscale/gitserver/git/getUserName.js");

function appendEditor(file, name) {
  console.log(file, name);
  return readfile(file)
    .then(lines => {
      var newEditor = {
        name: name,
        timestamp: Date.now()
      };
      var editorsText = lines.find(l => l.startsWith('editors:'));
      var editors = editorsText ?
        JSON.parse(editorsText.replace('editors: ', '')).concat([newEditor]) :
        [newEditor];

      return [`editors: ${JSON.stringify(editors)}`]
        .concat(lines.filter(l => !l.startsWith('editors:')))
    })
    .then(content => writefile(file, content));
}

module.exports = function() {
  $tw.utils.log("Update editors...");
  return git.status()
    .then(
      statusSummary =>
        statusSummary.files
          .filter(f => f.working_dir !== 'D')
          .map(f => f.path)
    )
    .then(fs =>
      Array.from(new Set(fs)).map(f => f.replace(/^"/, '').replace(/"$/, ''))
    )
    .then(fs =>
      getUserName()
        .then(name => name.trim())
        .then(name =>
          fs.map(f => appendEditor(f, name))
        )
        .then(ps => Promise.all(ps))
    );
}

})();
