'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Fires once and then disconnects. Default true. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
};

/**
 * Intersection observation used to gate expensive work: a 3D scene only
 * mounts its render loop once it is actually on screen, and scroll
 * sequences only attach their listeners when their section is near.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  once = true,
  rootMargin = '160px',
  threshold = 0,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Without IntersectionObserver, degrade to always-visible rather than
    // never-visible; a missing observer must not hide content.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView } as const;
}
