import { D, L } from './Figure';
import { HUBS, MISSION } from '@/content/india';

/**
 * Diagrams for the ecosystem and India plates, where the material is a
 * comparison and a structure rather than an idea.
 */

/**
 * The modality trade-off, as a shape rather than six paragraphs.
 *
 * Deliberately unnumbered. These are qualitative standings that move
 * with every hardware generation, and putting a scale on them would
 * claim a precision the field does not have and this page cannot keep
 * current. What survives a generation is the shape: what each approach
 * buys and what it pays.
 */
export function ModalityTradeoffs() {
  // Standings read straight off each modality's own trade-off sentence in
  // `src/content/ecosystem.ts`. Five pips, not a bar: pips read as a
  // judgement, where a bar would imply something was measured.
  const ROWS = [
    { name: 'SUPERCONDUCTING', speed: 5, coherence: 2, connect: 2, fab: 4 },
    { name: 'TRAPPED ION', speed: 1, coherence: 5, connect: 5, fab: 2 },
    { name: 'PHOTONIC', speed: 4, coherence: 4, connect: 3, fab: 3 },
    { name: 'NEUTRAL ATOM', speed: 3, coherence: 4, connect: 4, fab: 3 },
    { name: 'SILICON SPIN', speed: 4, coherence: 3, connect: 2, fab: 5 },
  ] as const;

  const COLS = [
    { key: 'speed', label: 'GATE SPEED' },
    { key: 'coherence', label: 'COHERENCE' },
    { key: 'connect', label: 'CONNECTIVITY' },
    { key: 'fab', label: 'FABRICATION' },
  ] as const;

  const x0 = 112;
  const cw = 66;

  return (
    <svg viewBox="0 0 380 166" className="w-full" role="img"
      aria-label="A grid comparing five hardware approaches across gate speed, coherence, connectivity and fabrication maturity, each scored out of five. Trapped ions lead on coherence and connectivity; superconducting circuits lead on gate speed; silicon spin leads on fabrication.">
      {COLS.map((col, c) => (
        <L key={col.key} x={x0 + c * cw + cw / 2} y={16} fill={D.faint} size={7}>
          {col.label}
        </L>
      ))}

      {ROWS.map((row, r) => {
        const y = 38 + r * 25;
        return (
          <g key={row.name}>
            <L x={104} y={y + 4} fill={D.muted} anchor="end" size={7.5}>{row.name}</L>
            <line x1={x0} y1={y + 12} x2={x0 + COLS.length * cw} y2={y + 12}
              stroke={D.hair} strokeWidth={D.w} />
            {COLS.map((col, c) => (
              <g key={col.key}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect key={i}
                    x={x0 + c * cw + 13 + i * 8} y={y - 4} width={5} height={9}
                    fill={i < row[col.key] ? D.teal : 'none'}
                    fillOpacity={i < row[col.key] ? 0.8 : 0}
                    stroke={i < row[col.key] ? D.teal : D.line} strokeWidth={D.w} />
                ))}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** How the National Quantum Mission is actually organised. */
export function MissionStructure() {
  // Read from the content registry rather than restated here, so a
  // correction to a hub's host or theme reaches the diagram too.
  const hubs = HUBS.map((hub) => ({
    theme: (hub.theme ?? '').toUpperCase(),
    host: (hub.short ?? hub.name).toUpperCase(),
  }));

  return (
    <svg viewBox="0 0 380 150" className="w-full" role="img"
      aria-label="The Department of Science and Technology funds the National Quantum Mission, which is delivered through four thematic hubs hosted at existing institutions rather than one new laboratory.">
      <rect x={110} y={12} width={160} height={26} fill="none" stroke={D.line} strokeWidth={D.w} />
      <L x={190} y={28} fill={D.muted}>DEPT. OF SCIENCE &amp; TECHNOLOGY</L>

      <line x1={190} y1={38} x2={190} y2={52} stroke={D.line} strokeWidth={D.w} />

      <rect x={110} y={52} width={160} height={28} fill={D.teal} fillOpacity={0.08}
        stroke={D.teal} strokeWidth={D.w} />
      <L x={190} y={65} fill={D.teal}>NATIONAL QUANTUM MISSION</L>
      <L x={190} y={75} fill={D.faint} size={7}>
        {MISSION.period.replace(' to ', '-')} / {MISSION.outlay.replace(' rupees', '').toUpperCase()}
      </L>

      {/* The distribution bus: four hubs, not one laboratory. */}
      <line x1={190} y1={80} x2={190} y2={92} stroke={D.line} strokeWidth={D.w} />
      <line x1={46} y1={92} x2={334} y2={92} stroke={D.line} strokeWidth={D.w} />

      {hubs.map((hub, i) => {
        const cx = 46 + i * (288 / Math.max(1, hubs.length - 1));
        return (
          <g key={hub.host}>
            <line x1={cx} y1={92} x2={cx} y2={102} stroke={D.line} strokeWidth={D.w} />
            <rect x={cx - 42} y={102} width={84} height={30} fill="none"
              stroke={D.violet} strokeWidth={D.w} />
            <L x={cx} y={115} fill={D.violet} size={7}>{hub.theme}</L>
            <L x={cx} y={126} fill={D.faint} size={7}>{hub.host}</L>
          </g>
        );
      })}

      <L x={190} y={146} fill={D.faint} size={7}>
        {hubs.length} THEMATIC HUBS AT EXISTING INSTITUTIONS
      </L>
    </svg>
  );
}
