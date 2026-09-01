import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Citation } from '@/components/ui/Citation';
import { ReferenceList } from '@/components/ui/ReferenceList';
import { Panel } from '@/components/ui/Panel';
import { Tag } from '@/components/ui/Tag';
import { QuantumCircuitScene } from '@/components/3d/lazy';
import { ALGORITHMS, COMPLEXITY_LABELS } from '@/content/algorithms';
import { buildReferences, REFERENCES, type ReferenceKey } from '@/content/references';

export const metadata: Metadata = {
  title: 'Algorithms',
  description:
    'Shor, Grover, VQE, QAOA, quantum machine learning and quantum simulation: what each actually does, what the speed-up genuinely is, and what the hardware has to look like first.',
};

const TONE = {
  exponential: 'teal',
  quadratic: 'violet',
  polynomial: 'violet',
  heuristic: 'amber',
} as const;

export default function AlgorithmsPage() {
  const { list, numberOf } = buildReferences(
    ALGORITHMS.flatMap((algorithm) => algorithm.cites),
  );

  return (
    <PageShell
      plate="02"
      eyebrow="What it is for"
      title="Algorithms"
      lede="Six algorithms and algorithm families. Each entry states the speed-up honestly and then states the resource requirement, because giving the asymptotics without the requirement is how people come to believe a desktop machine is about to break RSA."
    >
      <div className="mb-20 h-[34rem] border border-hairline">
        <QuantumCircuitScene selectable />
      </div>

      <div className="space-y-20">
        {ALGORITHMS.map((algorithm) => (
          <article
            key={algorithm.slug}
            id={algorithm.slug}
            className="scroll-mt-24"
          >
            <div className="flex flex-wrap items-baseline gap-4 border-b border-hairline pb-5">
              <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                {algorithm.index}
              </span>
              <h2 className="text-[length:var(--text-2xl)] text-ink">
                {algorithm.name}
              </h2>
              <Tag tone={TONE[algorithm.complexity.kind]} swatch>
                {COMPLEXITY_LABELS[algorithm.complexity.kind]}
              </Tag>
            </div>

            <p className="mt-6 max-w-3xl text-[length:var(--text-lg)] leading-relaxed text-ink-muted">
              {algorithm.tagline}
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
              <div className="max-w-3xl">
                <h3 className="label-caps">The problem</h3>
                <p className="mt-3 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
                  {algorithm.problem}
                </p>

                <h3 className="label-caps mt-8">How it works</h3>
                <div className="mt-3 space-y-5">
                  {algorithm.mechanism.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[length:var(--text-base)] leading-relaxed text-ink-muted"
                    >
                      {paragraph}
                      {index === algorithm.mechanism.length - 1 && (
                        <span className="whitespace-nowrap">
                          {algorithm.cites.map((key: ReferenceKey) => (
                            <Citation
                              key={key}
                              n={numberOf(key)}
                              href={REFERENCES[key].href}
                              source={REFERENCES[key].source}
                            />
                          ))}
                        </span>
                      )}
                    </p>
                  ))}
                </div>

                <h3 className="label-caps mt-8">Why it matters</h3>
                <p className="mt-3 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
                  {algorithm.relevance}
                </p>
              </div>

              <aside className="space-y-px self-start border border-hairline bg-hairline">
                <div className="bg-inset p-5">
                  <p className="label-caps">Best known classical</p>
                  <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                    {algorithm.complexity.classical}
                  </p>
                </div>
                <div className="bg-inset p-5">
                  <p className="label-caps">Quantum</p>
                  <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-teal">
                    {algorithm.complexity.quantum}
                  </p>
                </div>
                <div className="bg-inset p-5">
                  <p className="label-caps !text-amber/80">
                    What the hardware needs first
                  </p>
                  <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                    {algorithm.requirement}
                  </p>
                </div>
              </aside>
            </div>
          </article>
        ))}
      </div>

      <Panel bracketed className="mt-20 p-7">
        <p className="label-caps">A note on reading advantage claims</p>
        <p className="mt-3 max-w-3xl text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
          Every quantum advantage claim is a comparison, and a comparison is
          only as strong as its classical baseline. Several widely reported
          demonstrations were substantially weakened when classical algorithms
          or simulation techniques improved afterwards. When you meet a new
          claim, the first question is what it was measured against, and the
          second is whether that baseline was tuned by someone with an
          interest in it losing.
        </p>
      </Panel>

      <ReferenceList references={list} className="mt-20" />
    </PageShell>
  );
}
