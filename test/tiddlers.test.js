const fs = require('fs');

function parseAllTiddlers() {
  function parseTiddlerFile(f) {
    const lines = fs.readFileSync(f).toString().split(/\r?\n/g);

    let metadata = {};

    for (let i in lines) {
      const l = lines[i];
      if (l.trim() === '') {
        break;
      }
      if (l.indexOf(':') > 0) {
        const [key, value] = l.split(': ', 2);
        metadata[key] = value;
      } else {
        // invalid metadata
        metadata = {};
        break;
      }
    }

    return {
      name: f.replace(/tiddlers\//, ''),
      metadata,
      toString: () => f.replace(/tiddlers\//, '')
    };
  }
  return fs.readdirSync('tiddlers')
    .filter(f => f.endsWith('.tid'))
    .map(f => `tiddlers/${f}`)
    .map(parseTiddlerFile);
}

describe('tiddlers', () => {

  const tiddlers = parseAllTiddlers();

  test.each(tiddlers)('%s should have at least one metadata field and all fields should be valid', tiddler => {
    expect(Object.keys(tiddler.metadata).length).toBeGreaterThan(0);
  });

  test('should have valid metadata', () => {

  });

  test.each(tiddlers)('%s should contain a title (non-system)', tiddler => {
    if (!tiddler.name.startsWith('$')) {
      expect(Object.keys(tiddler.metadata))
        .toContain('title')
    }
  });

  test.each(tiddlers)('%s should not be drafts', tiddler => {
    expect(tiddler.name).toEqual(expect.not.stringMatching(/^Draft of/));
    expect(Object.keys(tiddler.metadata))
      .not.toContain('draft.of');
    expect(Object.keys(tiddler.metadata))
      .not.toContain('draft.title');
  });

  test.each(tiddlers)('%s should be of type "text/vnd.tiddlywiki" (non-system)', tiddler => {
    if (!tiddler.name.startsWith('$')) {
      expect(tiddler.metadata['type']).toEqual('text/vnd.tiddlywiki');
    }
  })
});
