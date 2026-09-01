'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { Tag } from '@/components/ui/Tag';
import { ERA_LABELS, FEATURED_MILESTONES } from '@/content/timeline';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * The timeline teaser.
 *
 * A horizontal rail of the load-bearing milestones. It scrolls the way a
 * chart pans - the whole rail advances as the section moves through the
 * viewport - but it is also an ordinary horizontally scrollable region,
 * so a reader who wants to drag it can, a keyboard can tab through it,
 * and reduced motion simply leaves it still.
 *
 * Deliberately not scroll-jacked. Taking over the page's scroll to
 * animate a strip is the single most reliable way to make a site
 * unusable on a trackpad.
 */
export function TimelineTeaser() {
  const rail = useRef<HTMLDivElement | null>(null);
  const section = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const railEl = rail.current;
    const sectionEl = section.current;
    if (!railEl || !sectionEl) return;

    // Pointer-driven scrolling must win: once the reader touches the
    // rail, the scroll linkage stops for good.
    let manual = false;
    const release = () => {
      manual = true;
    };
    railEl.addEventListener('pointerdown', release, { once: true });
    railEl.addEventListener('wheel', release, { once: true, passive: true });

    let frame = 0;
    const update = () => {
      frame = 0;
      if (manual) return;

      const rect = sectionEl.getBoundingClientRect();
      const travel = rect.height + window.innerHeight;
      // 0 as the section enters from below, 1 as it leaves at the top.
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / travel),
      );

      const overflow = railEl.scrollWidth - railEl.clientWidth;
      if (overflow > 0) railEl.scrollLeft = overflow * progress;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      railEl.removeEventListener('pointerdown', release);
      railEl.removeEventListener('wheel', release);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <section
      ref={section}
      aria-labelledby="timeline-heading"
      className="relative border-b border-hairline py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[104rem] px-[var(--shell-gutter)]">
        <SectionHeader
          index="04"
          eyebrow="Timeline"
          title="Six events the field turns on"
          description="Selected because the subject would have gone differently without them. Product launches and qubit-count records appear only where they changed what people believed was achievable."
          action={<InstrumentLink href="/timeline">Full timeline</InstrumentLink>}
        />
      </div>

      <div
        ref={rail}
        tabIndex={0}
        aria-label="Timeline milestones, scrollable horizontally"
        className="mt-10 flex snap-x snap-mandatory gap-px overflow-x-auto overscroll-x-contain bg-hairline px-[var(--shell-gutter)] [scrollbar-width:thin]"
      >
        {FEATURED_MILESTONES.map((milestone) => (
          <article
            key={`${milestone.year}-${milestone.title}`}
            className="flex w-[19rem] shrink-0 snap-start flex-col gap-4 bg-surface p-6 sm:w-[22rem]"
          >
            <div className="flex items-baseline justify-between">
              <span className="data text-[length:var(--text-2xl)] leading-none text-teal">
                {milestone.year}
              </span>
              <Tag swatch>{ERA_LABELS[milestone.era]}</Tag>
            </div>

            <div aria-hidden className="cg-ticks w-full opacity-50" />

            <h3 className="text-[length:var(--text-lg)] leading-snug text-ink">
              {milestone.title}
            </h3>

            <p className="text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
              {milestone.body}
            </p>

            <p className="data mt-auto pt-2 text-[length:var(--text-2xs)] text-ink-faint">
              {milestone.actor.toUpperCase()}
            </p>
          </article>
        ))}

        <Link
          href="/timeline"
          className="group flex w-[14rem] shrink-0 snap-start flex-col justify-center gap-3 bg-inset p-6 transition-colors duration-[var(--dur-fast)] hover:bg-elevated"
        >
          <span className="label-caps">Continue</span>
          <span className="text-[length:var(--text-lg)] text-ink group-hover:text-teal">
            The full sequence, 1980 to now
          </span>
        </Link>
      </div>
    </section>
  );
}
