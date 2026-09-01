import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { UpdatePanel } from '@/components/panels/UpdatePanel';
import { Readout } from '@/components/ui/Readout';
import { getUpdateFeed } from '@/lib/updates/repository';
import { ALL_SOURCES, FEED_SOURCE_COUNT, SOURCE_COUNT } from '@/lib/sources';
import { InstrumentLink } from '@/components/ui/InstrumentLink';

export const metadata: Metadata = {
  title: 'Updates',
  description:
    'Quantum computing research, hardware, policy and industry signal, ingested from official feeds and public APIs every three hours and split into a global and an Indian lens.',
};

/**
 * Revalidated every ten minutes. The worker writes at most every three
 * hours, so a shorter window would only spend rebuilds to produce the
 * same page; the client panel refreshes in place in between.
 */
export const revalidate = 600;

export default async function UpdatesPage() {
  const feed = await getUpdateFeed(60);

  return (
    <PageShell
      plate="05"
      eyebrow="Ingested signal"
      title="Updates"
      lede="Every item below was read from a publisher's own feed or public API, summarised to a single line, classified, and linked back to its source. Nothing here is republished."
      width="wide"
      aside={
        <div className="flex gap-8">
          <Readout label="Sources" value={SOURCE_COUNT} align="right" />
          <Readout
            label="Read via feed"
            value={FEED_SOURCE_COUNT}
            tone="teal"
            align="right"
          />
          <Readout
            label="Items held"
            value={feed.stats.totalItems}
            align="right"
          />
        </div>
      }
    >
      <UpdatePanel initial={feed} variant="full" />

      <section className="mt-20" aria-labelledby="sources-heading">
        <div className="flex flex-col gap-4 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="sources-heading"
              className="text-[length:var(--text-2xl)] text-ink"
            >
              What is being read
            </h2>
            <p className="mt-3 max-w-2xl text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
              The full list, generated from the registry the ingestion worker
              actually uses. Official feeds and public APIs are preferred;
              page markup is read only where a publisher offers no feed.
            </p>
          </div>
          <InstrumentLink href="/about#sourcing">
            How we source our data
          </InstrumentLink>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <caption className="sr-only">
              Ingestion sources, their region, how each is read, and what each
              covers
            </caption>
            <thead>
              <tr className="border-b border-hairline">
                <th scope="col" className="label-caps py-3 pr-4 font-normal">
                  Source
                </th>
                <th scope="col" className="label-caps py-3 pr-4 font-normal">
                  Lens
                </th>
                <th scope="col" className="label-caps py-3 pr-4 font-normal">
                  Read as
                </th>
                <th scope="col" className="label-caps py-3 font-normal">
                  Covers
                </th>
              </tr>
            </thead>
            <tbody>
              {ALL_SOURCES.map((source) => (
                <tr
                  key={source.slug}
                  className="border-b border-hairline align-top transition-colors duration-[var(--dur-fast)] hover:bg-surface"
                >
                  <td className="py-3 pr-4">
                    <a
                      href={source.homepage}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-[length:var(--text-sm)] text-ink underline decoration-hairline underline-offset-4 hover:decoration-teal"
                    >
                      {source.name}
                    </a>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="data text-[length:var(--text-2xs)] text-ink-muted">
                      {source.region === 'INDIA' ? 'India' : 'Global'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                      {source.kind === 'NEWS_SEARCH'
                        ? 'News search'
                        : source.kind === 'JSON_API'
                          ? 'Public API'
                          : source.kind === 'HTML'
                            ? 'Page markup'
                            : source.kind}
                    </span>
                  </td>
                  <td className="py-3 text-[length:var(--text-sm)] text-ink-muted">
                    {source.covers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
