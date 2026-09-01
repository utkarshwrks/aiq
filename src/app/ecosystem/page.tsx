import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Tag } from '@/components/ui/Tag';
import { Readout } from '@/components/ui/Readout';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { ReferenceList } from '@/components/ui/ReferenceList';
import { MODALITIES, PLAYERS, playersByModality } from '@/content/ecosystem';
import { buildReferences } from '@/content/references';

export const metadata: Metadata = {
  title: 'Ecosystem',
  description:
    'The global quantum hardware landscape organised by physical modality: superconducting, trapped ion, neutral atom, photonic, silicon spin, annealing and topological programmes, and the platforms that provide access to them.',
};

export default function EcosystemPage() {
  const groups = playersByModality();
  const { list } = buildReferences(PLAYERS.flatMap((p) => p.cites ?? []));

  return (
    <PageShell
      plate="03"
      eyebrow="Who is building what"
      title="Ecosystem"
      lede="Organised by physical modality rather than by company, because what a programme's qubits are made of determines its coherence times, its connectivity, its cooling requirements and its scaling path. Qubit counts are not listed here; they change faster than a page can, and the feed is where current numbers belong."
      width="wide"
      aside={
        <div className="flex gap-8">
          <Readout label="Programmes" value={PLAYERS.length} align="right" />
          <Readout
            label="Modalities"
            value={groups.length}
            tone="teal"
            align="right"
          />
        </div>
      }
    >
      <div className="space-y-16">
        {groups.map(({ modality, players }) => {
          const info = MODALITIES[modality];
          return (
            <section key={modality} id={modality} className="scroll-mt-24">
              <div className="border-b border-hairline pb-6">
                <div className="flex flex-wrap items-baseline gap-4">
                  <h2 className="text-[length:var(--text-2xl)] text-ink">
                    {info.label}
                  </h2>
                  <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                    {players.length}{' '}
                    {players.length === 1 ? 'programme' : 'programmes'}
                  </span>
                </div>

                <div className="mt-5 grid max-w-5xl gap-6 md:grid-cols-2">
                  <div>
                    <p className="label-caps">Principle</p>
                    <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                      {info.principle}
                    </p>
                  </div>
                  <div>
                    <p className="label-caps">Trade-off</p>
                    <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                      {info.tradeoff}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-3">
                {players.map((player) => (
                  <Panel
                    as="li"
                    key={player.slug}
                    id={player.slug}
                    className="scroll-mt-24 flex flex-col gap-4 rounded-none border-0 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[length:var(--text-lg)] leading-snug text-ink">
                        {player.name}
                      </h3>
                      <Tag swatch>{info.label}</Tag>
                    </div>

                    <p className="data text-[length:var(--text-2xs)] text-ink-faint">
                      {player.location.toUpperCase()} / {player.country.toUpperCase()}
                    </p>

                    <p className="text-[length:var(--text-sm)] leading-relaxed text-teal/90">
                      {player.position}
                    </p>

                    <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
                      {player.detail}
                    </p>

                    <div className="mt-auto pt-2">
                      <InstrumentLink href={player.homepage} external>
                        {new URL(player.homepage).hostname.replace(/^www\./, '')}
                      </InstrumentLink>
                    </div>
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
