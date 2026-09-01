'use client';

import useSWR from 'swr';
import { BlochSphere } from '@/components/3d/lazy';
import { DeferredScene } from '@/components/3d/DeferredScene';
import { CoordinateStrip } from '@/components/ui/CoordinateStrip';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { ContourField } from '@/components/ui/ContourField';
import type { IngestionStats } from '@/lib/updates/types';
import { syncLabel } from '@/lib/relativeTime';

/**
 * The hero.
 *
 * Not a headline with two buttons. The instrument occupies the right two
 * thirds of the viewport and is immediately operable; the left column is
 * a faceplate - product name, one line of mission statement, and a live
 * readout of what the ingestion pipeline is currently tracking.
 *
 * The counters are real. They come from the same repository the Update
 * Panel reads, so the number on screen is the number of sources actually
 * being polled, and it goes up when the registry does rather than when
 * someone edits the markup.
 */

const fetcher = async (url: string): Promise<IngestionStats> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('stats unavailable');
  return (await response.json()) as IngestionStats;
};

export function HeroDeck({ initialStats }: { initialStats: IngestionStats }) {
  const { data } = useSWR<IngestionStats>('/api/stats', fetcher, {
    fallbackData: initialStats,
    revalidateOnFocus: false,
    refreshInterval: 15 * 60 * 1000,
  });

  const stats = data ?? initialStats;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] overflow-hidden border-b border-hairline pt-14"
    >
      <ContourField rate={0.06} secondary />
      <div
        aria-hidden
        className="cg-grid cg-grid-masked pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative mx-auto grid h-full w-full max-w-[104rem] gap-10 px-[var(--shell-gutter)] py-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16 lg:py-16">
        {/* --- Faceplate ---------------------------------------------- */}
        <div className="flex flex-col justify-center">
          <p className="label-caps">Quantum reference console</p>

          <h1
            id="hero-heading"
            className="mt-5 text-[length:var(--text-4xl)] leading-[1.05] text-ink"
          >
            A working map of
            <br />
            quantum computing.
          </h1>

          <p className="mt-6 max-w-md text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            First principles through to frontier research, the global and
            Indian ecosystems plotted, and a feed that reads the field&apos;s
            own sources every three hours.
          </p>

          {/* Live readouts. Every figure below is read from storage. */}
          <dl className="mt-10 grid grid-cols-3 gap-px border border-hairline bg-hairline">
            <Cell
              label="Sources"
              value={String(stats.sourceCount)}
              note="tracked"
            />
            <Cell
              label="Via feed"
              value={String(stats.feedSourceCount)}
              note="not scraped"
              tone="teal"
            />
            <Cell
              label="Items"
              value={String(stats.totalItems)}
              note="indexed"
            />
          </dl>

          <p className="data mt-3 text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint">
            {syncLabel(stats.lastSyncedAt)}
            {stats.origin === 'snapshot' && ' / committed snapshot'}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <InstrumentLink href="/foundations" variant="bracket">
              Start at first principles
            </InstrumentLink>
            <InstrumentLink href="/updates">Open the feed</InstrumentLink>
          </div>
        </div>

        {/* --- Instrument --------------------------------------------- */}
        <div className="relative flex min-h-[26rem] flex-col lg:min-h-0">
          <div className="flex items-center justify-between pb-3">
            <span className="label-caps">Instrument 01 / Bloch sphere</span>
            <span className="data hidden text-[length:var(--text-2xs)] text-ink-faint sm:block">
              DRAG THE VECTOR
            </span>
          </div>

          <div className="cg-bracket relative min-h-0 flex-1 border border-hairline bg-inset">
            <DeferredScene subject="Bloch sphere">
              <BlochSphere />
            </DeferredScene>
          </div>

          <CoordinateStrip
            className="pt-3"
            marks={['-1.0', '-0.5', '0', '+0.5', '+1.0']}
          />
        </div>
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  note,
  tone = 'ink',
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'ink' | 'teal';
}) {
  return (
    <div className="bg-deep px-3 py-3.5">
      <dt className="label-caps">{label}</dt>
      <dd
        className={`data mt-1.5 text-[length:var(--text-2xl)] leading-none ${
          tone === 'teal' ? 'text-teal' : 'text-ink'
        }`}
      >
        {value}
      </dd>
      <dd className="mt-1.5 text-[length:var(--text-2xs)] text-ink-faint">
        {note}
      </dd>
    </div>
  );
}
