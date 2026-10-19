export type Segment = { text: string; mark: boolean };
export type Range = readonly [number, number];

export function makeSnippet(text: string, ranges: readonly Range[], radius = 60): Segment[] {
  const useful = ranges.filter(([s, e]) => e > s).toSorted((a, b) => a[0] - b[0]);

  if (useful.length === 0) {
    const max = radius * 2;
    return [{ text: text.length > max ? text.slice(0, max) + '…' : text, mark: false }];
  }

  const [firstStart, firstEnd] = useful[0];
  const start = Math.max(0, firstStart - radius);
  const end = Math.min(text.length, firstEnd + 1 + radius);

  const out: Segment[] = [];
  if (start > 0) out.push({ text: '…', mark: false });

  let pos = start;
  for (const [s, e] of useful) {
    const from = Math.max(s, pos);
    const to = Math.min(e + 1, end);
    if (from >= to) continue;
    if (from > pos) out.push({ text: text.slice(pos, from), mark: false });
    out.push({ text: text.slice(from, to), mark: true });
    pos = to;
  }
  if (pos < end) out.push({ text: text.slice(pos, end), mark: false });
  if (end < text.length) out.push({ text: '…', mark: false });
  return out;
}
