import { cn } from '@/lib/cn';

type ReadoutProps = {
  label: string;
  value: string | number;
  unit?: string;
  /** Optional second line, e.g. a delta or a source note. */
  note?: string;
  tone?: 'ink' | 'teal' | 'amber' | 'violet';
  className?: string;
  align?: 'left' | 'right';
};

const TONES = {
  ink: 'text-ink',
  teal: 'text-teal',
  amber: 'text-amber',
  violet: 'text-violet',
} as const;

/**
 * A single instrument reading: small caps label above a tabular numeral.
 * Used for ingestion counters, hardware qubit counts, funding figures and
 * anything else the reader would compare across rows.
 */
export function Readout({
  label,
  value,
  unit,
  note,
  tone = 'ink',
  className,
  align = 'left',
}: ReadoutProps) {
  return (
    <div className={cn('flex flex-col gap-1', align === 'right' && 'items-end text-right', className)}>
      <span className="label-caps">{label}</span>
      <span className={cn('data text-[length:var(--text-xl)] leading-none', TONES[tone])}>
        {value}
        {unit && (
          <span className="ml-1 text-[length:var(--text-xs)] text-ink-faint">{unit}</span>
        )}
      </span>
      {note && <span className="text-[length:var(--text-xs)] text-ink-faint">{note}</span>}
    </div>
  );
}
