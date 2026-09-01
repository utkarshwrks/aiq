import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Citation } from '@/components/ui/Citation';
import { ReferenceList } from '@/components/ui/ReferenceList';
import { Panel } from '@/components/ui/Panel';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { BlochSphere } from '@/components/3d/lazy';
import { CONCEPTS } from '@/content/foundations';
import { buildReferences, REFERENCES, type ReferenceKey } from '@/content/references';

export const metadata: Metadata = {
  title: 'Foundations',
  description:
    'Qubits, superposition, entanglement, interference, gates, decoherence, error correction and measurement, each written from first principles and each correcting the version of itself that circulates most widely.',
};

export default function FoundationsPage() {
  const { list, numberOf } = buildReferences(
    CONCEPTS.flatMap((concept) => concept.cites),
  );

  return (
    <PageShell
      plate="01"
      eyebrow="First principles"
      title="Foundations"
      lede="Eight ideas, in the order they depend on one another. Each is written to correct the version of itself that circulates most widely, because an explanation that does not name the common mis-statement leaves the reader holding both."
      aside={
        <nav aria-label="Concepts on this page" className="hidden max-w-xs lg:block">
          <p className="label-caps mb-3">On this plate</p>
          <ol className="space-y-1.5">
            {CONCEPTS.map((concept) => (
              <li key={concept.slug}>
                <a
                  href={`#${concept.slug}`}
                  className="group flex items-baseline gap-2.5 text-[length:var(--text-sm)] text-ink-muted transition-colors duration-[var(--dur-fast)] hover:text-teal"
                >
                  <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                    {concept.index}
                  </span>
                  {concept.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      }
    >
      {/* The instrument, positioned where the qubit is first described. */}
      <div className="mb-20 grid gap-px border border-hairline bg-hairline lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="h-[30rem] bg-inset">
          <BlochSphere />
        </div>
        <div className="flex flex-col justify-center gap-4 bg-surface p-7">
          <p className="label-caps">Instrument</p>
          <h2 className="text-[length:var(--text-xl)] text-ink">
            One qubit, in full
          </h2>
          <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
            Every pure state of a single qubit is a point on this sphere. Drag
            the vector, or focus the readout below it and use the arrow keys.
            The two probabilities always sum to one, and the phase - the
            azimuthal angle - changes nothing about them, which is exactly why
            it carries no classical counterpart.
          </p>
          <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
            Note what happens at the poles: the phase becomes meaningless. A
            qubit in a definite basis state has no phase to speak of, and that
            is the sense in which measurement destroys it.
          </p>
        </div>
      </div>

      <div className="space-y-20">
        {CONCEPTS.map((concept) => (
          <article
            key={concept.slug}
            id={concept.slug}
            className="scroll-mt-24 grid gap-10 lg:grid-cols-[minmax(0,7rem)_minmax(0,1fr)]"
          >
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="data text-[length:var(--text-2xs)] text-ink-faint">
                {concept.index}
              </p>
              <div aria-hidden className="cg-ticks mt-3 w-full opacity-50" />
            </div>

            <div className="max-w-3xl">
              <h2 className="text-[length:var(--text-2xl)] text-ink">
                {concept.name}
              </h2>

              <p className="mt-4 text-[length:var(--text-lg)] leading-relaxed text-ink-muted">
                {concept.definition}
              </p>

              <div className="mt-7 space-y-5">
                {concept.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[length:var(--text-base)] leading-relaxed text-ink-muted"
                  >
                    {paragraph}
                    {index === concept.body.length - 1 && (
                      <span className="whitespace-nowrap">
                        {concept.cites.map((key: ReferenceKey) => (
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

              <Panel bracketed className="mt-8 border-amber/20 bg-amber/[0.03] p-6">
                <p className="label-caps !text-amber/80">Commonly mis-stated</p>
                <p className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                  {concept.corrects}
                </p>
              </Panel>

              {concept.leadsTo.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="label-caps">Continue to</span>
                  {concept.leadsTo.map((slug) => (
                    <InstrumentLink key={slug} href={`#${slug}`}>
                      {slug.replace(/-/g, ' ')}
                    </InstrumentLink>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <ReferenceList references={list} className="mt-24" />
    </PageShell>
  );
}
