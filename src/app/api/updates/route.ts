import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUpdateFeed } from '@/lib/updates/repository';

/**
 * The feed endpoint the client panel revalidates against.
 *
 * The page itself is server-rendered with the same data, so this route
 * exists purely so the panel can refresh in place without a navigation.
 * It is cached at the edge for two minutes with a stale-while-revalidate
 * window: the underlying data only changes when the worker runs, every
 * three hours, so serving a slightly stale body while refreshing behind
 * it costs the reader nothing and costs the database far less.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Query = z.object({
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = Query.safeParse({
    limit: url.searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'limit must be an integer between 1 and 60' },
      { status: 400 },
    );
  }

  const feed = await getUpdateFeed(parsed.data.limit);

  return NextResponse.json(feed, {
    headers: {
      'Cache-Control':
        'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
}
