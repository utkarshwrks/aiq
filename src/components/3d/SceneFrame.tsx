'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { FrozenContext, useFrozenFromUrl } from './frozen';
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
  /**
   * 'demand' renders only when something invalidates, which is correct
   * for scenes that move on interaction alone. Scenes with a continuous
   * ambient animation pass 'always'.
   */
  frameloop?: 'always' | 'demand';
  /**
   * Stable handle for the visual regression suite. Also the element
   * that carries `data-frozen` once a deterministic frame has drawn.
   */
  testId?: string;
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
  frameloop = 'always',
  testId,
}: SceneFrameProps) {
  const reduced = useReducedMotion();
  const frozen = useFrozenFromUrl();
  const [drawn, setDrawn] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '240px' });

  return (
    <div
      ref={ref}
      {...(testId ? { 'data-testid': testId } : {})}
      // The suite waits on this rather than on a timeout: it is the
      // scene's own statement that a deterministic frame is on screen.
      data-frozen={frozen && (drawn || reduced) ? 'true' : 'false'}
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
            // Frozen scenes render on demand only, so nothing advances
            // between the first frame and the screenshot.
            frameloop={frozen ? 'demand' : frameloop}
            onCreated={() => setDrawn(true)}
            aria-label={description}
            role="img"
            className="size-full"
          >
            <FrozenContext.Provider value={frozen}>
              {children}
            </FrozenContext.Provider>
          </Canvas>
        </Suspense>
      ) : (
        <CalibrationLoader subject={subject} />
      )}
    </div>
  );
}
