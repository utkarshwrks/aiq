import { PrismaClient } from '@prisma/client';
import type { NormalisedItem, SourceResult } from './types';
import { ALL_SOURCES } from '../src/lib/sources';

/**
 * Database writes for the ingestion worker.
 *
 * The worker owns its own Prisma client rather than importing the
 * application's singleton: it is a separate process with a different
 * lifecycle, and coupling the two would drag Next's module graph into a
 * plain Node service for no benefit.
 */

let client: PrismaClient | null = null;

export function db(): PrismaClient {
  client ??= new PrismaClient({ log: ['error'] });
  return client;
}

export function databaseConfigured(): boolean {
  const url = process.env['DATABASE_URL'];
  return typeof url === 'string' && url.length > 0;
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}

/**
 * Reconciles the source registry into the sources table. The registry in
 * source control is authoritative; the table exists so items can carry a
 * foreign key and so a source can be disabled operationally without a
 * deploy.
 */
export async function syncSources(): Promise<void> {
  for (const source of ALL_SOURCES) {
    await db().source.upsert({
      where: { slug: source.slug },
      create: {
        slug: source.slug,
        name: source.name,
        homepage: source.homepage,
        endpoint: source.endpoint,
        kind: source.kind,
        region: source.region,
        monogram: source.monogram,
        minInterval: source.minInterval ?? 180,
      },
      update: {
        name: source.name,
        homepage: source.homepage,
        endpoint: source.endpoint,
        kind: source.kind,
        region: source.region,
        monogram: source.monogram,
        minInterval: source.minInterval ?? 180,
      },
    });
  }
}

/** URL hashes already stored, so a run can skip known items early. */
export async function knownHashes(): Promise<Set<string>> {
  const rows = await db().updateItem.findMany({ select: { urlHash: true } });
  return new Set(rows.map((row) => row.urlHash));
}

/**
 * Stores a batch. createMany with skipDuplicates rather than a loop of
 * upserts: the unique constraint on urlHash is doing the deduplication
 * anyway, and one statement beats several hundred round trips.
 */
export async function storeItems(items: readonly NormalisedItem[]): Promise<number> {
  if (items.length === 0) return 0;

  const sources = await db().source.findMany({ select: { id: true, slug: true } });
  const idBySlug = new Map(sources.map((source) => [source.slug, source.id]));

  const result = await db().updateItem.createMany({
    skipDuplicates: true,
    data: items.map((item) => ({
      title: item.title,
      summary: item.summary,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      urlHash: item.urlHash,
      region: item.region,
      topic: item.topic,
      publishedAt: item.publishedAt,
      byline: item.byline ?? null,
      sourceId: idBySlug.get(item.sourceSlug) ?? null,
    })),
  });

  return result.count;
}

/**
 * Records the run. Written whether or not the run succeeded, because a
 * log that only contains successes cannot tell you that ingestion has
 * been failing for two days.
 */
export async function logRun(
  startedAt: Date,
  results: readonly SourceResult[],
  stored: number,
): Promise<void> {
  const failures = results.filter((result) => !result.ok);

  await db().ingestionLog.create({
    data: {
      startedAt,
      finishedAt: new Date(),
      itemsSeen: results.reduce((total, result) => total + result.seen, 0),
      itemsStored: stored,
      itemsSkipped: results.reduce((total, result) => total + result.skipped, 0),
      ok: failures.length === 0,
      error:
        failures.length === 0
          ? null
          : failures
              .map((failure) => `${failure.slug}: ${failure.error ?? 'failed'}`)
              .join('; ')
              .slice(0, 500),
    },
  });
}

/**
 * Drops items past the retention horizon. The panel is a live feed, not
 * an archive, and an unbounded table would slowly make every query worse
 * for no reader benefit.
 */
export async function pruneOlderThan(days: number): Promise<number> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db().updateItem.deleteMany({
    where: { publishedAt: { lt: cutoff } },
  });
  return result.count;
}
