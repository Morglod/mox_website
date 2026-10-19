import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fuse from 'fuse.js';
import { FUSE_OPTIONS } from './search-options.ts';

const sections = [
  {
    url: '/tutorials/basics/hello-world/',
    article: 'Hello world',
    category: 'Basics',
    heading: '',
    description: 'Write, build and run your first Mox program.',
    text: 'This tutorial shows the smallest Mox program and how to build it.',
  },
  {
    url: '/tutorials/comptime/run/#the-run-directive',
    article: 'Running code at compile time',
    category: 'Compile time',
    heading: 'The #run directive',
    description: '',
    text: '#run executes an expression while the compiler works.',
  },
];

const fuse = new Fuse(sections, FUSE_OPTIONS);

test('words in any order all have to match, each one fuzzy', () => {
  assert.equal(fuse.search('build program')[0]?.item.article, 'Hello world');
  assert.equal(fuse.search('program buld')[0]?.item.article, 'Hello world');
  assert.equal(fuse.search('compiler expression')[0]?.item.heading, 'The #run directive');
});

test('a word that matches nothing gives no results', () => {
  assert.equal(fuse.search('build zzqqxx').length, 0);
});

test('match ranges are still reported for highlighting', () => {
  const r = fuse.search('compiler')[0];
  assert.ok(r.matches?.some((m) => m.key === 'text' && m.indices.length > 0));
});
