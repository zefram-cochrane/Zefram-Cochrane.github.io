[![Build Status](https://travis-ci.org/XSCALE-Alliance/wiki.svg?branch=master)](https://travis-ci.org/XSCALE-Alliance/wiki)

# XSCALE wiki
The repo for the beautiful xscale.wiki site.

## How to run the wiki locally

You need to have [Node.js] installed.

Install the tiddlywiki node server by typing
```
npm install
```

Then run the server by typing
```
npm run tiddlywiki -- . --server
```

Now use your favorite browser to view the wiki at http://127.0.0.1:8080.

## Testing tiddlers

To test the correctness of the tiddlers in `./tiddlers` run
```
npm test
```

#Building

To build the static site run
```
npm run build
```

## How to contribute

TBD

Thank you for your contributions!

 [Node.js]: https://nodejs.org/
 [Contributing]: http://127.0.0.1:8080/#Contributing
 [Contributors]: http://127.0.0.1:8080/#Contributors
 [editing the wiki]: http://127.0.0.1:8080/#Editing%20the%20Wiki
