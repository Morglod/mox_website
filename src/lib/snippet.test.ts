import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeSnippet } from './snippet.ts';

const join = (segs: { text: string }[]) => segs.map((s) => s.text).join('');
const marks = (segs: { text: string; mark: boolean }[]) => segs.filter((s) => s.mark).map((s) => s.text);

test('no ranges: short text as is', () => {
  assert.deepEqual(makeSnippet('short', []), [{ text: 'short', mark: false }]);
});

test('no ranges: long text cut with ellipsis', () => {
  const out = makeSnippet('x'.repeat(300), [], 10);
  assert.equal(join(out), 'x'.repeat(20) + '…');
  assert.deepEqual(marks(out), []);
});

test('match in the middle gets a window and ellipsis on both sides', () => {
  const text = 'a'.repeat(100) + 'match' + 'b'.repeat(100);
  const out = makeSnippet(text, [[100, 104]], 10);
  assert.equal(join(out), '…' + 'a'.repeat(10) + 'match' + 'b'.repeat(10) + '…');
  assert.deepEqual(marks(out), ['match']);
});

test('match at the start and end: no ellipsis on that side', () => {
  assert.equal(join(makeSnippet('match rest', [[0, 4]], 10)), 'match rest');
  assert.equal(join(makeSnippet('rest match', [[5, 9]], 10)), 'rest match');
});

test('overlapping ranges mark text once', () => {
  const text = 'abcdefghij';
  const out = makeSnippet(text, [[2, 5], [4, 8]], 20);
  assert.equal(join(out), text);
  assert.deepEqual(marks(out), ['cdef', 'ghi']);
});

test('single-char ranges are ignored', () => {
  assert.deepEqual(marks(makeSnippet('abc', [[1, 1]])), []);
});

test('ranges outside the window are dropped', () => {
  const text = 'ab' + 'x'.repeat(600) + 'cd';
  const out = makeSnippet(text, [[0, 1], [602, 603]], 10);
  assert.deepEqual(marks(out), ['ab']);
});

test('markup-like text is kept as literal text', () => {
  const text = '<b>x</b> & foo';
  const out = makeSnippet(text, [[11, 13]], 20);
  assert.equal(join(out), text);
  assert.deepEqual(marks(out), ['foo']);
});
