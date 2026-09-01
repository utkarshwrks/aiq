'use client';

import { useCallback, useMemo, useState } from 'react';
import { SceneFrame } from './SceneFrame';
import { BlochSphereScene } from './BlochSphereScene';
import { BlochSphereStill } from './fallbacks/BlochSphereStill';
import { cn } from '@/lib/cn';
import {
  anglesToAmplitudes,
  clampTheta,
  formatAmplitude,
  probabilityOne,
  probabilityZero,
  toDegrees,
  wrapPhi,
  type BlochAngles,
} from '@/lib/quantum';

type BlochSphereProps = {
  className?: string;
  /** Starting state. Defaults to a point off both poles so the sphere reads as a superposition on load. */
  initial?: BlochAngles;
  /** Renders the numeric readout strip and keyboard controls beneath the canvas. */
  showReadout?: boolean;
  showLabels?: boolean;
};

/**
 * Chosen so the vector is clearly oblique to the default camera bearing.
 * At phi near the camera's own azimuth the vector projects onto a few
 * pixels at the centre of the frame and reads as if it were missing.
 */
const DEFAULT_ANGLES: BlochAngles = { theta: Math.PI * 0.36, phi: Math.PI * 0.74 };
const STEP = Math.PI / 24;

/**
 * The product's central instrument. State lives here rather than in the
 * scene so the numeric readout is real DOM: selectable, announced by
 * screen readers, and driven by the same maths the geometry uses.
 *
 * The sphere is operable without a pointer. The control group below the
 * canvas takes arrow keys for the polar and azimuthal angles and offers
 * the six cardinal states as direct jumps, which is the only way a
 * keyboard user can reach an arbitrary point on a dragged surface.
 */
export function BlochSphere({
  className,
  initial = DEFAULT_ANGLES,
  showReadout = true,
  showLabels = true,
}: BlochSphereProps) {
  const [angles, setAngles] = useState<BlochAngles>(initial);

  const amplitudes = useMemo(() => anglesToAmplitudes(angles), [angles]);
  const p0 = probabilityZero(angles);
  const p1 = probabilityOne(angles);

  const nudge = useCallback((dTheta: number, dPhi: number) => {
    setAngles((current) => ({
      theta: clampTheta(current.theta + dTheta),
      phi: wrapPhi(current.phi + dPhi),
    }));
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [-STEP, 0],
        ArrowDown: [STEP, 0],
        ArrowLeft: [0, -STEP],
        ArrowRight: [0, STEP],
      };
      const delta = map[event.key];
      if (!delta) return;
      event.preventDefault();
      nudge(delta[0], delta[1]);
    },
    [nudge],
  );

  return (
    <div className={cn('flex size-full flex-col', className)}>
      <div className="relative min-h-0 flex-1">
        <SceneFrame
          subject="Bloch sphere"
          description="Interactive Bloch sphere. A teal state vector points from the centre of a wireframe globe to a point on its surface; amber and violet arcs mark the polar and azimuthal angles."
          fallback={<BlochSphereStill />}
          camera={{ position: [2.4, 1.7, 2.4], fov: 40 }}
        >
          <BlochSphereScene
            angles={angles}
            onChange={setAngles}
            showLabels={showLabels}
          />
        </SceneFrame>
      </div>

      {showReadout && (
        <div
          role="group"
          aria-label="Bloch sphere state controls. Use the arrow keys to move the state vector."
          tabIndex={0}
          onKeyDown={onKeyDown}
          className={cn(
            'grid shrink-0 gap-px border-t border-hairline bg-hairline',
            'grid-cols-2 md:grid-cols-4',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-teal',
          )}
        >
          <ReadoutCell label="Theta" value={`${toDegrees(angles.theta)} deg`} tone="amber" />
          <ReadoutCell label="Phi" value={`${toDegrees(angles.phi)} deg`} tone="violet" />
          <ReadoutCell
            label="P(0)"
            value={p0.toFixed(3)}
            tone="teal"
            bar={p0}
          />
          <ReadoutCell
            label="P(1)"
            value={p1.toFixed(3)}
            tone="teal"
            bar={p1}
          />

          <div className="col-span-2 bg-inset px-4 py-3 md:col-span-4">
            <p className="label-caps mb-1.5">State</p>
            <p className="data text-[length:var(--text-sm)] text-ink">
              {amplitudes.alpha.toFixed(3)} |0&gt;
              {'  +  '}
              {formatAmplitude(amplitudes.betaRe, amplitudes.betaIm)} |1&gt;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadoutCell({
  label,
  value,
  tone,
  bar,
}: {
  label: string;
  value: string;
  tone: 'teal' | 'amber' | 'violet';
  bar?: number;
}) {
  const colour = {
    teal: 'text-teal',
    amber: 'text-amber',
    violet: 'text-violet',
  }[tone];

  const fill = {
    teal: 'bg-teal',
    amber: 'bg-amber',
    violet: 'bg-violet',
  }[tone];

  return (
    <div className="relative bg-inset px-4 py-3">
      <p className="label-caps">{label}</p>
      <p className={cn('data mt-1 text-[length:var(--text-base)]', colour)}>{value}</p>
      {bar !== undefined && (
        <div aria-hidden className="mt-2 h-px w-full bg-hairline">
          <div
            className={cn('h-px transition-[width] duration-[var(--dur-fast)] ease-[var(--ease-instrument)]', fill)}
            style={{ width: `${Math.round(bar * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
