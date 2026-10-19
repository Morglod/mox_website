import { render } from 'astro:content';
import { getTutorialTree } from './tutorials.ts';
import { buildSections, hashOf, type SectionArticle } from './search-sections.ts';

export type SearchIndex = { json: string; hash: string; url: string };

let cached: Promise<SearchIndex> | undefined;

async function load(): Promise<SearchIndex> {
  const tree = await getTutorialTree();
  const articles: SectionArticle[] = [];
  for (const category of tree) {
    for (const a of category.articles) {
      const { headings } = await render(a.entry);
      articles.push({
        url: a.url,
        title: a.entry.data.title,
        category: category.title,
        description: a.entry.data.description,
        body: a.entry.body ?? '',
        headings,
      });
    }
  }
  const json = JSON.stringify(buildSections(articles));
  const hash = hashOf(json);
  return { json, hash, url: `/search/${hash}.json` };
}

export function getSearchIndex(): Promise<SearchIndex> {
  if (import.meta.env.DEV) return load();
  cached ??= load();
  return cached;
}
