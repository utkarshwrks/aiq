'use client';

import { useState } from 'react';
import { SceneFrame } from './SceneFrame';
import { QuantumCircuitSceneGraph } from './QuantumCircuitSceneGraph';
import { CircuitDiagramStill } from './fallbacks/CircuitDiagramStill';
import { CIRCUITS, GHZ_CIRCUIT, type Circuit } from '@/lib/circuits';
import { cn } from '@/lib/cn';

type QuantumCircuitSceneProps = {
  /** Single circuit, or omit and pass `selectable` to offer the full set. */
  circuit?: Circuit;
  /** Renders a monospaced selector strip above the canvas. */
  selectable?: boolean;
  className?: string;
  /** Shows the circuit summary and prepared state beneath the canvas. */
  showCaption?: boolean;
};

const SELECTABLE = [
  CIRCUITS['bell-2'],
  CIRCUITS['ghz-3'],
  CIRCUITS['grover-2'],
  CIRCUITS['qpe-3'],
] as const;

/**
 * A quantum circuit rendered in three dimensions, with the conventional
 * 2D diagram as its reduced-motion substitute. The caption states what
 * the circuit does and, where it is short enough to write, the state it
 * prepares - so the scene teaches something rather than only moving.
 */
export function QuantumCircuitScene({
  circuit,
  selectable = false,
  className,
  showCaption = true,
}: QuantumCircuitSceneProps) {
  const [selected, setSelected] = useState<Circuit>(circuit ?? GHZ_CIRCUIT);
  const active = circuit ?? selected;

  return (
    <div className={cn('flex size-full flex-col', className)}>
      {selectable && (
        <div
          role="tablist"
          aria-label="Circuit"
          className="flex shrink-0 flex-wrap gap-px border-b border-hairline bg-hairline"
        >
          {SELECTABLE.map((option) => {
            const isActive = option.id === active.id;
            return (
              <button
                key={option.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSelected(option)}
                className={cn(
                  'flex-1 whitespace-nowrap bg-inset px-4 py-2.5',
                  'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.1em]',
                  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-instrument)]',
                  isActive
                    ? 'text-teal'
                    : 'text-ink-faint hover:bg-elevated hover:text-ink-muted',
                )}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <SceneFrame
          subject="quantum circuit"
          description={`Three-dimensional rendering of the ${active.name} circuit. ${active.summary}`}
          fallback={
            <div className="flex size-full items-center justify-center p-8">
              <CircuitDiagramStill circuit={active} />
            </div>
          }
          camera={{ position: [0, 0.9, 4.4], fov: 38 }}
        >
          <QuantumCircuitSceneGraph circuit={active} />
        </SceneFrame>
      </div>

      {showCaption && (
        <div className="shrink-0 border-t border-hairline bg-inset px-5 py-4">
          <p className="label-caps">{active.name}</p>
          <p className="mt-2 max-w-2xl text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
            {active.summary}
          </p>
          {active.prepares && (
            <p className="data mt-3 text-[length:var(--text-xs)] text-teal">
              Prepares {active.prepares}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
