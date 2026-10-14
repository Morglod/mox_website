// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import mox from './src/mox.tmLanguage.json' with { type: 'json' };

export default defineConfig({
  site: 'https://mox-lang.dev',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      langs: [/** @type {any} */ (mox)],
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noopener', 'noreferrer'],
        },
      ],
    ],
  },
});
