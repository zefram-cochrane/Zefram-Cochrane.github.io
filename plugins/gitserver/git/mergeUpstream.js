/*\
title: $:/plugins/xscale/gitserver/git/mergeUpstream.js
type: application/javascript
module-type: lib
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var fs = require('fs');
var git = require('$:/plugins/xscale/gitserver/git/git.js');
var readfile = require('$:/plugins/xscale/gitserver/git/readfile.js');
var writefile = require('$:/plugins/xscale/gitserver/git/writefile.js');
var resetFile = require('$:/plugins/xscale/gitserver/git/resetFile.js');
var GitError = require("$:/plugins/xscale/gitserver/git/GitError.js");

function getFileName(path) {
  return path.replace(/^.*?([^\/]+)(.tid)?$/, '$1');
}

function splitPath(path) {
  return /(.*?)([^\/]+$)/.exec(path).slice(1);
}

function draftFileName(name) {
  return `Draft of '${name}'.tid`;
}

function exists(path) {
  return fs.existsSync(path);
}

function copy(src, dst, originalTitle, draftTitle) {
  return readfile(src)
    .then(lines => {
      var titleIndex = lines.findIndex(l => l.startsWith('title:'));
      return [
        `draft.of: ${originalTitle}`,
        `draft.title: ${originalTitle}`,
        `title: ${draftTitle}`
      ].concat(
        lines.filter(l =>
          !(
            l.startsWith('title:') ||
            l.startsWith('draft.of') ||
            l.startsWith('draft.title')
          )
        )
      );
    })
    .then(lines => writefile(dst, lines));
//   let titleSeen = false;
//   try {
//     fs.appendFileSync(
//       dst,
//       `draft.of: ${originalTitle}
// draft.title: ${originalTitle}
// title: ${draftTitle}
// `
//     );
//     fs.readFileSync(src).toString()
//       .split('\n')
//       .forEach(line => {
//         if (titleSeen || !line.startsWith('title:')) {
//           fs.appendFileSync(dst, `${line}\n`);
//         } else {
//           titleSeen = true;
//         }
//       });
//     return Promise.resolve();
//   } catch (e) {
//     return Promise.reject(e);
//   }
}

function getBaseName(file) {
  const name = file.replace(/\.tid$/, '');
  if (name.startsWith('Draft of')) {
    return name.replace(/^Draft of '/, '').replace(/'$/, '');
  } else {
    return name;
  }
}

function createDraft(file) {
  const parts = splitPath(file);
  const basePath = parts[0];
  const name = parts[1];
  const baseName = getBaseName(name);

  let i = 0;
  while(true) {
    const f = draftFileName(baseName + (i > 0 ? `_${i}` : ''));
    const draftFile = basePath + f;

    if (!exists(draftFile)) {
      return copy(file, draftFile, baseName, f);
    }

    i += 1;
  }
}

function resolveConflicts() {
  $tw.utils.log("Resolving conflicts...");
  return git.status()
    .then(statusSummary => statusSummary.conflicted)
    .then(
      conflicted =>
        Promise.all(
          conflicted
            .map(
              f =>
                createDraft(f)
                  .then(() => resetFile(f))
            )
        )
          .then(() => git.reset())
          .then(() => git.stash(['drop']))
          .then(() =>
            Promise.reject(
              new GitError(
                400,
                'There were conflicts mering the following:\n' +
                conflicted.map(getFileName).map(s => '  ' + s).join("\n") + '\n\n' +
                'Your changes have been saved in draft tiddlers.'
              )
            )
          )
    );
}

module.exports = function() {
  $tw.utils.log("Merge upstream...");
  return git.status()
    .then(statusSummary => statusSummary.files)
    .then(
      changedFiles =>
        changedFiles.length > 0 ?
          git.stash(['--include-untracked'])
            .then(() => git.pull())
            .then(() => git.stash(['pop']))
            .then(r => {
              if (r.includes('Merge conflict in')) {
                return resolveConflicts();
              } else {
                return null;
              }
            })
            .catch(e =>
              git.stash(['pop'])
                .then(() => Promise.reject(e))
            ) :
          null
    );
};

})();
