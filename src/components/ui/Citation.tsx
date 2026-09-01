import { cn } from '@/lib/cn';

type CitationProps = {
  /** Marker number as it appears in the page's reference list. */
  n: number;
  href: string;
  /** Publisher shown in the hover/focus tooltip, e.g. "IBM Quantum". */
  source: string;
  className?: string;
};

/**
 * An inline source marker. Every non-trivial factual claim on a content
 * page carries one; the reference list at the foot of the page resolves
 * the numbers. Rendered as a superscript link so it is reachable by
 * keyboard and announced properly by screen readers.
 */
export function Citation({ n, href, source, className }: CitationProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={`Source ${n}: ${source}, opens in a new tab`}
      className={cn(
        'group relative -top-1 ml-0.5 inline-flex items-center justify-center',
        'data text-[length:var(--text-2xs)] leading-none',
        'border-b border-teal/40 px-0.5 text-teal',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
        'hover:border-teal hover:bg-teal/10',
        className,
      )}
    >
      [{n}]
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-[var(--z-overlay)] mb-2',
          '-translate-x-1/2 whitespace-nowrap border border-hairline bg-elevated',
          'px-2 py-1 text-[length:var(--text-2xs)] text-ink-muted',
          'opacity-0 transition-opacity duration-[var(--dur-fast)]',
          'group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
      >
        {source}
      </span>
    </a>
  );
}
