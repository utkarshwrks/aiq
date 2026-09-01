import Link from 'next/link';
import { CompassRose } from '@/components/ui/CompassRose';
import { cn } from '@/lib/cn';

type WordmarkProps = {
  className?: string;
  /** Suppresses the monospaced descriptor on narrow viewports. */
  compact?: boolean;
};

/**
 * The product mark. Not a logo lockup: a compass glyph, the name set in
 * display weight with the "OS" segment held back in the muted ink, and a
 * monospaced descriptor beneath - the way an instrument is labelled on
 * its own faceplate.
 */
export function Wordmark({ className, compact = false }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="AIQuantumOS, home"
      className={cn('group inline-flex items-center gap-3', className)}
    >
      <CompassRose
        size={26}
        className="text-teal transition-transform duration-[var(--dur-slow)] ease-[var(--ease-instrument)] group-hover:rotate-45"
      />
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-lg)] font-medium tracking-[var(--tracking-tight)] text-ink">
          AIQuantum<span className="text-ink-faint">OS</span>
        </span>
        {!compact && (
          <span className="data mt-1 text-[length:var(--text-2xs)] uppercase tracking-[0.18em] text-ink-faint">
            Quantum reference console
          </span>
        )}
      </span>
    </Link>
  );
}
