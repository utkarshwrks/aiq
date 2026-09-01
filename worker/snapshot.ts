import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { NormalisedItem } from './types';
import {
  FEED_SOURCE_COUNT,
  SOURCE_COUNT,
} from '../src/lib/sources';

/**
 * Snapshot writer.
 *
 * The application must render a real Update Panel without a Postgres
 * instance attached - for local development, for preview deployments,
 * and so that a reader is never shown an empty panel because a worker
 * somewhere is down. Every ingestion run therefore also writes a
 * snapshot to the repository, which the application falls back to and
 * labels as such in the interface.
 *
 * The snapshot is a cache, not a second source of truth: it is written
 * from the same normalised items that go to the database, in the same
 * run, and never edited by hand.
 */

export const SNAPSHOT_PATH = resolve(
  process.cwd(),
  'src/content/updates.snapshot.json',
);

/** Items kept per region in the snapshot. Enough for the full page. */
const SNAPSHOT_LIMIT = 60;

export type Snapshot = {
  generatedAt: string;
  sourceCount: number;
  feedSourceCount: number;
  global: SnapshotItem[];
  india: SnapshotItem[];
};

export type SnapshotItem = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  sourceSlug: string;
  region: 'GLOBAL' | 'INDIA';
  topic: string;
  publishedAt: string;
  publishedAtEstimated: boolean;
  ingestedAt: string;
  byline?: string;
};

function toSnapshotItem(item: NormalisedItem, ingestedAt: string): SnapshotItem {
  return {
    // The URL hash is already a stable, collision-resistant identity;
    // minting a separate id would only create a second thing to keep in
    // sync with the database.
    id: item.urlHash.slice(0, 24),
    title: item.title,
    summary: item.summary,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    sourceSlug: item.sourceSlug,
    region: item.region,
    topic: item.topic,
    publishedAt: item.publishedAt.toISOString(),
    publishedAtEstimated: item.publishedAtEstimated,
    ingestedAt,
    ...(item.byline ? { byline: item.byline } : {}),
  };
}

/**
 * Ranking. Two rules, both of which exist because the first draft of this
 * feed was unreadable without them.
 *
 * Items whose date we actually know rank above items dated from first
 * sighting. Without that, every undated headline scraped from a company
 * index page carries today's timestamp and sweeps every dated item off
 * the top of the panel.
 */
function byNewest(a: SnapshotItem, b: SnapshotItem): number {
  if (a.publishedAtEstimated !== b.publishedAtEstimated) {
    return a.publishedAtEstimated ? 1 : -1;
  }
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
}

/** No single source may occupy more than this many slots in a region. */
const MAX_PER_SOURCE = 4;

/**
 * Caps each source's share while preserving the ranking. A newsroom that
 * publishes six investor notices in a morning would otherwise be the
 * entire visible panel, which tells the reader nothing about the field.
 */
function capPerSource(items: readonly SnapshotItem[]): SnapshotItem[] {
  const counts = new Map<string, number>();
  const kept: SnapshotItem[] = [];
  const overflow: SnapshotItem[] = [];

  for (const item of items) {
    const count = counts.get(item.sourceSlug) ?? 0;
    if (count < MAX_PER_SOURCE) {
      counts.set(item.sourceSlug, count + 1);
      kept.push(item);
    } else {
      overflow.push(item);
    }
  }

  // Overflow is appended rather than discarded, so the full page still
  // has depth once the reader scrolls past the varied opening window.
  return [...kept, ...overflow];
}

export function buildSnapshot(items: readonly NormalisedItem[]): Snapshot {
  const generatedAt = new Date().toISOString();

  const mapped = items.map((item) => toSnapshotItem(item, generatedAt));

  return {
    generatedAt,
    sourceCount: SOURCE_COUNT,
    feedSourceCount: FEED_SOURCE_COUNT,
    global: capPerSource(
      mapped.filter((item) => item.region === 'GLOBAL').sort(byNewest),
    ).slice(0, SNAPSHOT_LIMIT),
    india: capPerSource(
      mapped.filter((item) => item.region === 'INDIA').sort(byNewest),
    ).slice(0, SNAPSHOT_LIMIT),
  };
}

export async function writeSnapshot(snapshot: Snapshot): Promise<void> {
  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(
    SNAPSHOT_PATH,
    `${JSON.stringify(snapshot, null, 2)}\n`,
    'utf8',
  );
}
