import { getSource } from '@/lib/sources';
import { cn } from '@/lib/cn';

/**
 * Source identity mark.
 *
 * Publisher logos would mean hotlinking thirty-odd trademarks of varying
 * quality and licence, so the panel uses a monogram plate instead: the
 * registry's own two or three letters where the item came from a known
 * source, and initials derived from the publisher name where an item
 * arrived through a news search and its outlet is not in the registry.
 */

function initialsFrom(name: string): string {
  const words = name
    .replace(/\b(the|of|and|for|com|in|co|ltd|inc)\b/gi, ' ')
    .split(/[\s.]+/)
    .filter(Boolean);

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();

  return words
    .slice(0, 3)
    .map((word) => word[0]!)
    .join('')
    .toUpperCase();
}

export function SourceMonogram({
  sourceSlug,
  sourceName,
  className,
}: {
  sourceSlug: string;
  sourceName: string;
  className?: string;
}) {
  const registered = getSource(sourceSlug);
  const mark =
    registered && registered.name === sourceName
      ? registered.monogram
      : initialsFrom(sourceName);

  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 shrink-0 items-center justify-center',
        'border border-hairline bg-inset',
        'data text-[0.625rem] tracking-[0.06em] text-ink-muted',
        'rounded-[var(--radius-sm)]',
        className,
      )}
    >
      {mark}
    </span>
  );
}
