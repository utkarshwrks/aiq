'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { Tag } from '@/components/ui/Tag';
import { MODALITIES, PLAYERS, type Player } from '@/content/ecosystem';
import { INDIA_NODES, type IndiaNode } from '@/content/india';
import { cn } from '@/lib/cn';

/**
 * The ecosystem plot.
 *
 * There is no coastline in this map, and that is a decision rather than
 * an omission. What the reader needs from it is where the programmes are
 * relative to one another, and a graticule with plotted nodes states
 * exactly that - the way a survey chart does - without shipping a
 * quarter of a megabyte of country outlines to say the same thing.
 *
 * Equirectangular projection, stated explicitly on the plate, because a
 * chart that does not name its projection is decoration.
 */

const WIDTH = 1000;
const HEIGHT = 500;

/**
 * The plot is cropped to 72N-45S. Every programme in the register sits
 * inside that band, and the full 90-to-90 extent spends a third of the
 * figure's height on empty polar ocean. The caption states the crop.
 */
const VIEW_TOP = ((90 - 72) / 180) * HEIGHT;
const VIEW_BOTTOM = ((90 + 45) / 180) * HEIGHT;
const VIEW_HEIGHT = VIEW_BOTTOM - VIEW_TOP;

/**
 * Region labels. Without a coastline the reader needs some anchor, and
 * four faint chart labels do the job that a quarter megabyte of country
 * outlines would otherwise be doing.
 */
const REGION_LABELS: ReadonlyArray<{ text: string; lat: number; lon: number }> = [
  { text: 'NORTH AMERICA', lat: 48, lon: -100 },
  { text: 'SOUTH AMERICA', lat: -14, lon: -60 },
  { text: 'EUROPE', lat: 58, lon: 18 },
  { text: 'AFRICA', lat: 4, lon: 20 },
  { text: 'ASIA', lat: 46, lon: 96 },
  { text: 'OCEANIA', lat: -24, lon: 137 },
];

/** Equirectangular: longitude maps linearly to x, latitude to y. */
function project(lat: number, lon: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * WIDTH,
    y: ((90 - lat) / 180) * HEIGHT,
  };
}

type Node = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  label: string;
  detail: string;
  href: string;
  india: boolean;
};

export function EcosystemMap() {
  const [active, setActive] = useState<Node | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const global = PLAYERS.map((player: Player) => ({
      id: `p-${player.slug}`,
      name: player.name,
      lat: player.lat,
      lon: player.lon,
      label: MODALITIES[player.modality].label,
      detail: `${player.location}, ${player.country}`,
      href: `/ecosystem#${player.slug}`,
      india: false,
    }));

    // Only the mission hubs and companies are plotted; putting every
    // Indian institution on a world map at this scale would produce one
    // unreadable blob over the subcontinent.
    const india = INDIA_NODES.filter(
      (node: IndiaNode) => node.kind === 'hub' || node.kind === 'company',
    ).map((node) => ({
      id: `i-${node.slug}`,
      name: node.name,
      lat: node.lat,
      lon: node.lon,
      label: node.kind === 'hub' ? 'Mission hub' : 'Company',
      detail: `${node.city}, India`,
      href: `/india#${node.slug}`,
      india: true,
    }));

    return [...global, ...india];
  }, []);

  return (
    <section
      aria-labelledby="ecosystem-heading"
      className="relative border-b border-hairline py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[104rem] px-[var(--shell-gutter)]">
        <SectionHeader
          index="03"
          eyebrow="Ecosystem"
          title="Where the programmes are"
          description="Hardware programmes and mission hubs plotted on an equirectangular graticule. Colour marks the physical modality, not the company."
          action={<InstrumentLink href="/ecosystem">Open the register</InstrumentLink>}
        />

        <div className="mt-10 grid gap-px border border-hairline bg-hairline lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="relative bg-inset p-4">
            <svg
              viewBox={`0 ${VIEW_TOP} ${WIDTH} ${VIEW_HEIGHT}`}
              className="w-full"
              role="img"
              aria-label={`World plot of ${nodes.length} quantum computing programmes and mission hubs`}
            >
              {/* Graticule: meridians every 30 degrees, parallels every 20. */}
              <g stroke="var(--cg-line-grid)" strokeWidth="1">
                {Array.from({ length: 13 }, (_, i) => {
                  const x = (i / 12) * WIDTH;
                  return (
                    <line key={`m${i}`} x1={x} y1={VIEW_TOP} x2={x} y2={VIEW_BOTTOM} />
                  );
                })}
                {[60, 40, 20, 0, -20, -40].map((lat) => {
                  const { y } = project(lat, 0);
                  return <line key={`p${lat}`} x1="0" y1={y} x2={WIDTH} y2={y} />;
                })}
              </g>

              {/* The equator, weighted, as any chart would draw it. */}
              <line
                x1="0"
                y1={HEIGHT / 2}
                x2={WIDTH}
                y2={HEIGHT / 2}
                stroke="var(--cg-accent-teal)"
                strokeOpacity="0.28"
                strokeWidth="1.2"
              />

              {/* Coordinate labels along the top and left edges. */}
              <g
                fill="var(--cg-ink-faint)"
                fontSize="9"
                fontFamily="var(--font-mono)"
              >
                {[-180, -120, -60, 0, 60, 120, 180].map((lon) => (
                  <text
                    key={lon}
                    x={project(0, lon).x}
                    y={VIEW_TOP + 12}
                    textAnchor={lon === -180 ? 'start' : lon === 180 ? 'end' : 'middle'}
                  >
                    {lon}
                  </text>
                ))}
                {[60, 40, 20, 0, -20, -40].map((lat) => (
                  <text key={lat} x="4" y={project(lat, 0).y + 3}>
                    {lat}
                  </text>
                ))}
              </g>

              {/* Region anchors, held well back so they never compete
                  with the plotted markers. */}
              <g
                fill="var(--cg-ink-faint)"
                fillOpacity="0.45"
                fontSize="11"
                fontFamily="var(--font-mono)"
                letterSpacing="2"
                textAnchor="middle"
                aria-hidden
              >
                {REGION_LABELS.map((label) => {
                  const { x, y } = project(label.lat, label.lon);
                  return (
                    <text key={label.text} x={x} y={y}>
                      {label.text}
                    </text>
                  );
                })}
              </g>

              {nodes.map((node) => {
                const { x, y } = project(node.lat, node.lon);
                const isActive = active?.id === node.id;
                const colour = node.india
                  ? 'var(--cg-accent-amber)'
                  : 'var(--cg-accent-teal)';

                return (
                  <g key={node.id}>
                    {isActive && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke={colour}
                        strokeOpacity="0.4"
                      />
                    )}
                    {/* Survey cross, not a pin. */}
                    <line
                      x1={x - 5}
                      y1={y}
                      x2={x + 5}
                      y2={y}
                      stroke={colour}
                      strokeWidth="1"
                      opacity={isActive ? 1 : 0.6}
                    />
                    <line
                      x1={x}
                      y1={y - 5}
                      x2={x}
                      y2={y + 5}
                      stroke={colour}
                      strokeWidth="1"
                      opacity={isActive ? 1 : 0.6}
                    />
                    <circle cx={x} cy={y} r={isActive ? 4 : 2.6} fill={colour} />

                    {/* Generous transparent hit area. */}
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setActive(node)}
                      onMouseLeave={() => setActive(null)}
                    >
                      <title>{`${node.name}, ${node.detail}`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>

            <p className="data mt-2 text-[length:var(--text-2xs)] text-ink-faint">
              EQUIRECTANGULAR PROJECTION / 72N TO 45S / {nodes.length} PLOTTED
            </p>
          </div>

          {/* --- Legend and detail ------------------------------------ */}
          <div className="flex flex-col bg-surface">
            <div className="border-b border-hairline p-5">
              <p className="label-caps mb-3">Legend</p>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-[length:var(--text-xs)] text-ink-muted">
                  <span aria-hidden className="size-1.5 bg-teal" />
                  Global hardware and platform programmes
                </span>
                <span className="flex items-center gap-2 text-[length:var(--text-xs)] text-ink-muted">
                  <span aria-hidden className="size-1.5 bg-amber" />
                  Indian mission hubs and companies
                </span>
              </div>
            </div>

            <div className="min-h-[12rem] flex-1 p-5">
              {active ? (
                <div>
                  <Tag tone={active.india ? 'amber' : 'teal'} swatch>
                    {active.label}
                  </Tag>
                  <h3 className="mt-3 text-[length:var(--text-lg)] text-ink">
                    {active.name}
                  </h3>
                  <p className="data mt-1.5 text-[length:var(--text-2xs)] text-ink-faint">
                    {active.detail}
                  </p>
                  <p className="data mt-4 text-[length:var(--text-2xs)] text-ink-faint">
                    {active.lat.toFixed(2)} / {active.lon.toFixed(2)}
                  </p>
                  <Link
                    href={active.href}
                    className="mt-5 inline-block font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-teal underline decoration-teal/30 underline-offset-4 hover:decoration-teal"
                  >
                    Read the entry
                  </Link>
                </div>
              ) : (
                <p className="text-[length:var(--text-xs)] leading-relaxed text-ink-faint">
                  Hover a marker to resolve it. Every plotted programme has an
                  entry on the ecosystem or India plate.
                </p>
              )}
            </div>

            <ul className="border-t border-hairline p-5">
              <p className="label-caps mb-3">Modalities represented</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MODALITIES).map(([key, modality]) => (
                  <li key={key} className={cn('list-none')}>
                    <Tag>{modality.label}</Tag>
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
