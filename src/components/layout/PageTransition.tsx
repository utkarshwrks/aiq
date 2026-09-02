'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * The transition between plates.
 *
 * A map does not slide when you turn to a new sheet; it is redrawn. So
 * this is a fade and an eight-pixel settle upward, on the same easing
 * curve every other control in the product uses - no horizontal travel,
 * no scale, nothing that suggests the page moved through space.
 *
 * The duration and curve mirror `--dur-base` and `--ease-instrument` from
 * `src/styles/theme.css`. They are restated here rather than read from
 * the custom properties because Framer animates in JavaScript and cannot
 * resolve a CSS variable into a cubic-bezier; if the tokens change, these
 * two constants change with them.
 */
const DURATION = 0.32;
const EASE = [0.22, 1, 0.36, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Not "animate to the same value" - no wrapper at all. A reader who has
  // asked for less motion should not have their content held behind an
  // animation frame, and the 3D scenes make the same call.
  if (reduced) return <>{children}</>;

  return (
    // `initial={false}` keeps the first paint out of it. Animating the
    // landing page in from zero opacity would push LCP behind hydration
    // to buy nothing: there is no previous page to have come from.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: DURATION, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
