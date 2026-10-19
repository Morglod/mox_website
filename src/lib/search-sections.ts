import { createHash } from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Heading, Nodes } from 'mdast';

export type Section = {
  url: string;
  article: string;
  category: string;
  heading: string;
  description: string;
  text: string;
};

export type SectionArticle = {
  url: string;
  title: string;
  category: string;
  description: string;
  body: string;
  headings: { slug: string }[];
};

const parser = unified().use(remarkParse).use(remarkGfm);
const BLOCK = new Set(['paragraph', 'heading', 'listItem', 'blockquote', 'tableRow', 'tableCell']);

function textOf(node: Nodes): string {
  if (node.type === 'code' || node.type === 'html') return '';
  let out = 'value' in node ? node.value : '';
  if ('children' in node) {
    for (const child of node.children) out += textOf(child);
  }
  return BLOCK.has(node.type) ? out + ' ' : out;
}

function collectHeadings(node: Nodes, out: Heading[]): Heading[] {
  if (node.type === 'heading') out.push(node);
  if ('children' in node) {
    for (const child of node.children) collectHeadings(child, out);
  }
  return out;
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

export function buildSections(articles: SectionArticle[]): Section[] {
  const sections: Section[] = [];

  for (const a of articles) {
    const tree = parser.parse(a.body);
    const headings = collectHeadings(tree, []);
    let pageHeadings = a.headings;
    // remark-rehype appends a "Footnotes" heading that has no markdown source.
    if (tree.children.some((n) => n.type === 'footnoteDefinition') && pageHeadings.at(-1)?.slug === 'footnote-label') {
      pageHeadings = pageHeadings.slice(0, -1);
    }
    if (headings.length !== pageHeadings.length) {
      throw new Error(`${a.url}: found ${headings.length} headings but the page has ${pageHeadings.length}`);
    }
    // Astro's ids are the source of truth; match its headings to ours by document order.
    const slugOf = new Map(headings.map((h, i) => [h, pageHeadings[i].slug]));

    let current: Section = { url: a.url, article: a.title, category: a.category, heading: '', description: a.description, text: '' };
    sections.push(current);

    for (const node of tree.children) {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        current = {
          url: `${a.url}#${slugOf.get(node)}`,
          article: a.title,
          category: a.category,
          heading: clean(textOf(node)),
          description: '',
          text: '',
        };
        sections.push(current);
      } else {
        current.text += textOf(node);
      }
    }
  }

  for (const s of sections) s.text = clean(s.text);
  return sections;
}

export function hashOf(json: string): string {
  return createHash('sha256').update(json).digest('hex').slice(0, 10);
}
