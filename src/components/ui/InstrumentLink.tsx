import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type InstrumentLinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  /** `bracket` renders the framed control used for primary calls to action. */
  variant?: 'inline' | 'bracket';
};

/**
 * The product has no buttons in the SaaS sense. Actions are either an
 * underlined inline link with a directional glyph, or a hairline-bracketed
 * control that fills on hover the way a selected chart cell does.
 */
export function InstrumentLink({
  href,
  children,
  external = false,
  className,
  variant = 'inline',
}: InstrumentLinkProps) {
  const Glyph = external ? ArrowUpRight : ArrowRight;

  const content = (
    <>
      <span>{children}</span>
      <Glyph
        aria-hidden
        className={cn(
          'size-3.5 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
          external
            ? 'group-hover:-translate-y-px group-hover:translate-x-px'
            : 'group-hover:translate-x-1',
        )}
      />
    </>
  );

  const shared = cn(
    'group inline-flex items-center gap-2 font-mono',
    'text-[length:var(--text-xs)] uppercase tracking-[0.12em]',
    'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
  );

  const variants = {
    inline: cn(
      'text-teal hover:text-ink',
      'border-b border-teal/30 pb-0.5 hover:border-teal',
    ),
    bracket: cn(
      'border border-hairline-strong px-4 py-2.5 text-ink',
      'rounded-[var(--radius-sm)]',
      'hover:border-teal hover:bg-teal/5 hover:text-teal',
    ),
  } as const;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(shared, variants[variant], className)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cn(shared, variants[variant], className)}>
      {content}
    </Link>
  );
}
