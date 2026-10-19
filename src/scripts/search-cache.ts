const KEY = 'mox-search-index';

export type CachedIndex<T> = { url: string; data: T };

export async function readCache<T>(): Promise<CachedIndex<T> | null> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(value: CachedIndex<T>): Promise<void> {
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // storage blocked or full: search still works, just without the cache
  }
}
