'use client';

import { ArrowUpRight } from 'lucide-react';
import { Tag, type TagTone } from '@/components/ui/Tag';
import { SourceMonogram } from './SourceMonogram';
import { absoluteLabel, compactRelative } from '@/lib/relativeTime';
import { TOPIC_LABELS, type Topic, type UpdateItem } from '@/lib/updates/types';
import { cn } from '@/lib/cn';

const TOPIC_TONES: Record<Topic, TagTone> = {
  HARDWARE: 'teal',
  ALGORITHMS: 'teal',
  RESEARCH_PAPER: 'violet',
  POLICY: 'amber',
  FUNDING: 'amber',
  INDUSTRY: 'neutral',
  EDUCATION: 'neutral',
};

/**
 * One feed entry.
 *
 * The whole row is the link, because a row that is only clickable on its
 * headline is a row people click and nothing happens. The external
 * marker and the timestamp sit outside the reading column so the eye can
 * scan headlines down a single edge.
 */
export function UpdateRow({
  item,
  now,
}: {
  item: UpdateItem;
  /** Shared reference instant so every row in a render agrees. */
  now: number;
}) {
  const relative = compactRelative(item.publishedAt, now);
  const absolute = absoluteLabel(item.publishedAt);

  return (
    <li className="group relative border-b border-hairline last:border-b-0">
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={cn(
          'flex gap-4 px-5 py-4',
          'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
          'hover:bg-surface focus-visible:bg-surface',
        )}
      >
        <SourceMonogram
          sourceSlug={item.sourceSlug}
          sourceName={item.sourceName}
          className="mt-0.5 transition-colors duration-[var(--dur-fast)] group-hover:border-teal/40 group-hover:text-teal"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="data truncate text-[length:var(--text-2xs)] uppercase tracking-[0.1em] text-ink-faint">
              {item.sourceName}
            </span>
          </div>

          <h3 className="mt-1.5 text-[length:var(--text-sm)] font-medium leading-snug text-ink">
            {item.title}
          </h3>

          {item.summary && (
            <p className="mt-1.5 line-clamp-2 text-[length:var(--text-xs)] leading-relaxed text-ink-muted">
              {item.summary}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tag tone={TOPIC_TONES[item.topic]} swatch>
              {TOPIC_LABELS[item.topic]}
            </Tag>
            {item.byline && (
              <span className="truncate text-[length:var(--text-2xs)] text-ink-faint">
                {item.byline}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <ArrowUpRight
            aria-hidden
            className="size-3.5 text-ink-faint transition-all duration-[var(--dur-fast)] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-teal"
          />
          <time
            dateTime={item.publishedAt}
            title={
              item.publishedAtEstimated
                ? `First seen ${absolute}. This source states no publication date.`
                : absolute
            }
            className="data text-[length:var(--text-2xs)] text-ink-faint"
          >
            {/* An estimated timestamp is marked, not disguised: the tilde
                says the product is reporting when it first saw the item,
                not when the publisher released it. */}
            {item.publishedAtEstimated ? `~${relative}` : relative}
          </time>
        </div>
      </a>
    </li>
  );
}
