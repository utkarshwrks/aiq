import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Scene lab',
  robots: { index: false, follow: false },
};

const SCENES = [
  { href: '/lab/bloch', label: 'Bloch sphere' },
  { href: '/lab/circuit', label: 'Quantum circuit' },
  { href: '/lab/entanglement', label: 'Entangled pair' },
] as const;

/**
 * An isolation harness for the 3D scenes, built before any of them were
 * wired into a real route. Each scene gets a page of its own at a fixed
 * size against the product's own surfaces, which is the only reliable way
 * to judge whether a scene reads correctly and to profile it without the
 * rest of a page competing for the frame budget.
 *
 * Excluded from indexing; it is a development surface, not content.
 */
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="pt-14">
      <div className="border-b border-hairline bg-inset">
        <Container width="wide">
          <div className="flex flex-wrap items-center gap-6 py-4">
            <span className="label-caps">Scene lab</span>
            <nav aria-label="Scenes" className="flex flex-wrap gap-5">
              {SCENES.map((scene) => (
                <Link
                  key={scene.href}
                  href={scene.href}
                  className="font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-muted transition-colors duration-[var(--dur-fast)] hover:text-teal"
                >
                  {scene.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </div>
      <Container width="wide" className="py-10">
        {children}
      </Container>
    </main>
  );
}
