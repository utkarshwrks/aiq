import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Reference = {
  n: number;
  /** Publisher or institution. */
  source: string;
  /** Title of the specific document. */
  title: string;
  href: string;
  /** Year of publication, where the source states one. */
  year?: string;
};

type ReferenceListProps = {
  references: readonly Reference[];
  className?: string;
};

/**
 * The reference list that closes every content page. Numbers match the
 * inline Citation markers in the body copy above it.
 */
export function ReferenceList({ references, className }: ReferenceListProps) {
  if (references.length === 0) return null;

  return (
    <section
      aria-labelledby="references-heading"
      className={cn('border-t border-hairline pt-8', className)}
    >
      <h2
        id="references-heading"
        className="label-caps mb-6 !text-ink-muted"
      >
        Sources
      </h2>
      <ol className="grid gap-3 md:grid-cols-2">
        {references.map((ref) => (
          <li key={ref.n} className="flex gap-3 text-[length:var(--text-sm)]">
            <span className="data shrink-0 pt-0.5 text-[length:var(--text-2xs)] text-teal">
              [{ref.n}]
            </span>
            <a
              href={ref.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group text-ink-muted transition-colors duration-[var(--dur-fast)] hover:text-ink"
            >
              <span className="text-ink-faint">{ref.source}</span>
              <span aria-hidden className="mx-1.5 text-ink-faint">
                /
              </span>
              <span className="underline decoration-hairline underline-offset-4 group-hover:decoration-teal">
                {ref.title}
              </span>
              {ref.year && <span className="data ml-1.5 text-ink-faint">{ref.year}</span>}
              <ArrowUpRight aria-hidden className="ml-1 inline size-3 align-baseline" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
