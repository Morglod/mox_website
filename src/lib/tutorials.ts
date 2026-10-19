import { getCollection, type CollectionEntry } from 'astro:content';
import categories from '../content/tutorials/categories.json';
import { buildTree, type TreeCategory } from './tutorials-tree.ts';

export type TutorialEntry = CollectionEntry<'tutorials'>;

let cached: Promise<TreeCategory<TutorialEntry>[]> | undefined;

function load() {
  return getCollection('tutorials').then((entries) => buildTree(entries, categories));
}

export function getTutorialTree(): Promise<TreeCategory<TutorialEntry>[]> {
  if (import.meta.env.DEV) return load();
  cached ??= load();
  return cached;
}
