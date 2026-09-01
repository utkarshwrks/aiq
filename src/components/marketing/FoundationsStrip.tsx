'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { LANDING_CONCEPTS } from '@/content/foundations';
import { cn } from '@/lib/cn';

/**
 * The foundations strip.
 *
 * Each card carries a micro-instrument rather than an icon: a state
 * readout that flickers between basis states on hover for superposition,
 * a pair of correlated markers for entanglement, a decaying bar for
 * decoherence. The animation is the definition, restated in a form the
 * eye reads before the sentence does.
 */
export function FoundationsStrip() {
  return (
    <section
      aria-labelledby="foundations-heading"
      className="relative border-b border-hairline py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[104rem] px-[var(--shell-gutter)]">
        <SectionHeader
          index="01"
          eyebrow="Foundations"
          title="The ideas the rest of it rests on"
          description="Six concepts, each written to correct the version of itself that circulates most widely. Read them in order and the algorithms plate stops needing analogies."
          action={<InstrumentLink href="/foundations">All foundations</InstrumentLink>}
        />

        <ul className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_CONCEPTS.map((concept) => (
            <ConceptCard key={concept.slug} slug={concept.slug} index={concept.index} name={concept.name} definition={concept.definition} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ConceptCard({
  slug,
  index,
  name,
  definition,
}: {
  slug: string;
  index: string;
  name: string;
  definition: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <li className="bg-surface">
      <Link
        href={`/foundations#${slug}`}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        className="group flex h-full flex-col gap-4 p-6 transition-colors duration-[var(--dur-fast)] hover:bg-elevated"
      >
        <div className="flex items-start justify-between">
          <span className="data text-[length:var(--text-2xs)] text-ink-faint">
            {index}
          </span>
          <MicroInstrument slug={slug} active={active} />
        </div>

        <h3 className="text-[length:var(--text-lg)] text-ink transition-colors duration-[var(--dur-fast)] group-hover:text-teal">
          {name}
        </h3>

        <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
          {definition}
        </p>
      </Link>
    </li>
  );
}

/**
 * The per-concept animation. Deliberately tiny and deliberately literal:
 * a decorative flourish would be worse than nothing here.
 */
function MicroInstrument({ slug, active }: { slug: string; active: boolean }) {
  const base = 'data text-[length:var(--text-2xs)] transition-all duration-[var(--dur-base)] ease-[var(--ease-instrument)]';

  switch (slug) {
    case 'qubit':
      // A vector tipping away from the pole.
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden className="text-teal">
          <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeOpacity="0.25" />
          <ellipse cx="14" cy="14" rx="11" ry="3.2" fill="none" stroke="currentColor" strokeOpacity="0.3" />
          <line
            x1="14"
            y1="14"
            x2={active ? 22 : 14}
            y2={active ? 8 : 4}
            stroke="currentColor"
            strokeWidth="1.6"
            className="transition-all duration-[var(--dur-base)] ease-[var(--ease-instrument)]"
          />
          <circle
            cx={active ? 22 : 14}
            cy={active ? 8 : 4}
            r="2"
            fill="currentColor"
            className="transition-all duration-[var(--dur-base)] ease-[var(--ease-instrument)]"
          />
        </svg>
      );

    case 'superposition':
      // The readout flickers between the two basis states.
      return (
        <span className={cn(base, 'text-teal', active && 'animate-pulse')}>
          {active ? '|0> + |1>' : '|0>'}
        </span>
      );

    case 'entanglement':
      // Two markers that always take opposite values.
      return (
        <span className={cn(base, 'flex items-center gap-1.5')}>
          <span className={active ? 'text-teal' : 'text-ink-faint'}>
            {active ? 'up' : '?'}
          </span>
          <span aria-hidden className="h-px w-3 bg-violet" />
          <span className={active ? 'text-violet' : 'text-ink-faint'}>
            {active ? 'down' : '?'}
          </span>
        </span>
      );

    case 'interference':
      // Two waves that cancel.
      return (
        <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden className="text-teal">
          <path
            d="M1 10 Q 5 2 9 10 T 17 10 T 25 10 T 33 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity={active ? 0.25 : 0.8}
            className="transition-opacity duration-[var(--dur-base)]"
          />
          <path
            d="M1 10 Q 5 18 9 10 T 17 10 T 25 10 T 33 10"
            fill="none"
            stroke="var(--cg-accent-violet)"
            strokeWidth="1.2"
            opacity={active ? 0.25 : 0.8}
            className="transition-opacity duration-[var(--dur-base)]"
          />
          <line
            x1="1"
            y1="10"
            x2="33"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity={active ? 1 : 0}
            className="transition-opacity duration-[var(--dur-base)]"
          />
        </svg>
      );

    case 'gates':
      // A pulse stepping through three gates.
      return (
        <span className={cn(base, 'flex items-center gap-1 text-ink-faint')}>
          {['H', 'X', 'M'].map((g, i) => (
            <span
              key={g}
              className={cn(
                'border px-1 transition-colors duration-[var(--dur-base)]',
                active && i === 1
                  ? 'border-teal text-teal'
                  : 'border-hairline',
              )}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {g}
            </span>
          ))}
        </span>
      );

    case 'decoherence':
      // A bar that decays.
      return (
        <span aria-hidden className="flex h-4 w-10 items-end gap-0.5">
          {[1, 0.82, 0.6, 0.4, 0.22, 0.1].map((height, i) => (
            <span
              key={i}
              className="w-1 bg-teal transition-all duration-[var(--dur-slow)] ease-[var(--ease-instrument)]"
              style={{
                height: `${(active ? height : 1) * 100}%`,
                opacity: active ? height : 0.5,
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </span>
      );

    default:
      return null;
  }
}
