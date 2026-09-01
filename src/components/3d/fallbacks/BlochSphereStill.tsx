/**
 * Static substitute for the Bloch sphere, shown when motion is reduced.
 * It is drawn to the same visual specification as the live scene - the
 * same graticule spacing, the same swept arcs, the same accent roles -
 * so a reader who never sees the interactive version still sees the
 * intended illustration rather than a placeholder.
 */
export function BlochSphereStill() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="size-full"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(160 160)">
        {/* Limb. */}
        <circle r="110" fill="none" stroke="var(--cg-line-grid)" strokeWidth="1" />

        {/* Parallels, foreshortened as ellipses at 30 degree steps. */}
        {[55, 95, 110, 95, 55].map((rx, i) => (
          <ellipse
            key={`par-${i}`}
            cx="0"
            cy={[-95, -55, 0, 55, 95][i]}
            rx={rx}
            ry={rx * 0.22}
            fill="none"
            stroke="var(--cg-line-grid)"
            strokeWidth="1"
            opacity={rx === 110 ? 0 : 0.85}
          />
        ))}

        {/* Equator, weighted. */}
        <ellipse
          rx="110"
          ry="26"
          fill="none"
          stroke="var(--cg-accent-teal)"
          strokeWidth="1.2"
          opacity="0.4"
        />

        {/* Meridians. */}
        {[110, 78, 40].map((rx, i) => (
          <ellipse
            key={`mer-${i}`}
            rx={rx}
            ry="110"
            fill="none"
            stroke="var(--cg-line-grid)"
            strokeWidth="1"
            opacity="0.7"
          />
        ))}

        {/* Polar axis. */}
        <line
          x1="0"
          y1="-132"
          x2="0"
          y2="132"
          stroke="var(--cg-accent-teal)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <line
          x1="-132"
          y1="0"
          x2="132"
          y2="0"
          stroke="var(--cg-line-grid)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Swept polar angle from the north pole to the state. */}
        <path
          d="M 0 -110 A 110 110 0 0 1 66 -88"
          fill="none"
          stroke="var(--cg-accent-amber)"
          strokeWidth="1.6"
          opacity="0.8"
        />

        {/* Azimuth sweep in the equatorial plane. */}
        <path
          d="M 46 0 A 46 11 0 0 1 26 9"
          fill="none"
          stroke="var(--cg-accent-violet)"
          strokeWidth="1.6"
          opacity="0.75"
        />

        {/* State vector. */}
        <line
          x1="0"
          y1="0"
          x2="66"
          y2="-88"
          stroke="var(--cg-accent-teal)"
          strokeWidth="2.4"
        />
        <circle cx="66" cy="-88" r="5.5" fill="var(--cg-accent-teal)" />
        <circle r="2.6" fill="var(--cg-ink)" />

        {/* Basis labels. */}
        <g
          fill="var(--cg-ink-faint)"
          fontSize="11"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
        >
          <text y="-142">|0&gt;</text>
          <text y="152">|1&gt;</text>
          <text x="146" y="4">|+&gt;</text>
          <text x="-146" y="4">|-&gt;</text>
        </g>
      </g>
    </svg>
  );
}
