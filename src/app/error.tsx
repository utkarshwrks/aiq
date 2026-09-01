'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { CompassRose } from '@/components/ui/CompassRose';

/**
 * Route-level error boundary. Reports the fault in the product's own
 * register and offers a re-acquire, which is what Next's reset() does.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[aiquantumos] route error', error);
  }, [error]);

  return (
    <main
      id="main"
      className="cg-grid cg-grid-masked relative flex min-h-dvh items-center pt-14"
    >
      <Container>
        <div className="max-w-xl">
          <CompassRose size={44} className="text-fault" />
          <p className="data mt-8 text-[length:var(--text-2xs)] tracking-[0.14em] text-ink-faint">
            INSTRUMENT FAULT
            {error.digest && <span className="ml-3 text-ink-faint">{error.digest}</span>}
          </p>
          <h1 className="mt-4 text-[length:var(--text-3xl)] text-ink">
            This plate failed to render
          </h1>
          <p className="mt-5 text-[length:var(--text-base)] leading-relaxed text-ink-muted">
            The route threw while assembling. Re-acquiring will retry the
            render without reloading the rest of the console.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-9 border border-hairline-strong px-4 py-2.5 font-mono text-[length:var(--text-xs)] uppercase tracking-[0.12em] text-ink transition-colors duration-[var(--dur-fast)] hover:border-teal hover:bg-teal/5 hover:text-teal"
          >
            Re-acquire
          </button>
        </div>
      </Container>
    </main>
  );
}
