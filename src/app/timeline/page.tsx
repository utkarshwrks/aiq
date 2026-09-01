import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Tag } from '@/components/ui/Tag';
import { Citation } from '@/components/ui/Citation';
import { ReferenceList } from '@/components/ui/ReferenceList';
import { Readout } from '@/components/ui/Readout';
import { ERA_LABELS, MILESTONES, byDecade } from '@/content/timeline';
import { buildReferences, REFERENCES } from '@/content/references';

export const metadata: Metadata = {
  title: 'Timeline',
  description:
    'The history of quantum computing from Benioff and Feynman to below-threshold error correction, selected for events the field would have gone differently without.',
};

const ERA_TONE = {
  theory: 'violet',
  algorithms: 'teal',
  experiment: 'teal',
  engineering: 'neutral',
  policy: 'amber',
} as const;

export default function TimelinePage() {
  const decades = byDecade();
  const { list, numberOf } = buildReferences(
    MILESTONES.flatMap((milestone) => milestone.cites ?? []),
  );

  return (
    <PageShell
      plate="06"
      eyebrow="How it got here"
      title="Timeline"
      lede="Selected on one rule: an entry is here because the field would have gone differently without it. Product launches and qubit-count records appear only where they changed what people believed was achievable."
      aside={
        <div className="flex gap-8">
          <Readout label="Entries" value={MILESTONES.length} align="right" />
          <Readout
            label="Span"
            value={`${MILESTONES[0]?.year ?? ''}-${MILESTONES.at(-1)?.year ?? ''}`}
            tone="teal"
            align="right"
          />
        </div>
      }
    >
      <div className="space-y-16">
        {decades.map(({ decade, items }) => (
          <section key={decade} id={decade} className="scroll-mt-24">
            <div className="mb-8 flex items-center gap-5">
              <h2 className="data text-[length:var(--text-3xl)] leading-none text-ink-faint">
                {decade}
              </h2>
              <div aria-hidden className="cg-rule flex-1" />
              <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                {items.length}
              </span>
            </div>

            <ol className="relative space-y-10 border-l border-hairline pl-8 md:pl-12">
              {items.map((milestone) => (
                <li
                  key={`${milestone.year}-${milestone.title}`}
                  className="relative"
                >
                  {/* Survey tick on the rail. */}
                  <span
                    aria-hidden
                    className="absolute -left-8 top-2 h-px w-5 bg-hairline-strong md:-left-12 md:w-9"
                  />
                  <span
                    aria-hidden
                    className="absolute -left-[calc(2rem+3px)] top-[5px] size-1.5 rounded-full bg-teal md:-left-[calc(3rem+3px)]"
                  />

                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="data text-[length:var(--text-lg)] leading-none text-teal">
                      {milestone.year}
                    </span>
                    {milestone.month && (
                      <span className="data text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint">
                        {milestone.month}
                      </span>
                    )}
                    <Tag tone={ERA_TONE[milestone.era]} swatch>
                      {ERA_LABELS[milestone.era]}
                    </Tag>
                  </div>

                  <h3 className="mt-3 max-w-2xl text-[length:var(--text-xl)] leading-snug text-ink">
                    {milestone.title}
                  </h3>

                  <p className="mt-3 max-w-3xl text-[length:var(--text-base)] leading-relaxed text-ink-muted">
                    {milestone.body}
                    {milestone.cites?.map((key) => (
                      <Citation
                        key={key}
                        n={numberOf(key)}
                        href={REFERENCES[key].href}
                        source={REFERENCES[key].source}
                      />
                    ))}
                  </p>

                  <p className="data mt-3 text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint">
                    {milestone.actor}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <ReferenceList references={list} className="mt-20" />
    </PageShell>
  );
}
