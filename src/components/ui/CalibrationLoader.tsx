'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { CompassRose } from './CompassRose';

type CalibrationLoaderProps = {
  /** What is being prepared, e.g. "Bloch sphere". */
  subject?: string;
  className?: string;
  /** Fills its parent rather than reserving a fixed height. */
  fill?: boolean;
};

/**
 * The loading state for every deferred 3D scene. There is no generic
 * spinner anywhere in this product: a scene that is not yet ready reports
 * that it is calibrating, and steps through the same phases an instrument
 * would - the text is a real, ordered sequence, not decoration.
 */
const PHASES = [
  'Acquiring reference frame',
  'Calibrating basis vectors',
  'Resolving state amplitudes',
  'Locking render target',
] as const;

export function CalibrationLoader({
  subject = 'instrument',
  className,
  fill = true,
}: CalibrationLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Preparing ${subject}`}
      className={cn(
        'relative flex flex-col items-center justify-center gap-5 overflow-hidden',
        'cg-grid cg-grid-fine cg-grid-masked bg-inset',
        fill ? 'size-full min-h-[18rem]' : 'min-h-[18rem] w-full',
        className,
      )}
    >
      <CompassRose size={56} animated className="text-teal/60" />

      <div className="flex flex-col items-center gap-2">
        <p className="label-caps !text-ink-muted">{PHASES[phase]}</p>

        {/* Four-segment progress bar; segments fill in sequence. */}
        <div className="flex gap-1" aria-hidden>
          {PHASES.map((p, i) => (
            <span
              key={p}
              className={cn(
                'h-px w-8 transition-colors duration-[var(--dur-base)] ease-[var(--ease-instrument)]',
                i <= phase ? 'bg-teal' : 'bg-hairline',
              )}
            />
          ))}
        </div>
      </div>

      <p className="data text-[length:var(--text-2xs)] text-ink-faint">
        {subject.toUpperCase()}
      </p>
    </div>
  );
}
