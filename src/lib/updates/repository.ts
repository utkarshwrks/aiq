import { hasDatabase, prisma } from '@/lib/prisma';
import { FEED_SOURCE_COUNT, SOURCE_COUNT } from '@/lib/sources';
import { snapshotFeed, snapshotStats } from './snapshotSource';
import type { IngestionStats, UpdateFeed, UpdateItem } from './types';

/**
 * The one way anything in the application reads the update feed.
 *
 * Two backends, one interface. When DATABASE_URL is configured the live
 * tables are read; otherwise the committed snapshot is served. A query
 * that throws also falls back to the snapshot rather than failing the
 * page: a database blip should degrade the panel's freshness, not take
 * the landing page down with it.
 *
 * Which backend answered is reported in the stats and shown in the
 * interface, so the reader is never quietly looking at stale data
 * believing it is live.
 */

const DEFAULT_LIMIT = 60;

type PrismaUpdateRow = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  region: 'GLOBAL' | 'INDIA';
  topic: UpdateItem['topic'];
  publishedAt: Date;
  publishedAtEstimated: boolean;
  ingestedAt: Date;
  byline: string | null;
  source: { slug: string } | null;
};

function fromRow(row: PrismaUpdateRow): UpdateItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    sourceSlug: row.source?.slug ?? 'unknown',
    region: row.region,
    topic: row.topic,
    publishedAt: row.publishedAt.toISOString(),
    publishedAtEstimated: row.publishedAtEstimated,
    ingestedAt: row.ingestedAt.toISOString(),
    ...(row.byline ? { byline: row.byline } : {}),
  };
}

async function databaseFeed(limit: number): Promise<UpdateFeed> {
  const select = {
    id: true,
    title: true,
    summary: true,
    sourceName: true,
    sourceUrl: true,
    region: true,
    topic: true,
    publishedAt: true,
    publishedAtEstimated: true,
    ingestedAt: true,
    byline: true,
    source: { select: { slug: true } },
  } as const;

  // Known publication dates rank above first sightings, matching the
  // rule the snapshot builder applies, so the two backends order the
  // feed identically.
  const orderBy = [
    { publishedAtEstimated: 'asc' as const },
    { publishedAt: 'desc' as const },
  ];

  const [global, india, lastRun, total] = await Promise.all([
    prisma.updateItem.findMany({
      where: { region: 'GLOBAL' },
      orderBy,
      take: limit,
      select,
    }),
    prisma.updateItem.findMany({
      where: { region: 'INDIA' },
      orderBy,
      take: limit,
      select,
    }),
    prisma.ingestionLog.findFirst({
      where: { finishedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      select: { finishedAt: true },
    }),
    prisma.updateItem.count(),
  ]);

  const stats: IngestionStats = {
    lastSyncedAt: lastRun?.finishedAt?.toISOString() ?? null,
    totalItems: total,
    sourceCount: SOURCE_COUNT,
    feedSourceCount: FEED_SOURCE_COUNT,
    origin: 'database',
  };

  return {
    global: (global as PrismaUpdateRow[]).map(fromRow),
    india: (india as PrismaUpdateRow[]).map(fromRow),
    stats,
  };
}

export async function getUpdateFeed(limit = DEFAULT_LIMIT): Promise<UpdateFeed> {
  if (!hasDatabase()) return snapshotFeed(limit);

  try {
    const feed = await databaseFeed(limit);
    // An empty database is not a working database from the reader's
    // point of view. Before the first ingestion run completes, the
    // snapshot is the better answer.
    if (feed.global.length === 0 && feed.india.length === 0) {
      return snapshotFeed(limit);
    }
    return feed;
  } catch (error) {
    console.error('[updates] database read failed, serving snapshot', error);
    return snapshotFeed(limit);
  }
}

export async function getIngestionStats(): Promise<IngestionStats> {
  if (!hasDatabase()) return snapshotStats();

  try {
    const [lastRun, total] = await Promise.all([
      prisma.ingestionLog.findFirst({
        where: { finishedAt: { not: null } },
        orderBy: { startedAt: 'desc' },
        select: { finishedAt: true },
      }),
      prisma.updateItem.count(),
    ]);

    if (total === 0) return snapshotStats();

    return {
      lastSyncedAt: lastRun?.finishedAt?.toISOString() ?? null,
      totalItems: total,
      sourceCount: SOURCE_COUNT,
      feedSourceCount: FEED_SOURCE_COUNT,
      origin: 'database',
    };
  } catch {
    return snapshotStats();
  }
}
