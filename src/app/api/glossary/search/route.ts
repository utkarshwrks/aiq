import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchGlossary } from '@/lib/glossary/search';

/**
 * Glossary search endpoint.
 *
 * Backed by Postgres full-text search where a database is configured and
 * by an in-process scored match otherwise; `origin` in the response says
 * which answered, on the same transparency principle as the Update
 * Panel's "Live index / Committed snapshot" readout.
 */

export const dynamic = 'force-dynamic';

const Query = z.object({
  q: z.string().trim().min(1).max(120),
});

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const parsed = Query.safeParse({ q: url.searchParams.get('q') ?? '' });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'q must be between 1 and 120 characters' },
      { status: 400 },
    );
  }

  const result = await searchGlossary(parsed.data.q);

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
}
