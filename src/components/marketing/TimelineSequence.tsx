'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Tag, type TagTone } from '@/components/ui/Tag';
import { CompassRose } from '@/components/ui/CompassRose';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ERA_LABELS, type Era, type Milestone } from '@/content/timeline';
import { cn } from '@/lib/cn';

const ERA_TONE: Record<Era, TagTone> = {
  theory: 'violet',
  algorithms: 'teal',
  experiment: 'teal',
  engineering: 'neutral',
  policy: 'amber',
};

/**
 * The scroll-driven head of the timeline plate.
 *
 * The section pins for the length of the sequence and the survey rail
 * traverses sideways against page scroll, so reading the history is one
 * continuous movement across a chart rather than a series of jumps down
 * a list. The large year readout and the era swatch re-register as the
 * rail passes each mark, the way a plotter's cursor reports position.
 *
 * This is scrubbed, not hijacked. ScrollTrigger maps the reader's own
 * scroll onto the rail's offset one-to-one; the page never scrolls by
 * itself, never fights a trackpad, and releasing the sequence at either
 * end continues the page normally.
 *
 * The full, linkable record lives in the static list below this
 * component. Nothing here is the only copy of anything - which is what
 * makes it safe to remove the whole sequence under reduced motion.
 */
export function TimelineSequence({
  milestones,
}: {
  milestones: readonly Milestone[];
}) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Under reduced motion the rail stays an ordinary horizontal
    // scroller: no pin, no scrub, no transform to undo.
    if (reduced) return;

    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const rail = railRef.current;
    if (!section || !viewport || !rail) return;

    gsap.registerPlugin(ScrollTrigger);

    // GSAP drives the offset from here on, so the element must stop
    // being a scroll container or the two compete for the same axis.
    viewport.style.overflowX = 'hidden';

    const context = gsap.context(() => {
      const distance = () => Math.max(0, rail.scrollWidth - viewport.clientWidth);

      gsap.to(rail, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          // The pin lasts exactly as long as the rail has left to travel,
          // so the sequence never holds the page still with nothing
          // moving.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress(self.progress);
            const index = Math.round(self.progress * (milestones.length - 1));
            setActive(index);
          },
        },
      });
    }, section);

    return () => {
      context.revert();
      viewport.style.overflowX = '';
    };
  }, [reduced, milestones.length]);

  const current = milestones[active] ?? milestones[0];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="sequence-heading"
      className={cn(
        'relative -mx-[var(--shell-gutter)] border-y border-hairline bg-inset',
        !reduced && 'h-[100svh] overflow-hidden',
      )}
    >
      <div
        aria-hidden
        className="cg-grid cg-grid-fine pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative flex h-full flex-col justify-center py-10">
        {/* --- Instrument header ---------------------------------------- */}
        <div className="flex flex-wrap items-end justify-between gap-4 px-[var(--shell-gutter)]">
          <div className="flex items-center gap-3">
            <CompassRose size={20} className="text-teal" />
            <h2 id="sequence-heading" className="label-caps">
              Sequence / scroll to traverse
            </h2>
          </div>

          {/* The readout is decorative duplication of the rail's own
              content, so it is hidden from assistive technology rather
              than read out a second time on every scroll tick. */}
          <div aria-hidden className="flex items-baseline gap-4">
            <span className="data text-[length:var(--text-4xl)] leading-none text-ink">
              {current?.year}
            </span>
            {current && (
              <Tag tone={ERA_TONE[current.era]} swatch>
                {ERA_LABELS[current.era]}
              </Tag>
            )}
          </div>
        </div>

        {/* --- Progress rule -------------------------------------------- */}
        <div
          aria-hidden
          className="mx-[var(--shell-gutter)] mt-5 h-px bg-hairline"
        >
          <div
            className="h-px bg-teal"
            style={{ width: `${(reduced ? 1 : progress) * 100}%` }}
          />
        </div>

        {/* --- The rail -------------------------------------------------- */}
        <div
          ref={viewportRef}
          className={cn(
            'mt-8 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]',
            reduced && 'snap-x snap-mandatory',
          )}
          {...(reduced
            ? {
                tabIndex: 0,
                role: 'group',
                'aria-label': 'Timeline milestones, scrollable horizontally',
              }
            : {})}
        >
          <ol
            ref={railRef}
            className="flex w-max gap-px bg-hairline px-[var(--shell-gutter)]"
          >
            {milestones.map((milestone, index) => (
              <li
                key={`${milestone.year}-${milestone.title}`}
                className={cn(
                  'w-[min(22rem,80vw)] shrink-0 snap-start bg-deep p-6',
                  'transition-colors duration-[var(--dur-base)] ease-[var(--ease-instrument)]',
                  !reduced && index === active && 'bg-elevated',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="data text-[length:var(--text-2xl)] leading-none text-teal">
                    {milestone.year}
                  </span>
                  <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-4 text-[length:var(--text-base)] leading-snug text-ink">
                  {milestone.title}
                </h3>

                <p className="mt-3 line-clamp-4 text-[length:var(--text-xs)] leading-relaxed text-ink-muted">
                  {milestone.body}
                </p>

                <p className="data mt-4 text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint">
                  {milestone.actor}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-6 px-[var(--shell-gutter)] text-[length:var(--text-2xs)] text-ink-faint">
          The full record, with citations, continues below.
        </p>
      </div>
    </section>
  );
}
