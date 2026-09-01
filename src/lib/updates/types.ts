import type { Region } from '@/lib/sources';

export type Topic =
  | 'HARDWARE'
  | 'ALGORITHMS'
  | 'POLICY'
  | 'FUNDING'
  | 'RESEARCH_PAPER'
  | 'INDUSTRY'
  | 'EDUCATION';

/**
 * The shape the Update Panel renders. Deliberately a plain serialisable
 * record with an ISO date string rather than a Date: it crosses the
 * server/client boundary and travels through the JSON API unchanged, so
 * having one shape everywhere removes a whole class of mapping bugs.
 */
export type UpdateItem = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  sourceSlug: string;
  region: Region;
  topic: Topic;
  /** ISO 8601, UTC. */
  publishedAt: string;
  ingestedAt: string;
  byline?: string;
};

/** What the panel needs to state its own freshness honestly. */
export type IngestionStats = {
  /** ISO timestamp of the last completed run, or null if none has run. */
  lastSyncedAt: string | null;
  /** Total items currently held. */
  totalItems: number;
  /** Sources in the registry. */
  sourceCount: number;
  /** Sources read through an official feed or API rather than HTML. */
  feedSourceCount: number;
  /** Where the data on screen came from. Surfaced in the UI, not hidden. */
  origin: 'database' | 'snapshot';
};

export type UpdateFeed = {
  global: UpdateItem[];
  india: UpdateItem[];
  stats: IngestionStats;
};

export const TOPIC_LABELS: Record<Topic, string> = {
  HARDWARE: 'Hardware',
  ALGORITHMS: 'Algorithms',
  POLICY: 'Policy',
  FUNDING: 'Funding',
  RESEARCH_PAPER: 'Research',
  INDUSTRY: 'Industry',
  EDUCATION: 'Education',
};
