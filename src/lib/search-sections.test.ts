import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSections, hashOf } from './search-sections.ts';

const URL = '/tutorials/basics/x/';
const art = (body: string, slugs: string[]) => ({
  url: URL,
  title: 'X Title',
  category: 'Basics',
  description: 'Desc',
  body,
  headings: slugs.map((slug) => ({ slug })),
});

test('intro plus one section per h2/h3, code blocks skipped, h4 stays in text', () => {
  const body = [
    'Intro text.',
    '## First',
    'Alpha `inline` beta.',
    '```mox\nsecret_code();\n```',
    '### Sub',
    'Gamma.',
    '#### Deep',
    'Delta.',
  ].join('\n\n');
  const s = buildSections([art(body, ['first', 'sub', 'deep'])]);
  assert.deepEqual(
    s.map((x) => [x.url, x.heading, x.text]),
    [
      [URL, '', 'Intro text.'],
      [`${URL}#first`, 'First', 'Alpha inline beta.'],
      [`${URL}#sub`, 'Sub', 'Gamma. Deep Delta.'],
    ],
  );
  assert.ok(!JSON.stringify(s).includes('secret_code'));
});

test('code inside lists is skipped too', () => {
  const s = buildSections([art('- item one\n\n  ```\n  hidden();\n  ```\n- item two\n', [])]);
  assert.equal(s[0].text, 'item one item two');
});

test('article, category on every section, description only on intro', () => {
  const s = buildSections([art('Hi.\n\n## A\n\nB.\n', ['a'])]);
  assert.equal(s[0].description, 'Desc');
  assert.equal(s[1].description, '');
  assert.ok(s.every((x) => x.article === 'X Title' && x.category === 'Basics'));
});

test('empty article still has one entry, so the title is searchable', () => {
  const s = buildSections([art('', [])]);
  assert.deepEqual(s, [{ url: URL, article: 'X Title', category: 'Basics', heading: '', description: 'Desc', text: '' }]);
});

test('anchors come from page headings by order, counting h1 and nested headings', () => {
  const body = '# Top\n\n## Same\n\n> ## Quoted\n\n## Same\n\n## With `code` and *em*\n';
  const s = buildSections([art(body, ['top', 'same', 'quoted', 'same-1', 'with-code-and-em'])]);
  assert.deepEqual(
    s.map((x) => x.url),
    [URL, `${URL}#same`, `${URL}#same-1`, `${URL}#with-code-and-em`],
  );
  assert.equal(s[0].text, 'Top');
  assert.equal(s[1].text, 'Quoted');
  assert.equal(s[3].heading, 'With code and em');
});

test('heading count mismatch fails loudly', () => {
  assert.throws(() => buildSections([art('## A\n', [])]), /found 1 headings but the page has 0/);
});

test('footnotes: the extra "Footnotes" heading Astro adds is ignored', () => {
  const s = buildSections([art('Text[^1]\n\n## A\n\nBody.\n\n[^1]: the note\n', ['a', 'footnote-label'])]);
  assert.deepEqual(
    s.map((x) => x.url),
    [URL, `${URL}#a`],
  );
  assert.equal(s[1].text, 'Body. the note');
});

test('gfm tables are indexed as plain words', () => {
  const s = buildSections([art('| a | b |\n|---|---|\n| foo | bar |\n', [])]);
  assert.equal(s[0].text, 'a b foo bar');
});

test('hashOf is stable 10-char hex', () => {
  assert.match(hashOf('x'), /^[0-9a-f]{10}$/);
  assert.equal(hashOf('x'), hashOf('x'));
  assert.notEqual(hashOf('x'), hashOf('y'));
});
