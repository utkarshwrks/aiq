'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks prefers-reduced-motion and reacts to it changing mid-session,
 * which matters because the 3D scenes swap to static fallbacks on the
 * strength of this value rather than only reading it once at mount.
 *
 * Returns false during SSR and the first client paint so the server and
 * client markup agree; the effect corrects it before any animation runs.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
