/**
 * Prints the ingestion source table for SOURCES.md straight from the
 * registry, so the document cannot drift from what the worker reads.
 *
 *   node scripts/sources-table.mjs
 */
import { readFileSync } from 'node:fs';

const src = readFileSync('src/lib/sources.ts', 'utf8');

const KIND_LABEL = {
  RSS: 'RSS',
  ATOM: 'Atom',
  JSON_API: 'Public API',
  NEWS_SEARCH: 'News search',
  HTML: 'Page markup',
};

const entries = [...src.matchAll(/\{\s*slug: '([^']+)',\s*name: '([^']*(?:\\'[^']*)*)',\s*homepage: '([^']+)',[\s\S]*?kind: '([A-Z_]+)',\s*region: '([A-Z]+)',/g)];

const rows = entries.map(([, slug, name, homepage, kind, region]) => ({
  slug,
  name: name.replace(/\\'/g, "'"),
  homepage,
  kind: KIND_LABEL[kind] ?? kind,
  region: region === 'INDIA' ? 'India' : 'Global',
}));

for (const region of ['Global', 'India']) {
  const scoped = rows.filter((r) => r.region === region);
  console.log(`\n### ${region} (${scoped.length})\n`);
  console.log('| Source | Read as |');
  console.log('| --- | --- |');
  for (const row of scoped) {
    console.log(`| [${row.name}](${row.homepage}) | ${row.kind} |`);
  }
}
