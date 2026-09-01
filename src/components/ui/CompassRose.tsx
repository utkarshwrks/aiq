import { cn } from '@/lib/cn';

type CompassRoseProps = {
  size?: number;
  className?: string;
  /** Slowly rotates the outer bearing ring. Ignored under reduced motion. */
  animated?: boolean;
  'aria-hidden'?: boolean;
};

/**
 * The product's recurring section marker: a survey compass reduced to its
 * bearing ring, cardinal spurs and a north needle. It appears beside every
 * section heading, inside the loading state, and as the header mark.
 *
 * Drawn as inline SVG at a 48-unit viewBox so it stays crisp at any size
 * and inherits currentColor.
 */
export function CompassRose({
  size = 24,
  className,
  animated = false,
  'aria-hidden': ariaHidden = true,
}: CompassRoseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden={ariaHidden}
      className={cn('shrink-0', className)}
    >
      <g
        className={cn(
          animated && 'origin-center motion-safe:animate-[cg-rotate_36s_linear_infinite]',
        )}
      >
        {/* Bearing ring with quadrant breaks. */}
        <circle
          cx="24"
          cy="24"
          r="21"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <circle
          cx="24"
          cy="24"
          r="15.5"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      </g>

      {/* Cardinal spurs. */}
      <path
        d="M24 3v7M24 38v7M3 24h7M38 24h7"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1"
        strokeLinecap="square"
      />

      {/* Intercardinal ticks. */}
      <path
        d="M9.2 9.2l3.6 3.6M35.2 35.2l3.6 3.6M38.8 9.2l-3.6 3.6M12.8 35.2l-3.6 3.6"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1"
        strokeLinecap="square"
      />

      {/* North needle, filled; south needle, outlined. */}
      <path d="M24 8l4.2 16H19.8L24 8z" fill="currentColor" fillOpacity="0.85" />
      <path
        d="M24 40l-4.2-16h8.4L24 40z"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    </svg>
  );
}
