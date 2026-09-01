import { SINGLE_QUBIT_GATES, type Circuit, type Gate } from '@/lib/circuits';

/**
 * A conventional 2D circuit diagram generated from the same specification
 * the 3D scene renders. Used as the reduced-motion substitute, and useful
 * in its own right: this is the notation a reader will meet everywhere
 * else in the literature.
 */

const PAD_X = 46;
const PAD_Y = 34;
const STEP_W = 66;
const WIRE_H = 54;

function gx(step: number) {
  return PAD_X + step * STEP_W;
}
function gy(wire: number) {
  return PAD_Y + wire * WIRE_H;
}

export function CircuitDiagramStill({ circuit }: { circuit: Circuit }) {
  const width = PAD_X * 2 + (circuit.steps - 1) * STEP_W;
  const height = PAD_Y * 2 + (circuit.qubits - 1) * WIRE_H;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="size-full"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Wires. */}
      {Array.from({ length: circuit.qubits }, (_, i) => (
        <g key={`wire-${i}`}>
          <line
            x1={PAD_X - 26}
            y1={gy(i)}
            x2={width - PAD_X + 26}
            y2={gy(i)}
            stroke="var(--cg-line-grid)"
            strokeWidth="1.2"
          />
          <text
            x={PAD_X - 34}
            y={gy(i) + 4}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fill="var(--cg-ink-faint)"
          >
            q{i}
          </text>
        </g>
      ))}

      {circuit.gates.map((gate, i) => (
        <GateGlyph key={`${gate.kind}-${gate.step}-${gate.target}-${i}`} gate={gate} />
      ))}
    </svg>
  );
}

function GateGlyph({ gate }: { gate: Gate }) {
  const x = gx(gate.step);
  const y = gy(gate.target);

  if (gate.control !== undefined) {
    const cy = gy(gate.control);
    return (
      <g>
        <line
          x1={x}
          y1={cy}
          x2={x}
          y2={y}
          stroke="var(--cg-accent-violet)"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <circle cx={x} cy={cy} r="4.5" fill="var(--cg-accent-violet)" />
        {gate.kind === 'CNOT' ? (
          <g stroke="var(--cg-accent-violet)" strokeWidth="1.4" fill="none">
            <circle cx={x} cy={y} r="10" />
            <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
            <line x1={x} y1={y - 10} x2={x} y2={y + 10} />
          </g>
        ) : (
          <circle cx={x} cy={y} r="4.5" fill="var(--cg-accent-violet)" />
        )}
      </g>
    );
  }

  if (gate.kind === 'SWAP' && gate.partner !== undefined) {
    const py = gy(gate.partner);
    return (
      <g stroke="var(--cg-accent-violet)" strokeWidth="1.4">
        <line x1={x} y1={y} x2={x} y2={py} opacity="0.8" />
        {[y, py].map((cy) => (
          <g key={cy}>
            <line x1={x - 6} y1={cy - 6} x2={x + 6} y2={cy + 6} />
            <line x1={x - 6} y1={cy + 6} x2={x + 6} y2={cy - 6} />
          </g>
        ))}
      </g>
    );
  }

  const isMeasure = gate.kind === 'MEASURE';
  const isSingle = SINGLE_QUBIT_GATES.has(gate.kind);
  const stroke = isMeasure
    ? 'var(--cg-accent-amber)'
    : isSingle
      ? 'var(--cg-accent-teal)'
      : 'var(--cg-line-hairline-strong)';

  return (
    <g>
      <rect
        x={x - 13}
        y={y - 13}
        width="26"
        height="26"
        rx="2"
        fill="var(--cg-bg-elevated)"
        stroke={stroke}
        strokeWidth="1.2"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize="11"
        fontFamily="var(--font-mono)"
        fill={isMeasure ? 'var(--cg-accent-amber)' : 'var(--cg-ink)'}
      >
        {isMeasure ? 'M' : gate.kind}
      </text>
    </g>
  );
}
