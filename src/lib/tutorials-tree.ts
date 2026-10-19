export type CategoryConfig = { id: string; title: string };
export type ArticleInput = { id: string; data: { title: string; description: string; order: number } };
export type TreeArticle<T> = { entry: T; slug: string; url: string };
export type TreeCategory<T> = { id: string; title: string; articles: TreeArticle<T>[] };

export function buildTree<T extends ArticleInput>(entries: T[], categories: CategoryConfig[]): TreeCategory<T>[] {
  const tree: TreeCategory<T>[] = categories.map((c) => ({ id: c.id, title: c.title, articles: [] }));
  const byId = new Map(tree.map((c) => [c.id, c]));

  for (const entry of entries) {
    const parts = entry.id.split('/');
    if (parts.length !== 2) {
      throw new Error(`Tutorial "${entry.id}" must be at <category>/<article>.md`);
    }
    const [categoryId, slug] = parts;
    const category = byId.get(categoryId);
    if (!category) {
      throw new Error(`Tutorial "${entry.id}": category "${categoryId}" is not in categories.json`);
    }
    category.articles.push({ entry, slug, url: `/tutorials/${categoryId}/${slug}/` });
  }

  for (const c of tree) {
    c.articles.sort((a, b) => a.entry.data.order - b.entry.data.order || a.entry.data.title.localeCompare(b.entry.data.title));
  }
  return tree.filter((c) => c.articles.length > 0);
}

export function neighbors<T>(tree: TreeCategory<T>[], url: string): { prev?: TreeArticle<T>; next?: TreeArticle<T> } {
  const flat = tree.flatMap((c) => c.articles);
  const i = flat.findIndex((a) => a.url === url);
  if (i < 0) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
