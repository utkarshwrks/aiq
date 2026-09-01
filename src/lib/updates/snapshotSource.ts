import snapshot from '@/content/updates.snapshot.json';
import { FEED_SOURCE_COUNT, SOURCE_COUNT } from '@/lib/sources';
import type { IngestionStats, Topic, UpdateFeed, UpdateItem } from './types';

/**
 * The snapshot backend.
 *
 * Reads the file the ingestion worker commits. This is what the product
 * serves when no database is attached, which is the normal case in local
 * development and in preview deployments, and the fallback when the
 * database is unreachable in production.
 *
 * The import is static so the data is inlined at build time and the
 * route stays fully static; there is no filesystem read at request time.
 */

type RawSnapshotItem = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  sourceSlug: string;
  region: string;
  topic: string;
  publishedAt: string;
  publishedAtEstimated?: boolean;
  ingestedAt: string;
  byline?: string;
};

const TOPICS: ReadonlySet<string> = new Set([
  'HARDWARE',
  'ALGORITHMS',
  'POLICY',
  'FUNDING',
  'RESEARCH_PAPER',
  'INDUSTRY',
  'EDUCATION',
]);

function toItem(raw: RawSnapshotItem): UpdateItem {
  return {
    id: raw.id,
    title: raw.title,
    summary: raw.summary,
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    sourceSlug: raw.sourceSlug,
    region: raw.region === 'INDIA' ? 'INDIA' : 'GLOBAL',
    // A snapshot written by an older worker could carry a topic this
    // build does not know; falling back keeps the panel rendering
    // rather than throwing on a chip label.
    topic: (TOPICS.has(raw.topic) ? raw.topic : 'INDUSTRY') as Topic,
    publishedAt: raw.publishedAt,
    publishedAtEstimated: raw.publishedAtEstimated ?? false,
    ingestedAt: raw.ingestedAt,
    ...(raw.byline ? { byline: raw.byline } : {}),
  };
}

export function snapshotStats(): IngestionStats {
  return {
    lastSyncedAt: snapshot.generatedAt,
    totalItems: snapshot.global.length + snapshot.india.length,
    sourceCount: SOURCE_COUNT,
    feedSourceCount: FEED_SOURCE_COUNT,
    origin: 'snapshot',
  };
}

export function snapshotFeed(limit?: number): UpdateFeed {
  const global = (snapshot.global as RawSnapshotItem[]).map(toItem);
  const india = (snapshot.india as RawSnapshotItem[]).map(toItem);

  return {
    global: limit ? global.slice(0, limit) : global,
    india: limit ? india.slice(0, limit) : india,
    stats: snapshotStats(),
  };
}
