import type { SourceDefinition } from '../src/lib/sources';

/**
 * What a scraper returns. Deliberately raw: cleaning, classification and
 * summarisation all happen downstream, so an adapter's only job is to
 * get the fields out of whatever shape the publisher emits.
 */
export type RawItem = {
  title: string;
  /** The publisher's own description or abstract, markup and all. */
  summary?: string | undefined;
  url: string;
  /** Whatever date string the source provided, in whatever format. */
  publishedAt?: string | undefined;
  byline?: string | undefined;
};

/** An item after the pipeline has run, ready to be persisted. */
export type NormalisedItem = {
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  urlHash: string;
  region: 'GLOBAL' | 'INDIA';
  topic:
    | 'HARDWARE'
    | 'ALGORITHMS'
    | 'POLICY'
    | 'FUNDING'
    | 'RESEARCH_PAPER'
    | 'INDUSTRY'
    | 'EDUCATION';
  publishedAt: Date;
  byline?: string | undefined;
  sourceSlug: string;
};

export type Scraper = (source: SourceDefinition) => Promise<RawItem[]>;

/** Per-source outcome, aggregated into the ingestion log. */
export type SourceResult = {
  slug: string;
  seen: number;
  stored: number;
  skipped: number;
  ok: boolean;
  error?: string;
};
