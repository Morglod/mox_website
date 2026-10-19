import type { APIRoute, GetStaticPaths } from 'astro';
import { getSearchIndex } from '../../lib/search-index.ts';

export const getStaticPaths = (async () => {
  const { hash } = await getSearchIndex();
  return [{ params: { hash } }];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async () => {
  const { json } = await getSearchIndex();
  return new Response(json, { headers: { 'Content-Type': 'application/json' } });
};
