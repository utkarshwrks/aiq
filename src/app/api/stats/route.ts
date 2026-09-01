import { NextResponse } from 'next/server';
import { getIngestionStats } from '@/lib/updates/repository';

/**
 * Ingestion statistics. Backs the live counter in the hero, which states
 * a real figure read from storage rather than a number written into the
 * markup by hand.
 */

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const stats = await getIngestionStats();

  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
    },
  });
}
