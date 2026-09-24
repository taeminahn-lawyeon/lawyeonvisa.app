#!/usr/bin/env node
'use strict';

// Verify the real GitHub Pages build before publishing changes to its file set.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '_site');
const directories = ['ko', 'vi', 'blog', 'css', 'js', 'images'];
const files = [
  'CNAME', 'robots.txt', 'sitemap.xml',
  'favicon.ico', 'favicon.png', 'apple-touch-icon.png'
];
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Unexpected symbolic link: ${file}`);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) files.push(entry.name);
}
for (const directory of directories) {
  files.push(...walk(path.join(root, directory)).map(file => path.relative(root, file)));
}
const expected = [...new Set(files)].sort();
const actual = walk(output).map(file => path.relative(output, file)).sort();
assert.deepEqual(actual, expected, 'Published files must match the public allowlist exactly');
for (const file of expected) {
  assert(fs.readFileSync(path.join(root, file)).equals(fs.readFileSync(path.join(output, file))),
    `Public file was changed by the publishing build: ${file}`);
}
console.log(`Verified ${expected.length} byte-identical public files, including ${expected.filter(f => f.endsWith('.html')).length} HTML pages; no source files published.`);
