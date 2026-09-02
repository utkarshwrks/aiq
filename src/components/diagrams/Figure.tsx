import { CompassRose } from '@/components/ui/CompassRose';
import { cn } from '@/lib/cn';

type FigureProps = {
  /** Plate-style label, shown in the figure's header rule. */
  label: string;
  /**
   * What the diagram says, in one or two sentences.
   *
   * This is not decoration. Every figure in this product replaces prose
   * that used to carry the same point, so the caption has to stand on
   * its own for a reader who cannot see the drawing - it is the diagram's
   * text alternative as much as its caption.
   */
  caption: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * The frame every diagram sits in.
 *
 * Same construction as the rest of the product: a hairline border on an
 * inset ground, a labelled header rule, no shadow and no radius. A
 * diagram that arrived in its own visual language would read as an
 * imported asset rather than as part of the instrument.
 */
export function Figure({ label, caption, children, className }: FigureProps) {
  return (
    <figure className={cn('border border-hairline bg-inset', className)}>
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="label-caps">{label}</span>
        <CompassRose size={13} className="text-ink-faint" />
      </div>

      {/* The drawings are laid out on a 320-unit grid with 8.5-unit
          labels. Letting the SVG fill a wide column scales those labels
          to headline size and the figure stops reading as an inset
          instrument. Capping the width keeps it near its drawn scale. */}
      <div className="px-4 py-6">
        <div className="mx-auto w-full max-w-[36rem]">{children}</div>
      </div>

      <figcaption className="border-t border-hairline px-4 py-3 text-[length:var(--text-2xs)] leading-relaxed text-ink-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * Shared drawing constants, so ten diagrams cannot drift into ten
 * slightly different line weights and label sizes.
 */
export const D = {
  ink: 'var(--cg-ink)',
  muted: 'var(--cg-ink-muted)',
  faint: 'var(--cg-ink-faint)',
  line: 'var(--cg-line-grid)',
  hair: 'var(--cg-line-hairline)',
  teal: 'var(--cg-accent-teal)',
  tealDim: 'var(--cg-accent-teal-dim)',
  amber: 'var(--cg-accent-amber)',
  violet: 'var(--cg-accent-violet)',
  mono: 'var(--font-mono)',
  /** Every stroke in every diagram. Hairlines, as everywhere else. */
  w: 1,
  label: 8.5,
} as const;

/** A monospaced diagram label. */
export function L({
  x,
  y,
  children,
  fill = D.faint,
  anchor = 'middle',
  size = D.label,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontFamily={D.mono}
      fontSize={size}
      textAnchor={anchor}
      letterSpacing="0.06em"
    >
      {children}
    </text>
  );
}
