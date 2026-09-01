import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { CompassRose } from '@/components/ui/CompassRose';
import { InstrumentLink } from '@/components/ui/InstrumentLink';

export const metadata: Metadata = {
  title: 'Sector not charted',
};

/**
 * The 404. Framed as a survey result rather than an apology: the request
 * resolved, the coordinate is simply not on this chart.
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="cg-grid cg-grid-masked relative flex min-h-dvh items-center pt-14"
    >
      <Container>
        <div className="max-w-xl">
          <CompassRose size={44} className="text-amber" />
          <p className="data mt-8 text-[length:var(--text-2xs)] tracking-[0.14em] text-ink-faint">
            STATUS 404
          </p>
          <h1 className="mt-4 text-[length:var(--text-3xl)] text-ink">
            Sector not charted
          </h1>
          <p className="mt-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            The request resolved, but no plate exists at this coordinate.
            Return to the command deck or open the index to pick a bearing.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <InstrumentLink href="/" variant="bracket">
              Command deck
            </InstrumentLink>
            <InstrumentLink href="/glossary">Search the glossary</InstrumentLink>
          </div>
        </div>
      </Container>
    </main>
  );
}
