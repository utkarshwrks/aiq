import { Container } from '@/components/ui/Container';
import { ContourField } from '@/components/ui/ContourField';
import { CompassRose } from '@/components/ui/CompassRose';
import { cn } from '@/lib/cn';

type PageShellProps = {
  /** Two-digit plate number matching the route manifest coordinate. */
  plate: string;
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
  /** Right-hand slot in the masthead for readouts or controls. */
  aside?: React.ReactNode;
  width?: 'default' | 'wide' | 'prose';
  className?: string;
};

/**
 * The masthead every content route opens with. Consistent geometry across
 * routes is what makes the site legible as one instrument rather than as
 * eight separately designed pages.
 */
export function PageShell({
  plate,
  eyebrow,
  title,
  lede,
  children,
  aside,
  width = 'default',
  className,
}: PageShellProps) {
  return (
    <main id="main" className={cn('relative pt-14', className)}>
      <div className="relative overflow-hidden border-b border-hairline">
        <ContourField rate={0.05} />
        <div
          aria-hidden
          className="cg-grid cg-grid-masked pointer-events-none absolute inset-0 opacity-40"
        />

        <Container width="wide" className="relative py-16 md:py-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <CompassRose size={18} className="text-teal" />
                <span className="data text-[length:var(--text-2xs)] tracking-[0.14em] text-ink-faint">
                  PLATE {plate}
                </span>
                <span aria-hidden className="h-px w-8 bg-hairline-strong" />
                <span className="label-caps">{eyebrow}</span>
              </div>

              <h1 className="text-[length:var(--text-4xl)] text-ink">{title}</h1>

              <p className="mt-6 max-w-2xl text-[length:var(--text-lg)] leading-relaxed text-ink-muted">
                {lede}
              </p>
            </div>

            {aside && <div className="shrink-0">{aside}</div>}
          </div>
        </Container>
      </div>

      <Container width={width} className="py-16 md:py-20">
        {children}
      </Container>
    </main>
  );
}
