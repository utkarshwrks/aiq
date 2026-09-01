import { cn } from '@/lib/cn';
import { CompassRose } from './CompassRose';

type SectionHeaderProps = {
  /** Two-digit plate number, rendered in the gutter like a chart index. */
  index?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned slot for a link, tab set or readout. */
  action?: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
};

/**
 * Every section on the site opens the same way: a plate number and a
 * monospaced eyebrow above a display-weight title, separated from the
 * body by a hairline that runs the full measure. Nothing is centred.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  className,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <header className={cn('relative', className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {(index ?? eyebrow) && (
            <div className="mb-4 flex items-center gap-3">
              <CompassRose size={16} className="text-teal/70" />
              {index && (
                <span className="data text-2xs text-ink-faint tracking-[0.14em]">
                  PLATE {index}
                </span>
              )}
              {index && eyebrow && (
                <span aria-hidden className="h-px w-6 bg-hairline-strong" />
              )}
              {eyebrow && <span className="label-caps">{eyebrow}</span>}
            </div>
          )}

          <Heading className="text-[length:var(--text-3xl)] text-ink">
            {title}
          </Heading>

          {description && (
            <p className="mt-4 max-w-prose text-[length:var(--text-base)] leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0 md:pb-1">{action}</div>}
      </div>

      <div className="cg-rule mt-8" role="presentation" />
    </header>
  );
}
