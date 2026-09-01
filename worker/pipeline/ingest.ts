import type { SourceDefinition } from '../../src/lib/sources';
import type { NormalisedItem, SourceResult } from '../types';
import { scraperFor } from '../scrapers';
import { activeClassifier, isQuantumRelevant, regionFor } from './classify';
import { cleanText, parseDate, urlHash } from './normalize';
import { activeSummariser } from './summarise';

/**
 * The pipeline proper: fetch, clean, filter, classify, summarise,
 * deduplicate. Persistence is deliberately not here - this module
 * returns items and lets the caller decide where they go, which is what
 * makes it runnable as a dry run against live sources without a database
 * anywhere in the picture.
 */

/** Items older than this are not worth ingesting into a live panel. */
const MAX_AGE_DAYS = 120;

export type IngestOptions = {
  /** Cap per source, so one prolific feed cannot dominate a run. */
  limit?: number;
  /** Hashes already held, so known items are skipped before summarising. */
  known?: ReadonlySet<string>;
};

export type SourceIngest = {
  result: SourceResult;
  items: NormalisedItem[];
};

function tooOld(date: Date): boolean {
  const age = Date.now() - date.getTime();
  return age > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Runs one source end to end. Never throws: a failing source is recorded
 * in its own result and the scheduler carries on, because one publisher
 * changing their markup must not take down the whole ingestion.
 */
export async function ingestSource(
  source: SourceDefinition,
  options: IngestOptions = {},
): Promise<SourceIngest> {
  const { limit = 30, known } = options;

  const result: SourceResult = {
    slug: source.slug,
    seen: 0,
    stored: 0,
    skipped: 0,
    ok: true,
  };

  let raw;
  try {
    raw = await scraperFor(source)(source);
  } catch (error) {
    result.ok = false;
    result.error =
      error instanceof Error ? error.message.slice(0, 240) : 'unknown error';
    return { result, items: [] };
  }

  result.seen = raw.length;

  const items: NormalisedItem[] = [];
  // Within-run deduplication. Feeds regularly repeat an item under two
  // links, and the batch would otherwise conflict with itself on insert.
  const seenHashes = new Set<string>();

  for (const entry of raw) {
    if (items.length >= limit) break;

    const title = cleanText(entry.title);
    if (title.length < 12) {
      result.skipped += 1;
      continue;
    }

    const hash = urlHash(entry.url);
    if (seenHashes.has(hash) || known?.has(hash)) {
      result.skipped += 1;
      continue;
    }

    const rawSummary = cleanText(entry.summary);

    // General-interest feeds are filtered against the quantum vocabulary
    // before anything else is spent on them.
    if (source.requiresKeywordFilter && !isQuantumRelevant(title, rawSummary)) {
      result.skipped += 1;
      continue;
    }

    // An index page that carries no date leaves us with first sighting,
    // which is recorded as such rather than passed off as a publication
    // time. The ranking downstream keeps these below dated items.
    const parsed = parseDate(entry.publishedAt);
    const published = parsed ?? new Date();
    if (tooOld(published)) {
      result.skipped += 1;
      continue;
    }

    // An HTML index gives a headline and nothing else, so there is no
    // description to compress. The headline is the whole signal, and the
    // panel renders those items without a summary line rather than
    // fabricating one.
    const summary = activeSummariser(rawSummary, title) ?? '';
    if (source.kind !== 'HTML' && summary.length === 0) {
      result.skipped += 1;
      continue;
    }

    seenHashes.add(hash);
    items.push({
      title,
      summary,
      sourceName: source.name,
      sourceUrl: entry.url,
      urlHash: hash,
      region: regionFor(title, summary, source.region),
      topic: activeClassifier(title, summary, source.slug),
      publishedAt: published,
      publishedAtEstimated: parsed === null,
      byline: entry.byline ? cleanText(entry.byline) : undefined,
      sourceSlug: source.slug,
    });
  }

  result.stored = items.length;
  return { result, items };
}

/**
 * Runs every enabled source. Sources are read sequentially rather than in
 * parallel: the whole set completes in well under a minute, and reading
 * thirty publishers simultaneously from one address is the kind of thing
 * that gets an ingester blocked.
 */
export async function ingestAll(
  sources: readonly SourceDefinition[],
  options: IngestOptions = {},
): Promise<{ results: SourceResult[]; items: NormalisedItem[] }> {
  const results: SourceResult[] = [];
  const items: NormalisedItem[] = [];
  const known = new Set(options.known ?? []);

  for (const source of sources) {
    const outcome = await ingestSource(source, { ...options, known });
    results.push(outcome.result);
    for (const item of outcome.items) {
      known.add(item.urlHash);
      items.push(item);
    }
  }

  return { results, items };
}
