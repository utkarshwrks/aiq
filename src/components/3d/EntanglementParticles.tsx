'use client';

import { useCallback, useState } from 'react';
import { SceneFrame } from './SceneFrame';
import { EntanglementSceneGraph } from './EntanglementSceneGraph';
import { EntanglementStill } from './fallbacks/EntanglementStill';
import { cn } from '@/lib/cn';

type EntanglementParticlesProps = {
  className?: string;
  /** Particles per cluster. Halved automatically for the ambient variant. */
  count?: number;
  /** `ambient` disables interaction and the readout for background use. */
  variant?: 'instrument' | 'ambient';
};

/**
 * Two entangled particle clusters. In the instrument variant the reader
 * can perturb either cluster and watch both respond; in the ambient
 * variant it runs quietly behind content at half the particle budget.
 */
export function EntanglementParticles({
  className,
  count = 900,
  variant = 'instrument',
}: EntanglementParticlesProps) {
  const ambient = variant === 'ambient';
  const [perturb, setPerturb] = useState(0);

  const onPerturbChange = useCallback((value: number) => setPerturb(value), []);

  return (
    <div className={cn('relative size-full', className)}>
      <SceneFrame
        subject="entangled pair"
        description="Two clusters of particles either side of a bundle of connecting arcs. Perturbing one cluster changes both, and paired particles always carry opposite spins."
        fallback={<EntanglementStill />}
        camera={{ position: [0, 0.35, 4.2], fov: 42 }}
        dpr={ambient ? [1, 1.5] : [1, 2]}
      >
        <EntanglementSceneGraph
          count={ambient ? Math.round(count / 2) : count}
          interactive={!ambient}
          onPerturbChange={onPerturbChange}
        />
      </SceneFrame>

      {!ambient && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
          <p className="max-w-xs text-[length:var(--text-xs)] leading-relaxed text-ink-faint">
            Move the pointer over either cluster. Both respond, because a
            perturbation cannot be confined to one half of an entangled
            pair.
          </p>
          <div className="shrink-0 text-right">
            <p className="label-caps">Correlation</p>
            <p className="data mt-1 text-[length:var(--text-lg)] text-violet">
              {perturb > 0 ? '1.000' : '1.000'}
            </p>
            <p className="data mt-1 text-[length:var(--text-2xs)] text-ink-faint">
              {perturb > 0 ? 'PERTURBED' : 'AT REST'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
