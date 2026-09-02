import Redis from 'ioredis';

/**
 * Cache invalidation after an ingestion run.
 *
 * The application caches the composed Update Panel feed in Redis under
 * `feed:*` and `stats:*` (see `src/lib/cache.ts`, which owns the key
 * scheme and the TTL). Without this, newly ingested items would sit
 * invisible behind a warm cache for up to the TTL after a run that has
 * already finished writing them.
 *
 * The worker connects with its own short-lived client rather than
 * importing the application module: the two run as separate services
 * with separate tsconfigs, and the worker has no business holding a
 * connection open between runs.
 *
 * Redis is optional here exactly as it is in the application. With
 * REDIS_URL unset this is a no-op, and a failure to reach a configured
 * Redis is logged and swallowed - a stale cache is not a reason to fail
 * an ingestion run that has already persisted its rows.
 */
export async function invalidateFeedCache(): Promise<void> {
  const url = process.env['REDIS_URL'];
  if (!url) return;

  const redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2_000,
    // Connect explicitly below rather than racing the first command.
    // With the offline queue disabled, a command issued before the socket
    // is writeable is rejected outright - which made every invalidation
    // fail silently into the catch.
    lazyConnect: true,
  });
  redis.on('error', () => {
    // Handled by the catch below; the listener exists so a reconnect
    // failure is not an unhandled exception.
  });

  try {
    await redis.connect();

    const keys = [
      ...(await scan(redis, 'feed:*')),
      ...(await scan(redis, 'stats:*')),
    ];
    if (keys.length > 0) await redis.del(...keys);
    console.warn(`[ingest] invalidated ${keys.length} cached feed entries`);
  } catch (error) {
    console.error('[ingest] cache invalidation failed', error);
  } finally {
    redis.disconnect();
  }
}

/**
 * Collects keys matching a pattern with SCAN rather than KEYS.
 *
 * KEYS blocks the server for the length of the sweep. The cache holds a
 * handful of keys today, so it would not matter here - but this Redis may
 * be shared, and a blocking sweep is not something to leave in a
 * scheduled job that runs unattended every three hours.
 */
async function scan(redis: Redis, pattern: string): Promise<string[]> {
  const found: string[] = [];
  let cursor = '0';

  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
    found.push(...batch);
    cursor = next;
  } while (cursor !== '0');

  return found;
}
