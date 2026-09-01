'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type ContourFieldProps = {
  className?: string;
  /** Parallax rate: fraction of scroll distance the field travels. */
  rate?: number;
  /** Adds the violet offset contour band for entanglement-themed areas. */
  secondary?: boolean;
};

/**
 * The ambient topographic backdrop. Two banded contour layers drift at
 * different rates as the page scrolls, which is what gives the site its
 * sense of a chart being panned rather than a page being scrolled.
 *
 * The scroll handler writes a single CSS custom property and nothing
 * else; the transform is applied in CSS. That keeps the work off the
 * main thread's layout path and inside the compositor.
 */
export function ContourField({ className, rate = 0.08, secondary = false }: ContourFieldProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      node.style.setProperty('--cg-drift', String(window.scrollY * rate));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [rate, reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        'z-[var(--z-canvas)]',
        className,
      )}
    >
      <div className="cg-contours cg-contours-drift absolute -inset-[20%]" />
      {secondary && (
        <div
          className="cg-contours-offset cg-contours-drift absolute -inset-[20%]"
          style={{ ['--cg-drift' as string]: 'calc(var(--cg-drift, 0) * -0.6)' }}
        />
      )}
    </div>
  );
}
