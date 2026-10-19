import type { IFuseOptions } from 'fuse.js';
import type { Section } from './search-sections.ts';

export const FUSE_OPTIONS: IFuseOptions<Section> = {
  keys: [
    { name: 'article', weight: 3 },
    { name: 'heading', weight: 2 },
    { name: 'description', weight: 1.5 },
    { name: 'text', weight: 1 },
  ],
  // Spaces mean AND between fuzzy words, so "build program" works.
  useExtendedSearch: true,
  includeMatches: true,
  ignoreLocation: true,
  threshold: 0.35,
  minMatchCharLength: 2,
};
