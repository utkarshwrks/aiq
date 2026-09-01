import { cn } from '@/lib/cn';

type CoordinateStripProps = {
  /** Labels placed at even intervals along the strip. */
  marks?: readonly string[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

/**
 * A chart edge: major and minor tick marks with optional coordinate
 * labels. Used to frame the hero canvas, the ecosystem map and the
 * timeline, so those regions read as plotted areas rather than as boxes.
 */
export function CoordinateStrip({
  marks,
  className,
  orientation = 'horizontal',
}: CoordinateStripProps) {
  if (orientation === 'vertical') {
    return (
      <div
        aria-hidden
        className={cn(
          'flex w-8 flex-col items-end justify-between border-r border-hairline py-2 pr-1.5',
          className,
        )}
      >
        {marks?.map((m) => (
          <span key={m} className="data text-[length:var(--text-2xs)] text-ink-faint">
            {m}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className={cn('w-full select-none', className)}>
      <div className="cg-ticks w-full opacity-60" />
      {marks && (
        <div className="mt-1.5 flex justify-between">
          {marks.map((m) => (
            <span key={m} className="data text-[length:var(--text-2xs)] text-ink-faint">
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
