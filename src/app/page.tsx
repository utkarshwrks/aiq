import { HeroDeck } from '@/components/marketing/HeroDeck';
import { FoundationsStrip } from '@/components/marketing/FoundationsStrip';
import { EcosystemMap } from '@/components/marketing/EcosystemMap';
import { TimelineTeaser } from '@/components/marketing/TimelineTeaser';
import { UpdatePanel } from '@/components/panels/UpdatePanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { InstrumentLink } from '@/components/ui/InstrumentLink';
import { getUpdateFeed } from '@/lib/updates/repository';

/**
 * The command deck.
 *
 * Section order follows how a reader actually needs the material:
 * instrument first, then the ideas, then what is happening right now,
 * then where it is happening, then how it got here. The update panel
 * sits third rather than last because it is the part that changes, and
 * burying the part that changes at the bottom of a long page is how a
 * living reference turns back into a brochure.
 */

export const revalidate = 600;

export default async function CommandDeck() {
  const feed = await getUpdateFeed(24);

  return (
    <main id="main">
      <HeroDeck initialStats={feed.stats} />

      <FoundationsStrip />

      <section
        aria-labelledby="signal-heading"
        className="relative border-b border-hairline py-20 md:py-28"
      >
        <div className="mx-auto w-full max-w-[104rem] px-[var(--shell-gutter)]">
          <SectionHeader
            index="02"
            eyebrow="Live signal"
            title="What the field published this week"
            description="Read from publishers' own feeds and public APIs every three hours, summarised to one line, and linked back to the source. The Indian ecosystem gets its own column, not a filter."
            action={<InstrumentLink href="/updates">Full index</InstrumentLink>}
          />

          <div className="mt-10">
            <UpdatePanel initial={feed} variant="widget" limit={6} />
          </div>
        </div>
      </section>

      <EcosystemMap />

      <TimelineTeaser />
    </main>
  );
}
