'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { RefreshCw } from 'lucide-react';
import { UpdateRow } from './UpdateRow';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { syncLabel } from '@/lib/relativeTime';
import { TOPIC_LABELS, type Topic, type UpdateFeed } from '@/lib/updates/types';
import { cn } from '@/lib/cn';

type UpdatePanelProps = {
  /** Server-rendered feed. Used as SWR's fallback so the panel paints filled. */
  initial: UpdateFeed;
  /** `widget` is the condensed homepage form; `full` is the /updates page. */
  variant?: 'widget' | 'full';
  /** Rows shown per column in the widget form. */
  limit?: number;
};

const REGIONS = [
  {
    key: 'global',
    label: 'Global advancements',
    short: 'Global',
    note: 'Research, hardware and industry worldwide',
  },
  {
    key: 'india',
    label: 'India advancements',
    short: 'India',
    note: 'National mission, institutions and industry',
  },
] as const;

type RegionKey = (typeof REGIONS)[number]['key'];

const fetcher = async (url: string): Promise<UpdateFeed> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`feed request failed: ${response.status}`);
  return (await response.json()) as UpdateFeed;
};

/**
 * The Update Panel.
 *
 * Global and India are two separate columns on a wide viewport and two
 * tabs on a narrow one - never a single list with a region filter. That
 * is the whole design argument of this component: India is a lens, not a
 * facet, and a facet is what it becomes the moment the two share a
 * column.
 *
 * The server renders the feed and hands it in as SWR's fallback, so the
 * panel paints filled on first byte and the client refresh only ever
 * replaces content that is already there.
 */
export function UpdatePanel({
  initial,
  variant = 'widget',
  limit = 6,
}: UpdatePanelProps) {
  const [tab, setTab] = useState<RegionKey>('global');
  const [topic, setTopic] = useState<Topic | 'ALL'>('ALL');

  const { data, isValidating, mutate } = useSWR<UpdateFeed>(
    `/api/updates?limit=${variant === 'full' ? 60 : limit}`,
    fetcher,
    {
      fallbackData: initial,
      revalidateOnFocus: false,
      // The worker runs every three hours; polling faster than every ten
      // minutes would spend requests to learn nothing.
      refreshInterval: 10 * 60 * 1000,
      keepPreviousData: true,
    },
  );

  const feed = data ?? initial;

  // One reference instant per feed revision, so a column of twenty
  // timestamps cannot disagree with itself about what "now" is, and the
  // whole panel does not re-time on every unrelated re-render.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberately re-taken when the feed changes
  const now = useMemo(() => Date.now(), [feed]);

  const filter = (items: UpdateFeed['global']) => {
    const scoped = topic === 'ALL' ? items : items.filter((i) => i.topic === topic);
    return variant === 'widget' ? scoped.slice(0, limit) : scoped;
  };

  const columns = {
    global: filter(feed.global),
    india: filter(feed.india),
  };

  const availableTopics = useMemo(() => {
    const present = new Set<Topic>();
    for (const item of [...feed.global, ...feed.india]) present.add(item.topic);
    return (Object.keys(TOPIC_LABELS) as Topic[]).filter((t) => present.has(t));
  }, [feed]);

  return (
    <section aria-labelledby="updates-heading" className="w-full">
      {/* --- Status bar ------------------------------------------------ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-hairline border-b-0 bg-inset px-5 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              isValidating ? 'bg-amber' : 'cg-pulse bg-live',
            )}
          />
          <span className="data text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-muted">
            {syncLabel(feed.stats.lastSyncedAt, now)}
          </span>
          <span aria-hidden className="h-3 w-px bg-hairline" />
          {/* Whether the reader is looking at live rows or the committed
              snapshot is not a detail to hide on a small screen; it is
              the panel's own statement about its freshness. */}
          <span className="data text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint">
            {feed.stats.origin === 'database' ? 'Live index' : 'Committed snapshot'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="data text-[length:var(--text-2xs)] text-ink-faint">
            {feed.stats.sourceCount} sources / {feed.stats.totalItems} items
          </span>
          <button
            type="button"
            onClick={() => void mutate()}
            className="flex items-center gap-1.5 font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.1em] text-ink-faint transition-colors duration-[var(--dur-fast)] hover:text-teal"
          >
            <RefreshCw
              aria-hidden
              className={cn('size-3', isValidating && 'animate-spin')}
            />
            Resync
          </button>
        </div>
      </div>

      {/* --- Topic filter, full page only ------------------------------ */}
      {variant === 'full' && (
        <div
          role="group"
          aria-label="Filter by topic"
          className="flex flex-wrap gap-px border-x border-hairline bg-hairline"
        >
          {(['ALL', ...availableTopics] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={topic === option}
              onClick={() => setTopic(option)}
              className={cn(
                'flex-1 whitespace-nowrap bg-inset px-3 py-2.5',
                'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.1em]',
                'transition-colors duration-[var(--dur-fast)]',
                topic === option
                  ? 'text-teal'
                  : 'text-ink-faint hover:bg-elevated hover:text-ink-muted',
              )}
            >
              {option === 'ALL' ? 'All topics' : TOPIC_LABELS[option]}
            </button>
          ))}
        </div>
      )}

      <h2 id="updates-heading" className="sr-only">
        Latest quantum computing updates
      </h2>

      {/* --- Narrow viewport: tabs ------------------------------------- */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Region"
          className="flex border-x border-t border-hairline"
        >
          {REGIONS.map((region) => (
            <button
              key={region.key}
              role="tab"
              type="button"
              id={`tab-${region.key}`}
              aria-selected={tab === region.key}
              aria-controls={`panel-${region.key}`}
              onClick={() => setTab(region.key)}
              className={cn(
                'relative flex-1 px-4 py-3',
                'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.12em]',
                'transition-colors duration-[var(--dur-fast)]',
                tab === region.key ? 'text-teal' : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              {region.short}
              <span className="ml-2 text-ink-faint">
                {columns[region.key].length}
              </span>
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-4 bottom-0 h-px origin-left transition-transform duration-[var(--dur-base)] ease-[var(--ease-instrument)]',
                  tab === region.key ? 'scale-x-100 bg-teal' : 'scale-x-0 bg-transparent',
                )}
              />
            </button>
          ))}
        </div>

        {REGIONS.map((region) => (
          <div
            key={region.key}
            role="tabpanel"
            id={`panel-${region.key}`}
            aria-labelledby={`tab-${region.key}`}
            hidden={tab !== region.key}
            className="border border-hairline"
          >
            <Column items={columns[region.key]} now={now} region={region.short} />
          </div>
        ))}
      </div>

      {/* --- Wide viewport: two columns, never merged ------------------- */}
      <div className="hidden border border-hairline lg:grid lg:grid-cols-2">
        {REGIONS.map((region, index) => (
          <div
            key={region.key}
            className={cn(index === 0 && 'border-r border-hairline')}
          >
            <div className="border-b border-hairline bg-inset px-5 py-3">
              <h3 className="data text-[length:var(--text-2xs)] uppercase tracking-[0.14em] text-ink">
                {region.label}
                <span className="ml-2 text-ink-faint">
                  {columns[region.key].length}
                </span>
              </h3>
              <p className="mt-1 text-[length:var(--text-2xs)] text-ink-faint">
                {region.note}
              </p>
            </div>
            <Column items={columns[region.key]} now={now} region={region.short} />
          </div>
        ))}
      </div>

      {variant === 'widget' && (
        <div className="mt-6 flex justify-end">
          <InstrumentLink href="/updates">View the full index</InstrumentLink>
        </div>
      )}
    </section>
  );
}

function Column({
  items,
  now,
  region,
}: {
  items: UpdateFeed['global'];
  now: number;
  region: string;
}) {
  if (items.length === 0) {
    return (
      <div className="cg-grid cg-grid-fine flex min-h-[16rem] flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <p className="label-caps">Signal not yet acquired</p>
        <p className="max-w-xs text-[length:var(--text-xs)] leading-relaxed text-ink-muted">
          No items match the current filter in the {region} sector. The next
          ingestion pass may resolve one.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {items.map((item) => (
        <UpdateRow key={item.id} item={item} now={now} />
      ))}
    </ul>
  );
}
