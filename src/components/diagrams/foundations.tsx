import { D, L } from './Figure';

/**
 * The foundations diagrams.
 *
 * Each one exists because it carries a point more economically than the
 * paragraph it replaced. None of them is ornamental: if a figure here
 * could be deleted without losing an idea, it should be.
 *
 * All are inline SVG on a shared 320-unit grid, drawn in theme tokens so
 * they inherit the palette rather than restating it, and marked
 * `role="img"` with a label, because a drawing is opaque to a screen
 * reader and the caption alone sits outside the graphic.
 */

/** Shared canvas. Height is trimmed to the tallest drawing so no figure
 *  carries a band of dead space under it. */
const VB = '0 0 320 136';

/** 01 - a bit picks a position, a qubit picks a direction. */
export function BitVsQubit() {
  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="A classical bit shown as a two-position switch, beside a qubit shown as a vector pointing anywhere on a circle.">
      {/* Classical bit: two discrete seats. */}
      <L x={72} y={16} fill={D.muted}>CLASSICAL BIT</L>
      <rect x={30} y={34} width={38} height={38} fill="none" stroke={D.line} strokeWidth={D.w} />
      <rect x={76} y={34} width={38} height={38} fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={49} y={58} fill={D.faint} size={11}>0</L>
      <L x={95} y={58} fill={D.faint} size={11}>1</L>
      {/* The switch is seated in one of them. */}
      <rect x={76} y={34} width={38} height={38} fill={D.amber} fillOpacity={0.12} stroke={D.amber} strokeWidth={D.w} />
      <L x={95} y={58} fill={D.amber} size={11}>1</L>
      <L x={72} y={92} fill={D.faint}>TWO SEATS</L>
      <L x={72} y={106} fill={D.faint}>ONE OCCUPIED</L>

      <line x1={160} y1={24} x2={160} y2={126} stroke={D.hair} strokeWidth={D.w} />

      {/* Qubit: a direction on a circle. */}
      <L x={248} y={16} fill={D.muted}>QUBIT</L>
      <circle cx={248} cy={62} r={32} fill="none" stroke={D.line} strokeWidth={D.w} />
      <line x1={216} y1={62} x2={280} y2={62} stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      <line x1={248} y1={30} x2={248} y2={94} stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      {/* The state vector, at an angle that is neither pole. */}
      <line x1={248} y1={62} x2={272} y2={41} stroke={D.teal} strokeWidth={1.4} />
      <circle cx={272} cy={41} r={3} fill={D.teal} />
      <path d="M248 44 A18 18 0 0 1 261 49" fill="none" stroke={D.violet} strokeWidth={D.w} />
      <L x={248} y={26} fill={D.faint}>|0&gt;</L>
      <L x={248} y={106} fill={D.faint}>|1&gt;</L>
      <L x={248} y={124} fill={D.faint}>A CONTINUUM OF DIRECTIONS</L>
    </svg>
  );
}

/** 02 - amplitudes carry a sign; probabilities are what survive squaring. */
export function AmplitudeVsProbability() {
  const bar = (x: number, h: number, fill: string, up: boolean) =>
    up
      ? <rect x={x} y={70 - h} width={20} height={h} fill={fill} fillOpacity={0.75} />
      : <rect x={x} y={70} width={20} height={h} fill={fill} fillOpacity={0.75} />;

  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="Two amplitude bars, one positive and one negative, both becoming positive probability bars of equal height after squaring.">
      <L x={64} y={16} fill={D.muted}>AMPLITUDES</L>
      <line x1={24} y1={70} x2={112} y2={70} stroke={D.hair} strokeWidth={D.w} />
      {bar(38, 30, D.teal, true)}
      {bar(74, 30, D.violet, false)}
      <L x={48} y={92} fill={D.faint}>+a</L>
      <L x={84} y={92} fill={D.faint}>-a</L>
      <L x={64} y={112} fill={D.faint}>SIGNED / COMPLEX</L>
      <L x={64} y={126} fill={D.faint}>THEY CAN CANCEL</L>

      {/* The operation between the two panels. */}
      <path d="M132 62 L172 62" stroke={D.line} strokeWidth={D.w} />
      <path d="M166 58 L172 62 L166 66" fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={152} y={54} fill={D.amber}>|a|²</L>

      <L x={248} y={16} fill={D.muted}>PROBABILITIES</L>
      <line x1={200} y1={70} x2={296} y2={70} stroke={D.hair} strokeWidth={D.w} />
      {bar(216, 30, D.amber, true)}
      {bar(258, 30, D.amber, true)}
      <L x={226} y={92} fill={D.faint}>0.5</L>
      <L x={268} y={92} fill={D.faint}>0.5</L>
      <L x={248} y={112} fill={D.faint}>REAL / NON-NEGATIVE</L>
      <L x={248} y={126} fill={D.faint}>THEY ONLY ACCUMULATE</L>
    </svg>
  );
}

/** 03 - the correlation is the whole content of entanglement. */
export function EntanglementOutcomes() {
  const cell = (x: number, y: number, on: boolean, label: string) => (
    <g key={label}>
      <rect x={x} y={y} width={44} height={30}
        fill={on ? D.teal : 'none'} fillOpacity={on ? 0.14 : 0}
        stroke={on ? D.teal : D.line} strokeWidth={D.w} />
      <L x={x + 22} y={y + 19} fill={on ? D.teal : D.faint} size={9.5}>{label}</L>
      {!on && <line x1={x + 8} y1={y + 22} x2={x + 36} y2={y + 8} stroke={D.line} strokeWidth={D.w} />}
    </g>
  );

  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="A two-by-two grid of joint measurement outcomes. Both-zero and both-one are possible; the two disagreeing outcomes are struck out as never observed.">
      <circle cx={44} cy={52} r={13} fill="none" stroke={D.violet} strokeWidth={D.w} />
      <circle cx={44} cy={96} r={13} fill="none" stroke={D.violet} strokeWidth={D.w} />
      <L x={44} y={56} fill={D.violet}>A</L>
      <L x={44} y={100} fill={D.violet}>B</L>
      <path d="M57 60 Q76 74 57 88" fill="none" stroke={D.violet} strokeWidth={D.w} strokeDasharray="2 3" />
      <L x={44} y={126} fill={D.faint}>ONE PAIR</L>

      <L x={196} y={16} fill={D.muted}>JOINT OUTCOMES</L>
      {cell(110, 30, true, '00')}
      {cell(166, 30, false, '01')}
      {cell(110, 74, false, '10')}
      {cell(166, 74, true, '11')}

      <L x={268} y={48} fill={D.faint} anchor="start">EACH 50%</L>
      <L x={268} y={62} fill={D.faint} anchor="start">ON ITS OWN</L>
      <L x={268} y={92} fill={D.faint} anchor="start">NEVER</L>
      <L x={268} y={106} fill={D.faint} anchor="start">OBSERVED</L>
    </svg>
  );
}

/** 04 - the mechanism every algorithm actually runs on. */
export function InterferencePaths() {
  const wave = (y: number, phase: number, amp: number, colour: string, dash?: string) => {
    let d = `M24 ${y}`;
    for (let x = 0; x <= 120; x += 2) {
      const v = y - amp * Math.sin((x / 120) * Math.PI * 2 + phase);
      d += ` L${24 + x} ${v.toFixed(2)}`;
    }
    return <path d={d} fill="none" stroke={colour} strokeWidth={1.3} {...(dash ? { strokeDasharray: dash } : {})} />;
  };

  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="Two waves in phase adding to a larger wave, and two waves in opposite phase cancelling to a flat line.">
      <L x={84} y={16} fill={D.muted}>IN PHASE</L>
      {wave(46, 0, 12, D.teal)}
      {wave(46, 0, 12, D.violet, '2 3')}
      <path d="M156 46 L176 46" stroke={D.line} strokeWidth={D.w} />
      <path d="M170 42 L176 46 L170 50" fill="none" stroke={D.line} strokeWidth={D.w} />
      {(() => {
        let d = 'M188 46';
        for (let x = 0; x <= 100; x += 2) {
          d += ` L${188 + x} ${(46 - 22 * Math.sin((x / 100) * Math.PI * 2)).toFixed(2)}`;
        }
        return <path d={d} fill="none" stroke={D.teal} strokeWidth={1.6} />;
      })()}
      <L x={238} y={16} fill={D.teal}>REINFORCES</L>

      <L x={84} y={92} fill={D.muted}>OPPOSITE PHASE</L>
      {wave(118, 0, 12, D.teal)}
      {wave(118, Math.PI, 12, D.violet, '2 3')}
      <path d="M156 118 L176 118" stroke={D.line} strokeWidth={D.w} />
      <path d="M170 114 L176 118 L170 122" fill="none" stroke={D.line} strokeWidth={D.w} />
      <line x1={188} y1={118} x2={288} y2={118} stroke={D.amber} strokeWidth={1.6} />
      <L x={238} y={92} fill={D.amber}>CANCELS</L>
    </svg>
  );
}

/** 05 - the notation the rest of the field is written in. */
export function CircuitNotation() {
  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="A two-qubit circuit: a Hadamard gate on the top wire, a controlled-NOT joining both wires, then a measurement on each.">
      <L x={26} y={52} fill={D.faint} anchor="end">|0&gt;</L>
      <L x={26} y={100} fill={D.faint} anchor="end">|0&gt;</L>
      <line x1={34} y1={48} x2={286} y2={48} stroke={D.line} strokeWidth={D.w} />
      <line x1={34} y1={96} x2={286} y2={96} stroke={D.line} strokeWidth={D.w} />

      {/* Hadamard: puts the top wire into an equal superposition. */}
      <rect x={64} y={34} width={28} height={28} fill="var(--cg-bg-elevated)" stroke={D.teal} strokeWidth={D.w} />
      <L x={78} y={52} fill={D.teal} size={11}>H</L>

      {/* CNOT: the control dot, the join, the target ring. */}
      <circle cx={146} cy={48} r={4} fill={D.teal} />
      <line x1={146} y1={48} x2={146} y2={96} stroke={D.teal} strokeWidth={D.w} />
      <circle cx={146} cy={96} r={9} fill="none" stroke={D.teal} strokeWidth={D.w} />
      <line x1={137} y1={96} x2={155} y2={96} stroke={D.teal} strokeWidth={D.w} />
      <line x1={146} y1={87} x2={146} y2={105} stroke={D.teal} strokeWidth={D.w} />

      {/* Measurement: the readout, where the direction is spent. */}
      {[48, 96].map((y) => (
        <g key={y}>
          <rect x={216} y={y - 14} width={30} height={28} fill="var(--cg-bg-elevated)" stroke={D.amber} strokeWidth={D.w} />
          <path d={`M223 ${y + 6} A8 8 0 0 1 239 ${y + 6}`} fill="none" stroke={D.amber} strokeWidth={D.w} />
          <line x1={231} y1={y + 6} x2={238} y2={y - 3} stroke={D.amber} strokeWidth={D.w} />
        </g>
      ))}

      <L x={78} y={22} fill={D.faint}>SUPERPOSE</L>
      <L x={146} y={22} fill={D.faint}>ENTANGLE</L>
      <L x={231} y={22} fill={D.faint}>MEASURE</L>
      <L x={160} y={132} fill={D.faint}>TIME RUNS LEFT TO RIGHT ALONG EACH WIRE</L>
    </svg>
  );
}

/** 06 - what noise does to the vector, drawn rather than asserted. */
export function DecoherenceDecay() {
  const sphere = (cx: number, length: number, label: string, sub: string) => (
    <g key={label}>
      <circle cx={cx} cy={62} r={30} fill="none" stroke={D.line} strokeWidth={D.w} />
      <ellipse cx={cx} cy={62} rx={30} ry={9} fill="none" stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      <line x1={cx} y1={62} x2={cx + length * 0.72} y2={62 - length * 0.7} stroke={D.teal} strokeWidth={1.4} />
      <circle cx={cx + length * 0.72} cy={62 - length * 0.7} r={2.6} fill={D.teal} />
      <circle cx={cx} cy={62} r={1.6} fill={D.faint} />
      <L x={cx} y={108} fill={D.muted}>{label}</L>
      <L x={cx} y={122} fill={D.faint}>{sub}</L>
    </g>
  );

  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="Three Bloch spheres in sequence. The state vector reaches the surface, then shortens, then collapses to the centre as the qubit loses its phase.">
      <L x={160} y={16} fill={D.muted}>THE VECTOR SHORTENS, IT DOES NOT MOVE</L>
      {sphere(56, 30, 't = 0', 'PURE STATE')}
      {sphere(160, 17, 't ~ T2', 'PHASE GOING')}
      {sphere(264, 4, 't >> T1', 'NOTHING LEFT')}
      <path d="M96 62 L118 62" stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      <path d="M200 62 L222 62" stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
    </svg>
  );
}

/** 07 - why the qubit counts in the news are not the qubit counts that matter. */
export function ErrorCorrectionBlock() {
  const dots = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      dots.push(
        <circle key={`${r}-${c}`} cx={216 + c * 26} cy={36 + r * 26} r={5.5}
          fill="none" stroke={D.teal} strokeWidth={D.w} />,
      );
    }
  }
  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="One logical qubit on the left, and the block of many physical qubits on the right that is required to hold it.">
      <L x={70} y={16} fill={D.muted}>WHAT AN ALGORITHM USES</L>
      <rect x={40} y={40} width={60} height={54} fill={D.violet} fillOpacity={0.1} stroke={D.violet} strokeWidth={D.w} />
      <circle cx={70} cy={67} r={11} fill="none" stroke={D.violet} strokeWidth={1.3} />
      <L x={70} y={110} fill={D.violet}>1 LOGICAL</L>

      <path d="M116 67 L166 67" stroke={D.line} strokeWidth={D.w} />
      <path d="M160 63 L166 67 L160 71" fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={141} y={58} fill={D.amber}>COSTS</L>

      <L x={242} y={16} fill={D.muted}>WHAT THE MACHINE BUILDS IT FROM</L>
      <rect x={200} y={22} width={84} height={84} fill="none" stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      {dots}
      <L x={242} y={122} fill={D.faint}>MANY PHYSICAL, AND THIS IS THE SMALL CASE</L>
    </svg>
  );
}

/** 08 - the one-way door. */
export function MeasurementCollapse() {
  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="A state vector on a circle resolving to one of two poles, with probabilities given by the squared cosine and sine of half the polar angle.">
      <circle cx={72} cy={62} r={34} fill="none" stroke={D.line} strokeWidth={D.w} />
      <line x1={72} y1={28} x2={72} y2={96} stroke={D.line} strokeWidth={D.w} strokeDasharray="2 3" />
      <line x1={72} y1={62} x2={98} y2={40} stroke={D.teal} strokeWidth={1.4} />
      <circle cx={98} cy={40} r={3} fill={D.teal} />
      <path d="M72 44 A18 18 0 0 1 84 49" fill="none" stroke={D.amber} strokeWidth={D.w} />
      <L x={88} y={62} fill={D.amber} anchor="start">θ</L>
      <L x={72} y={116} fill={D.muted}>BEFORE</L>

      <path d="M124 62 L164 62" stroke={D.line} strokeWidth={D.w} />
      <path d="M158 58 L164 62 L158 66" fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={144} y={54} fill={D.faint}>READ</L>

      <rect x={190} y={22} width={104} height={38} fill="none" stroke={D.teal} strokeWidth={D.w} />
      <L x={210} y={45} fill={D.teal} size={11}>|0&gt;</L>
      <L x={262} y={45} fill={D.muted}>cos²(θ/2)</L>

      <rect x={190} y={70} width={104} height={38} fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={210} y={93} fill={D.faint} size={11}>|1&gt;</L>
      <L x={262} y={93} fill={D.muted}>sin²(θ/2)</L>

      <L x={242} y={128} fill={D.faint}>ONE OUTCOME. THE DIRECTION IS SPENT.</L>
    </svg>
  );
}
