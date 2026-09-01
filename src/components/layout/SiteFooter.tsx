import Link from 'next/link';
import { NAV_ITEMS, SITE } from '@/lib/site';
import { Container } from '@/components/ui/Container';
import { CompassRose } from '@/components/ui/CompassRose';
import { InstrumentLink } from '@/components/ui/InstrumentLink';

/**
 * The chart's colophon. Sitemap on the left, sourcing statement and
 * builder attribution on the right, closed by a coordinate rule. The tone
 * is factual: this records who maintains the material and how it is
 * sourced, and makes no claims beyond that.
 */
export function SiteFooter() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="relative mt-24 border-t border-hairline bg-inset">
      <div className="cg-ticks-major w-full opacity-40" aria-hidden />

      <Container width="wide" className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <CompassRose size={32} className="text-teal" />
              <span className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] text-ink">
                AIQuantum<span className="text-ink-faint">OS</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
              {SITE.description}
            </p>
            <div className="mt-6">
              <InstrumentLink href="/about#sourcing">
                How we source our data
              </InstrumentLink>
            </div>
          </div>

          <nav aria-label="Sitemap">
            <h2 className="label-caps mb-5">Index</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-baseline gap-2.5 text-[length:var(--text-sm)] text-ink-muted transition-colors duration-[var(--dur-fast)] hover:text-teal"
                  >
                    <span className="data text-[length:var(--text-2xs)] text-ink-faint">
                      {item.coordinate}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="label-caps mb-5">Maintained by</h2>
            <p className="font-[family-name:var(--font-display)] text-[length:var(--text-base)] text-ink">
              {SITE.builder.name}
            </p>
            <dl className="mt-4 space-y-2 text-[length:var(--text-sm)] text-ink-muted">
              <div className="flex gap-2">
                <dt className="sr-only">Recognition</dt>
                <dd>{SITE.builder.recognition}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="sr-only">Incubation</dt>
                <dd>{SITE.builder.incubation}</dd>
              </div>
            </dl>

            <div className="mt-8 space-y-2">
              <p className="text-[length:var(--text-xs)] leading-relaxed text-ink-faint">
                Update Panel entries link to their original publishers.
                AIQuantumOS summarises and indexes; it does not republish
                source material.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-hairline">
        <Container width="wide">
          <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="data text-[length:var(--text-2xs)] text-ink-faint">
              {year} {SITE.builder.short}. All rights reserved.
            </p>
            <p className="data text-[length:var(--text-2xs)] uppercase tracking-[0.14em] text-ink-faint">
              22.7196 N / 75.8577 E
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
