import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Tag } from '@/components/ui/Tag';
import { Readout } from '@/components/ui/Readout';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { Citation } from '@/components/ui/Citation';
import { ReferenceList } from '@/components/ui/ReferenceList';
import {
  HUBS,
  INDIA_NODES,
  MISSION,
  NODE_KIND_LABELS,
} from '@/content/india';
import { buildReferences, REFERENCES } from '@/content/references';

export const metadata: Metadata = {
  title: 'India',
  description:
    'The Indian quantum ecosystem: the National Quantum Mission and its four thematic hubs, the research institutions carrying the work, the government agencies deploying it, and the companies commercialising it.',
};

const KIND_ORDER: Array<(typeof INDIA_NODES)[number]['kind']> = [
  'hub',
  'institution',
  'agency',
  'company',
];

const KIND_TONE = {
  hub: 'amber',
  institution: 'teal',
  agency: 'violet',
  company: 'neutral',
} as const;

export default function IndiaPage() {
  const { list, numberOf } = buildReferences([
    ...MISSION.cites,
    ...INDIA_NODES.flatMap((node) => node.cites ?? []),
  ]);

  return (
    <PageShell
      plate="04"
      eyebrow="National programme"
      title="India"
      lede="A funded national mission delivered through four thematic hubs at existing institutions, alongside a research base that predates it and a small but real commercial sector. Figures below are given only where a primary government source states them."
      width="wide"
      aside={
        <div className="flex gap-8">
          <Readout label="Hubs" value={HUBS.length} tone="amber" align="right" />
          <Readout label="Entries" value={INDIA_NODES.length} align="right" />
          <Readout label="To" value={2031} note="mission horizon" align="right" />
        </div>
      }
    >
      {/* --- The mission --------------------------------------------- */}
      <section aria-labelledby="mission-heading" className="scroll-mt-24">
        <div className="grid gap-px border border-hairline bg-hairline lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="bg-surface p-8">
            <p className="label-caps">{MISSION.department}</p>
            <h2
              id="mission-heading"
              className="mt-4 text-[length:var(--text-2xl)] text-ink"
            >
              {MISSION.name}
            </h2>
            <p className="mt-5 max-w-2xl text-[length:var(--text-base)] leading-relaxed text-ink-muted">
              {MISSION.summary}
              {MISSION.cites.map((key) => (
                <Citation
                  key={key}
                  n={numberOf(key)}
                  href={REFERENCES[key].href}
                  source={REFERENCES[key].source}
                />
              ))}
            </p>

            <h3 className="label-caps mt-8">Stated objectives</h3>
            <ul className="mt-4 space-y-3">
              {MISSION.objectives.map((objective, index) => (
                <li
                  key={objective}
                  className="flex gap-3 text-[length:var(--text-sm)] leading-relaxed text-ink-muted"
                >
                  <span className="data shrink-0 pt-0.5 text-[length:var(--text-2xs)] text-amber">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-hairline lg:grid-cols-1">
            {[
              ['Approved', MISSION.approved],
              ['Outlay', MISSION.outlay],
              ['Period', MISSION.period],
              ['Hubs', String(HUBS.length)],
            ].map(([label, value]) => (
              <div key={label} className="bg-inset p-5">
                <dt className="label-caps">{label}</dt>
                <dd className="data mt-2 text-[length:var(--text-base)] text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- The register --------------------------------------------- */}
      <div className="mt-20 space-y-14">
        {KIND_ORDER.map((kind) => {
          const nodes = INDIA_NODES.filter((node) => node.kind === kind);
          if (nodes.length === 0) return null;

          return (
            <section key={kind} id={kind} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline gap-4 border-b border-hairline pb-5">
                <h2 className="text-[length:var(--text-xl)] text-ink">
                  {NODE_KIND_LABELS[kind]}
                </h2>
                <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                  {nodes.length}
                </span>
              </div>

              <ul className="mt-6 grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-3">
                {nodes.map((node) => (
                  <Panel
                    as="li"
                    key={node.slug}
                    id={node.slug}
                    className="scroll-mt-24 flex flex-col gap-4 rounded-none border-0 p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[length:var(--text-lg)] leading-snug text-ink">
                        {node.name}
                      </h3>
                      <Tag tone={KIND_TONE[node.kind]} swatch>
                        {NODE_KIND_LABELS[node.kind]}
                      </Tag>
                    </div>

                    <p className="data text-[length:var(--text-2xs)] text-ink-faint">
                      {node.city.toUpperCase()} / {node.lat.toFixed(2)},{' '}
                      {node.lon.toFixed(2)}
                    </p>

                    <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                      {node.detail}
                    </p>

                    <ul className="flex flex-wrap gap-1.5">
                      {node.focus.map((item) => (
                        <li key={item}>
                          <Tag>{item}</Tag>
                        </li>
                      ))}
                    </ul>

                    {node.homepage && (
                      <div className="mt-auto pt-2">
                        <InstrumentLink href={node.homepage} external>
                          {new URL(node.homepage).hostname.replace(/^www\./, '')}
                        </InstrumentLink>
                      </div>
                    )}
                  </Panel>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <ReferenceList references={list} className="mt-20" />
    </PageShell>
  );
}
