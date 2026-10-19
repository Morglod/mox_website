import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTree, neighbors } from './tutorials-tree.ts';

const cats = [
  { id: 'basics', title: 'Basics' },
  { id: 'comptime', title: 'Compile time' },
  { id: 'empty', title: 'Empty' },
];
const e = (id: string, title: string, order: number) => ({ id, data: { title, description: '', order } });

test('groups by category in categories.json order, sorts by order then title', () => {
  const tree = buildTree(
    [e('comptime/run', 'Run', 1), e('basics/b', 'Bbb', 2), e('basics/a2', 'Zed', 1), e('basics/a1', 'Abc', 1)],
    cats,
  );
  assert.deepEqual(tree.map((c) => c.id), ['basics', 'comptime']);
  assert.deepEqual(tree[0].articles.map((a) => a.slug), ['a1', 'a2', 'b']);
  assert.equal(tree[0].articles[0].url, '/tutorials/basics/a1/');
  assert.equal(tree[1].title, 'Compile time');
});

test('drops categories with no articles', () => {
  const tree = buildTree([e('basics/a', 'A', 1)], cats);
  assert.deepEqual(tree.map((c) => c.id), ['basics']);
});

test('unknown category fails the build', () => {
  assert.throws(() => buildTree([e('nope/x', 'X', 1)], cats), /"nope" is not in categories\.json/);
});

test('article must be exactly one folder deep', () => {
  assert.throws(() => buildTree([e('basics/sub/x', 'X', 1)], cats), /<category>\/<article>\.md/);
  assert.throws(() => buildTree([e('x', 'X', 1)], cats), /<category>\/<article>\.md/);
});

test('neighbors follow sidebar order across categories', () => {
  const tree = buildTree([e('basics/a', 'A', 1), e('basics/b', 'B', 2), e('comptime/c', 'C', 1)], cats);
  const mid = neighbors(tree, '/tutorials/basics/b/');
  assert.equal(mid.prev?.slug, 'a');
  assert.equal(mid.next?.slug, 'c');
  assert.equal(neighbors(tree, '/tutorials/basics/a/').prev, undefined);
  assert.equal(neighbors(tree, '/tutorials/comptime/c/').next, undefined);
  assert.deepEqual(neighbors(tree, '/nope/'), {});
});
