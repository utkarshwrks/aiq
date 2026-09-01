import { cn } from '@/lib/cn';

export type TagTone = 'neutral' | 'teal' | 'amber' | 'violet';

type TagProps = {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
  /** Draws a 4px square swatch before the label. */
  swatch?: boolean;
};

const TONES: Record<TagTone, string> = {
  neutral: 'border-hairline text-ink-muted',
  teal: 'border-teal/30 text-teal',
  amber: 'border-amber/30 text-amber',
  violet: 'border-violet/35 text-violet',
};

const SWATCHES: Record<TagTone, string> = {
  neutral: 'bg-ink-faint',
  teal: 'bg-teal',
  amber: 'bg-amber',
  violet: 'bg-violet',
};

/**
 * A classification chip. Square-cornered, hairline-bordered, monospaced
 * and uppercase - the way a legend entry on a chart is set.
 */
export function Tag({ children, tone = 'neutral', className, swatch = false }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-1.5 py-0.5',
        'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.1em]',
        'rounded-[var(--radius-sm)] whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {swatch && (
        <span aria-hidden className={cn('size-1 shrink-0', SWATCHES[tone])} />
      )}
      {children}
    </span>
  );
}
