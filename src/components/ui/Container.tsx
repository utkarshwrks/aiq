import { cn } from '@/lib/cn';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** `wide` relaxes the measure for map and grid layouts. */
  width?: 'default' | 'wide' | 'prose';
  as?: 'div' | 'section' | 'header' | 'footer' | 'article' | 'nav';
};

const WIDTHS: Record<NonNullable<ContainerProps['width']>, string> = {
  default: 'max-w-[88rem]',
  wide: 'max-w-[104rem]',
  prose: 'max-w-[46rem]',
};

/**
 * The single horizontal measure in the product. Gutters scale with the
 * viewport through the --shell-gutter token rather than through a stack
 * of breakpoint-specific padding utilities.
 */
export function Container({
  children,
  className,
  width = 'default',
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-[var(--shell-gutter)]',
        WIDTHS[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
