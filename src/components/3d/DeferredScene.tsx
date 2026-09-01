'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CalibrationLoader } from '@/components/ui/CalibrationLoader';
import { useInView } from '@/hooks/useInView';

type DeferredSceneProps = {
  children: ReactNode;
  subject: string;
  className?: string;
};

/**
 * Gates a lazily imported 3D scene from *outside* the dynamic component.
 *
 * This distinction is the whole point. next/dynamic only requests a
 * chunk when the component renders, so gating inside the scene - which
 * is what SceneFrame does - happens after three.js has already been
 * downloaded. On a throttled mobile connection that put roughly 180KB of
 * WebGL runtime on the critical path for a hero whose largest paint is a
 * heading, and cost several seconds of largest contentful paint.
 *
 * Rendering the calibration state until the frame is both near the
 * viewport and the main thread is idle keeps the request off the load
 * path entirely. Creating the element is free; only rendering it fetches.
 */
export function DeferredScene({
  children,
  subject,
  className,
}: DeferredSceneProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '300px' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!inView || ready) return;

    // Idle callback where available, with a timeout so the scene always
    // arrives on a busy page; a short timer everywhere else.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(timer);
  }, [inView, ready]);

  return (
    <div ref={ref} className={className ?? 'size-full'}>
      {ready ? children : <CalibrationLoader subject={subject} />}
    </div>
  );
}
