import Redis from 'ioredis';

/**
 * TTL cache for the Update Panel feed.
 *
 * The panel is the most-read thing on the site and the least-changing:
 * the worker writes at most every three hours, and between runs every
 * request would otherwise issue the same four Postgres queries to
 * produce a byte-identical answer. Redis holds the composed feed so
 * those queries run once per TTL per cluster rather than once per
 * reader.
 *
 * Invalidation lives in the worker (`worker/cache.ts`), not here: the
 * application only ever reads through this cache, and the one event
 * that should drop it - an ingestion run finishing - happens in the
 * other process.
 *
 * Redis is optional, and its absence is not an error. With REDIS_URL
 * unset - the local and preview default - every call falls through to
 * the loader and the site behaves exactly as it did before. A Redis that
 * is configured but unreachable degrades the same way, loudly in the
 * log and silently to the reader: a cache that can take the site down
 * when it fails is worse than no cache.
 */

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

/** How long a composed feed stays warm. Short against a three-hour write cycle. */
export const FEED_TTL_SECONDS = 300;

function client(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;

  const url = process.env['REDIS_URL'];
  if (!url) {
    globalForRedis.redis = null;
    return null;
  }

  const redis = new Redis(url, {
    // A request must never queue behind a reconnecting cache. One retry,
    // then fail the command and let the caller read Postgres.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 1_000,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
  });

  // ioredis emits 'error' on every failed reconnect. Without a listener
  // those become unhandled exceptions and take the process with them.
  redis.on('error', (error: Error) => {
    console.error('[cache] redis unavailable, reading through', error.message);
  });

  globalForRedis.redis = redis;
  return redis;
}

/** Whether a cache is configured. Reported in diagnostics, not to readers. */
export function hasCache(): boolean {
  return Boolean(process.env['REDIS_URL']);
}

/**
 * Read `key` from the cache, or run `load`, store the result and return
 * it. Any cache failure is logged once and the loader runs.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const redis = client();
  if (!redis) return load();

  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch (error) {
    // A failed read is a miss, not a reason to stop caching. Returning
    // here instead would mean every cold instance permanently skipped the
    // write for the first key it touched, because ioredis rejects
    // commands issued before the connection is established.
    console.error('[cache] read failed, treating as a miss', error);
  }

  const value = await load();

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    // A write failure costs a cache hit, nothing else. The value the
    // caller asked for is already in hand.
    console.error('[cache] write failed', error);
  }

  return value;
}
