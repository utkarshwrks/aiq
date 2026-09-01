import { cn } from '@/lib/cn';

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Registration brackets at opposing corners, as on a survey plate. */
  bracketed?: boolean;
  /** Fine sub-cell grid behind the panel contents. */
  gridded?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
  /** Anchor target, so a panel can be linked to directly. */
  id?: string;
};

/**
 * The base surface for cards, feed items and profile tiles. Structure is
 * a single hairline border on an elevated surface - no drop shadow, no
 * gradient fill, no rounded corners beyond 3px.
 */
export function Panel({
  children,
  className,
  bracketed = false,
  gridded = false,
  as: Tag = 'div',
  id,
}: PanelProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'relative border border-hairline bg-surface',
        'rounded-[var(--radius-md)]',
        bracketed && 'cg-bracket',
        gridded && 'cg-grid cg-grid-fine',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
