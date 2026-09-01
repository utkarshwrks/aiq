import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';

const SCENES = [
  {
    href: '/lab/bloch',
    name: 'BlochSphere',
    note: 'Draggable state vector, live amplitude readout, keyboard operable.',
  },
  {
    href: '/lab/circuit',
    name: 'QuantumCircuitScene',
    note: 'Four real circuits, pulse-driven gate energising, 2D fallback.',
  },
  {
    href: '/lab/entanglement',
    name: 'EntanglementParticles',
    note: 'GPU-instanced clusters sharing one seed array and one uniform.',
  },
] as const;

export default function LabIndexPage() {
  return (
    <div>
      <h1 className="text-[length:var(--text-2xl)]">Scene lab</h1>
      <p className="mt-4 max-w-2xl text-ink-muted">
        Each scene rendered in isolation, at the size it is used, against
        the product surfaces. Toggle the operating system reduced-motion
        setting to check the static substitutes.
      </p>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {SCENES.map((scene) => (
          <Panel as="li" key={scene.href} bracketed className="p-5">
            <Link href={scene.href} className="group block">
              <p className="data text-[length:var(--text-sm)] text-teal group-hover:text-ink">
                {scene.name}
              </p>
              <p className="mt-2 text-[length:var(--text-sm)] text-ink-muted">
                {scene.note}
              </p>
            </Link>
          </Panel>
        ))}
      </ul>
    </div>
  );
}
