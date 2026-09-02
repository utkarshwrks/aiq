import { D, L } from './Figure';

const VB = '0 0 380 142';

/**
 * How the two speed-ups actually differ.
 *
 * Small multiples rather than one plot with two y-scales: factoring and
 * search are different problems and their curves share no meaningful
 * axis. Both series are direct-labelled at the end of the curve and the
 * classical line is dashed, so identity never rests on colour alone.
 *
 * The y-axis is deliberately unnumbered. The point is the shape of the
 * growth, not a benchmark, and putting figures on it would invite a
 * comparison the drawing cannot support.
 */
export function ComplexityShapes() {
  const W = 92;
  const TOP = 30;
  const BASE = 92;

  const panel = (
    ox: number,
    title: string,
    series: readonly {
      f: (t: number) => number;
      colour: string;
      dash?: string;
      label: string;
    }[],
  ) => (
    <g>
      <L x={ox + W / 2} y={18} fill={D.muted}>{title}</L>
      {/* Two rules, no box and no gridlines: the axes are there to give
          the curves a floor and an origin, not to be read off. */}
      <line x1={ox} y1={BASE} x2={ox + W} y2={BASE} stroke={D.hair} strokeWidth={D.w} />
      <line x1={ox} y1={TOP} x2={ox} y2={BASE} stroke={D.hair} strokeWidth={D.w} />

      {series.map((s2) => {
        let d = '';
        for (let i = 0; i <= 40; i += 1) {
          const t = i / 40;
          const y = BASE - Math.min(1, s2.f(t)) * (BASE - TOP);
          d += `${i === 0 ? 'M' : ' L'}${(ox + t * W).toFixed(1)} ${y.toFixed(1)}`;
        }
        // The label sits at the end of its own curve, so identity never
        // depends on matching a colour to a legend swatch.
        const endY = BASE - Math.min(1, s2.f(1)) * (BASE - TOP);
        return (
          <g key={s2.label}>
            <path d={d} fill="none" stroke={s2.colour} strokeWidth={1.5}
              {...(s2.dash ? { strokeDasharray: s2.dash } : {})} />
            <L x={ox + W + 5} y={endY + 3} fill={s2.colour} anchor="start" size={7.5}>
              {s2.label}
            </L>
          </g>
        );
      })}

      <L x={ox + W / 2} y={106} fill={D.faint} size={7}>PROBLEM SIZE</L>
    </g>
  );

  return (
    <svg viewBox="0 0 380 138" className="w-full" role="img"
      aria-label="Two plots of cost against problem size. For factoring the classical curve climbs steeply while the quantum curve stays nearly flat. For search the classical curve is a straight line and the quantum curve is its square root.">
      {panel(24, 'FACTORING', [
        { f: (t) => Math.pow(t, 5) * 1.05, colour: D.amber, dash: '4 3', label: 'SUB-EXP' },
        { f: (t) => t * 0.34, colour: D.teal, label: 'POLY' },
      ])}
      {panel(214, 'SEARCH', [
        { f: (t) => t, colour: D.amber, dash: '4 3', label: 'N' },
        { f: (t) => Math.sqrt(t) * 0.62, colour: D.teal, label: 'sqrt N' },
      ])}

      <line x1={190} y1={26} x2={190} y2={100} stroke={D.hair} strokeWidth={D.w} />

      {/* Legend, kept alongside the direct labels rather than instead of
          them: two series always get one. */}
      <g>
        <line x1={112} y1={128} x2={128} y2={128} stroke={D.amber} strokeWidth={1.5} strokeDasharray="4 3" />
        <L x={134} y={131} fill={D.muted} anchor="start" size={7.5}>CLASSICAL</L>
        <line x1={214} y1={128} x2={230} y2={128} stroke={D.teal} strokeWidth={1.5} />
        <L x={236} y={131} fill={D.muted} anchor="start" size={7.5}>QUANTUM</L>
      </g>
    </svg>
  );
}

/** The shape every near-term algorithm actually has. */
export function VariationalLoop() {
  const box = (x: number, y: number, w: number, h: number, colour: string) => (
    <rect x={x} y={y} width={w} height={h} fill="var(--cg-bg-elevated)" stroke={colour} strokeWidth={D.w} />
  );

  return (
    <svg viewBox={VB} className="w-full" role="img"
      aria-label="A loop: a parameterised quantum circuit is run and measured, a classical optimiser reads the resulting energy and proposes new parameters, and the circuit is run again.">
      {box(20, 46, 82, 42, D.teal)}
      <L x={85} y={62} fill={D.teal}>QUANTUM</L>
      <L x={85} y={76} fill={D.faint}>CIRCUIT U(θ)</L>

      {box(218, 46, 82, 42, D.amber)}
      <L x={295} y={62} fill={D.amber}>CLASSICAL</L>
      <L x={295} y={76} fill={D.faint}>OPTIMISER</L>

      {/* Forward: run and measure. */}
      <path d="M126 60 L248 60" stroke={D.line} strokeWidth={D.w} />
      <path d="M242 56 L248 60 L242 64" fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={187} y={52} fill={D.muted}>MEASURED ENERGY</L>

      {/* Return: new parameters. */}
      <path d="M254 74 L132 74" stroke={D.line} strokeWidth={D.w} />
      <path d="M138 70 L132 74 L138 78" fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={193} y={86} fill={D.muted}>NEW PARAMETERS θ</L>

      <L x={190} y={112} fill={D.faint}>THE CIRCUIT STAYS SHALLOW BECAUSE THE LOOP, NOT THE</L>
      <L x={190} y={126} fill={D.faint}>CIRCUIT, CARRIES THE SEARCH. NOISE IS THE LIMIT.</L>
    </svg>
  );
}
