import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { Readout } from '@/components/ui/Readout';
import { EntanglementParticles } from '@/components/3d/lazy';
import {
  ALL_SOURCES,
  FEED_SOURCE_COUNT,
  SOURCE_COUNT,
  AGGREGATOR_SOURCES,
} from '@/lib/sources';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What AIQuantumOS is, how its content is written and sourced, how the ingestion pipeline works, and who maintains it.',
};

const HTML_SOURCE_COUNT = ALL_SOURCES.filter((s) => s.kind === 'HTML').length;

export default function AboutPage() {
  return (
    <PageShell
      plate="08"
      eyebrow="Colophon"
      title="About"
      lede="A reference for quantum computing that is maintained rather than published: the explanatory material is written from primary sources and cited, and the feed reads the field's own publications on a schedule."
      width="prose"
    >
      <div className="space-y-16">
        <section aria-labelledby="what-heading">
          <h2 id="what-heading" className="text-[length:var(--text-2xl)] text-ink">
            What this is
          </h2>
          <div className="mt-5 space-y-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            <p>
              Quantum computing is unusually badly served by its own coverage.
              The introductory material is mostly metaphor, the trade press
              reports qubit counts as though they were comparable across
              architectures, and the primary literature is written for people
              who already know the subject. Someone trying to form an accurate
              picture has to triangulate between three registers, none of which
              is aimed at them.
            </p>
            <p>
              AIQuantumOS is an attempt at the missing middle. The explanatory
              plates are written from first principles and cite what they were
              checked against. The ecosystem is organised by the thing that
              actually constrains a programme - its physical modality - rather
              than by company size. The timeline includes an event only if the
              field would have gone differently without it. And the feed reads
              the sources themselves rather than reporting on the reporting.
            </p>
            <p>
              It is built as a reference that stays current, which is a
              different engineering problem from a site that is published once.
              The ingestion pipeline, the source registry, and the disclosure
              of both are the parts of this product that took the most work,
              and they are the parts that make the rest of it trustworthy.
            </p>
          </div>
        </section>

        <div className="h-[22rem] border border-hairline">
          <EntanglementParticles />
        </div>

        <section aria-labelledby="sourcing-heading" id="sourcing" className="scroll-mt-24">
          <h2
            id="sourcing-heading"
            className="text-[length:var(--text-2xl)] text-ink"
          >
            How we source our data
          </h2>

          <div className="mt-5 space-y-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            <p>
              Two kinds of material appear on this site and they are sourced
              differently.
            </p>
            <p>
              <strong className="font-medium text-ink">
                The explanatory plates
              </strong>{' '}
              - foundations, algorithms, ecosystem, India, timeline and
              glossary - are written originally. Nothing is reproduced from a
              source, and every non-trivial factual claim carries an inline
              marker resolving to a numbered reference at the foot of the
              plate. The sources are the primary literature where a result has
              one, and vendor and institutional documentation for engineering
              detail. Where a claim is contested, the plate says it is
              contested rather than picking a side quietly.
            </p>
            <p>
              <strong className="font-medium text-ink">The Update Panel</strong>{' '}
              indexes; it does not republish. Each entry is a headline, a
              single-line summary written during ingestion, a topic
              classification and a link out to the publisher. Summaries are
              capped well below any reasonable excerpt length, and an item with
              nothing usable to summarise is dropped rather than padded with a
              restatement of its own headline.
            </p>
          </div>

          <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {[
              ['Sources', SOURCE_COUNT, 'in the registry'],
              ['Via feed or API', FEED_SOURCE_COUNT, 'not scraped'],
              ['Page markup', HTML_SOURCE_COUNT, 'no feed offered'],
            ].map(([label, value, note]) => (
              <div key={String(label)} className="bg-inset p-5">
                <Readout
                  label={String(label)}
                  value={Number(value)}
                  note={String(note)}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            <p>
              Official feeds and public APIs are used wherever a publisher
              offers one, and page markup is read only where none exists. Every
              request carries an identifying user agent pointing back to this
              page, so a publisher who would rather not be read can block us and
              knows who to contact. Sources that answer with a 403 are removed
              from the registry rather than worked around: at least one
              government feed was dropped for exactly that reason, because
              spoofing a browser user agent to get past a refusal is not
              something this pipeline does.
            </p>
            {AGGREGATOR_SOURCES.length > 0 && (
              <p>
                {AGGREGATOR_SOURCES.length} of the registry entries are news
                search feeds rather than publishers. Items arriving through
                those are credited to the outlet that did the reporting, not to
                the aggregator that surfaced it, and the source table on the
                updates plate marks them as search entries.
              </p>
            )}
            <p>
              India is a separate column rather than a filter, and an item is
              routed there by subject rather than by the nationality of its
              publisher: when an international trade title reports on the
              National Quantum Mission, that belongs in the India lens.
            </p>
          </div>

          <div className="mt-8">
            <InstrumentLink href="/updates#sources-heading">
              The full source register
            </InstrumentLink>
          </div>
        </section>

        <section aria-labelledby="limits-heading">
          <h2 id="limits-heading" className="text-[length:var(--text-2xl)] text-ink">
            What this is not
          </h2>
          <Panel bracketed className="mt-5 p-6">
            <ul className="space-y-4 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
              <li>
                <span className="text-ink">Not a news service.</span> The panel
                surfaces what the field published and links out. It does not
                report, and it does not add analysis to items it indexes.
              </li>
              <li>
                <span className="text-ink">Not a benchmark.</span> Qubit counts
                and fidelity figures are not tabulated here, because they are
                measured differently across architectures and a table would
                imply a comparability that does not exist.
              </li>
              <li>
                <span className="text-ink">Not exhaustive.</span> The ecosystem
                register covers programmes with a distinct technical position.
                Absence from it is not a judgement.
              </li>
              <li>
                <span className="text-ink">Not advice.</span> Nothing here is
                investment guidance, and the presence of a company in the
                register is not an endorsement of it.
              </li>
            </ul>
          </Panel>
        </section>

        <section aria-labelledby="who-heading">
          <h2 id="who-heading" className="text-[length:var(--text-2xl)] text-ink">
            Who maintains it
          </h2>
          <div className="mt-5 space-y-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            <p>
              AIQuantumOS is built and maintained by{' '}
              <strong className="font-medium text-ink">
                {SITE.builder.name}
              </strong>
              , a {SITE.builder.recognition.toLowerCase()}, incubated at IIT
              Indore.
            </p>
            <p>
              Corrections are welcome and are the most useful contribution
              anyone can make to a reference. If a plate states something
              inaccurately, or a source in the registry has changed its feed or
              would prefer not to be indexed, that is worth telling us about.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
