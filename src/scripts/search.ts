import type Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import type { Section } from '../lib/search-sections.ts';
import { FUSE_OPTIONS as OPTIONS } from '../lib/search-options.ts';
import { makeSnippet } from '../lib/snippet.ts';
import { readCache, writeCache } from './search-cache.ts';

const MAX_RESULTS = 10;

function el(tag: string, className: string, text: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

export function initSearch(root: HTMLElement) {
  const indexUrl = root.dataset.indexUrl!;
  const input = root.querySelector('input')!;
  const list = root.querySelector('ul')!;

  let fuse: Fuse<Section> | null = null;
  let failed = false;
  let loading: Promise<void> | null = null;
  let results: FuseResult<Section>[] = [];
  let selected = 0;
  let timer = 0;

  function refresh() {
    if (document.activeElement === input) update();
  }

  function load() {
    loading ??= (async () => {
      failed = false;
      try {
        const [{ default: FuseClass }, cached] = await Promise.all([import('fuse.js'), readCache<Section[]>()]);
        if (cached) {
          fuse = new FuseClass(cached.data, OPTIONS);
          refresh();
        }
        if (cached?.url === indexUrl) return;
        try {
          const res = await fetch(indexUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: Section[] = await res.json();
          fuse = new FuseClass(data, OPTIONS);
          refresh();
          await writeCache({ url: indexUrl, data });
        } catch {
          if (!fuse) throw new Error('no index');
        }
      } catch {
        failed = true;
        loading = null;
        refresh();
      }
    })();
    return loading;
  }

  function open() {
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function close() {
    list.hidden = true;
    results = [];
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function showStatus(text: string) {
    results = [];
    list.replaceChildren(el('li', 'r-status', text));
    open();
  }

  function renderResult(r: FuseResult<Section>, i: number): HTMLLIElement {
    const s = r.item;
    const li = document.createElement('li');
    li.id = `search-result-${i}`;
    li.setAttribute('role', 'option');

    const a = document.createElement('a');
    a.href = s.url;

    const title = el('span', 'r-title', s.article);
    if (s.heading) title.append(el('span', 'r-heading', ` › ${s.heading}`));

    const textMatch = s.text ? r.matches?.find((m) => m.key === 'text') : undefined;
    const snippet = el('span', 'r-snippet', '');
    for (const seg of makeSnippet(s.text || s.description, textMatch?.indices ?? [])) {
      snippet.append(seg.mark ? el('mark', '', seg.text) : document.createTextNode(seg.text));
    }

    a.append(title, snippet);
    li.append(a);
    return li;
  }

  function highlight() {
    [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === selected)));
    const active = list.children[selected];
    if (active) {
      input.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  function update() {
    clearTimeout(timer);
    timer = 0;
    const q = input.value.trim();
    if (q.length < 2) return close();
    if (!fuse) return showStatus(failed ? 'Search unavailable' : 'Loading...');
    results = fuse.search(q, { limit: MAX_RESULTS });
    selected = 0;
    if (!results.length) return showStatus('Nothing found');
    list.replaceChildren(...results.map(renderResult));
    open();
    highlight();
  }

  function go(url: string) {
    close();
    location.href = url;
  }

  input.addEventListener('focus', () => {
    load();
    update();
  });

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(update, 100);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (e.key === 'Enter' && timer) update();
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selected = (selected + 1) % results.length;
      highlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selected = (selected - 1 + results.length) % results.length;
      highlight();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[selected].item.url);
    }
  });

  list.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) close();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!root.contains(e.target as Node)) close();
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => load(), { timeout: 5000 });
  } else {
    setTimeout(load, 3000);
  }
}
