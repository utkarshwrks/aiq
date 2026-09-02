import { Prisma } from '@prisma/client';
import { hasDatabase, prisma } from '@/lib/prisma';
import { cached } from '@/lib/cache';
import {
  glossarySlug,
  SORTED_GLOSSARY,
  type GlossaryEntry,
} from '@/content/glossary';

/**
 * Glossary search.
 *
 * Two backends behind one function, on the same principle as the update
 * repository: Postgres full-text search when a database is configured,
 * and the in-process scored match over the authored file when it is not.
 * The product is required to run with no database attached, so search
 * cannot be the one feature that stops working without one.
 *
 * The Postgres path builds a weighted document per term - term name
 * heaviest, then aliases, then the definition - so a query matching a
 * headword outranks one that merely appears in prose. That weighting is
 * the reason to use `ts_rank` at all rather than a LIKE scan.
 */

export type SearchHit = {
  slug: string;
  term: string;
  definition: string;
  category: string;
  /** Relevance, higher is better. Comparable only within one result set. */
  rank: number;
};

/** Where a result came from, surfaced in the UI the way the feed's origin is. */
export type SearchOrigin = 'postgres' | 'local';

export type SearchResult = {
  hits: SearchHit[];
  origin: SearchOrigin;
};

const MAX_HITS = 40;

/**
 * The weighted tsvector for a row.
 *
 * A: the headword. B: aliases. C: the definition body. Postgres ranks
 * A-matches well above C-matches, which is exactly the ordering a reader
 * expects when they type a word they already half-know.
 *
 * Must stay character-identical to the expression the GIN index in
 * `scripts/seed-glossary.ts` is built on, or Postgres will not use the
 * index and every search becomes a sequential scan that still returns
 * the right answer - the failure mode that hides.
 */
const DOCUMENT = Prisma.sql`(
  setweight(to_tsvector('english', coalesce(term, '')), 'A') ||
  setweight(to_tsvector('english', coalesce("aliasText", '')), 'B') ||
  setweight(to_tsvector('english', coalesce(definition, '')), 'C')
)`;

async function postgresSearch(query: string): Promise<SearchHit[]> {
  // websearch_to_tsquery accepts what people actually type - bare words,
  // quoted phrases, OR - and never throws on malformed input, which
  // plainto_tsquery and to_tsquery both can.
  const rows = await prisma.$queryRaw<SearchHit[]>`
    SELECT slug, term, definition, category,
           ts_rank(${DOCUMENT}, websearch_to_tsquery('english', ${query})) AS rank
    FROM glossary_terms
    WHERE ${DOCUMENT} @@ websearch_to_tsquery('english', ${query})
    ORDER BY rank DESC, term ASC
    LIMIT ${MAX_HITS}
  `;

  return rows.map((row) => ({ ...row, rank: Number(row.rank) }));
}

/**
 * The no-database path. Scored rather than boolean, mirroring the
 * Postgres weighting closely enough that the two orderings agree on
 * everything a reader would notice.
 */
export function localSearch(query: string): SearchHit[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const scored = SORTED_GLOSSARY.map((entry: GlossaryEntry) => {
    const term = entry.term.toLowerCase();
    const aliases = entry.aliases?.map((alias) => alias.toLowerCase()) ?? [];
    const definition = entry.definition.toLowerCase();

    let rank = 0;
    if (term === needle) rank += 1;
    else if (term.startsWith(needle)) rank += 0.8;
    else if (term.includes(needle)) rank += 0.5;

    if (aliases.some((alias) => alias === needle)) rank += 0.6;
    else if (aliases.some((alias) => alias.includes(needle))) rank += 0.3;

    if (definition.includes(needle)) rank += 0.1;

    return { entry, rank };
  })
    .filter((result) => result.rank > 0)
    .sort((a, b) => b.rank - a.rank || a.entry.term.localeCompare(b.entry.term))
    .slice(0, MAX_HITS);

  return scored.map(({ entry, rank }) => ({
    slug: glossarySlug(entry.term),
    term: entry.term,
    definition: entry.definition,
    category: entry.category,
    rank,
  }));
}

export async function searchGlossary(query: string): Promise<SearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { hits: [], origin: hasDatabase() ? 'postgres' : 'local' };

  if (!hasDatabase()) return { hits: localSearch(trimmed), origin: 'local' };

  try {
    // Query strings repeat heavily - readers type the same dozen terms -
    // so a short TTL turns the common case into one Redis read.
    const hits = await cached(
      `glossary:v1:${trimmed.toLowerCase()}`,
      120,
      () => postgresSearch(trimmed),
    );
    // An unseeded table is not a working index. Answering "no results"
    // for a term that is plainly in the corpus is worse than answering
    // from the file.
    if (hits.length === 0) return { hits: localSearch(trimmed), origin: 'local' };
    return { hits, origin: 'postgres' };
  } catch (error) {
    console.error('[glossary] full-text search failed, matching locally', error);
    return { hits: localSearch(trimmed), origin: 'local' };
  }
}
