'use client';

import { Suspense, type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { cn } from '@/lib/cn';
import { CalibrationLoader } from '@/components/ui/CalibrationLoader';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type SceneFrameProps = {
  children: ReactNode;
  /** Static 2D substitute rendered when motion is reduced or WebGL is absent. */
  fallback: ReactNode;
  /** Named in the loading state and in the canvas accessible label. */
  subject: string;
  /** Sentence describing the scene for assistive technology. */
  description: string;
  className?: string;
  camera?: CanvasProps['camera'];
  /**
   * Device pixel ratio ceiling. Capped at 2 across the product: beyond
   * that the fragment cost doubles for no perceptible gain on the kind
   * of line-heavy geometry these scenes draw.
   */
  dpr?: [number, number];
};

/**
 * The single mounting point for every 3D scene in the product. It owns
 * four responsibilities that would otherwise be re-implemented, and
 * eventually forgotten, in each scene:
 *
 *   1. The render loop is not created until the frame is near the
 *      viewport, so an off-screen scene costs nothing.
 *   2. prefers-reduced-motion swaps the whole canvas for a static 2D
 *      substitute rather than merely slowing the animation.
 *   3. A themed calibration state covers the Suspense boundary.
 *   4. The canvas carries a text alternative, since a WebGL surface is
 *      opaque to assistive technology.
 */
export function SceneFrame({
  children,
  fallback,
  subject,
  description,
  className,
  camera = { position: [2.6, 1.9, 2.6], fov: 42 },
  dpr = [1, 2],
}: SceneFrameProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '240px' });

  return (
    <div
      ref={ref}
      className={cn('relative size-full overflow-hidden bg-inset', className)}
    >
      {reduced ? (
        <div role="img" aria-label={description} className="size-full">
          {fallback}
        </div>
      ) : inView ? (
        <Suspense fallback={<CalibrationLoader subject={subject} />}>
          <Canvas
            camera={camera}
            dpr={dpr}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              // The scenes are drawn as emissive lines on a dark ground;
              // tone mapping would wash the accent colours out.
              toneMapping: 0,
            }}
            // Frameloop stays on demand for scenes that only move on
            // interaction; scenes that animate continuously opt back in.
            aria-label={description}
            role="img"
            className="size-full"
          >
            {children}
          </Canvas>
        </Suspense>
      ) : (
        <CalibrationLoader subject={subject} />
      )}
    </div>
  );
}
