/**
 * Static substitute for the entanglement scene. Two particle clusters
 * with a correlation bundle between them; spins are drawn anti-correlated
 * across the pair exactly as the shader derives them, so the reduced
 * motion version makes the same point the animated one does.
 *
 * Point positions are generated from a fixed integer hash rather than
 * Math.random, so the server and client render identical markup.
 */

const COUNT = 88;

function hash(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function cluster(cx: number, sign: 1 | -1) {
  return Array.from({ length: COUNT }, (_, i) => {
    const a = hash(i + 1) * Math.PI * 2;
    const b = hash(i + 41) * Math.PI;
    const r = 26 + hash(i + 97) * 48;
    const spin = hash(i * 1.7 + 3) > 0.5;
    return {
      key: `${sign}-${i}`,
      cx: cx + Math.sin(b) * Math.cos(a) * r * sign,
      cy: 110 + Math.cos(b) * r * 0.86,
      r: 1.2 + hash(i + 13) * 1.5,
      // Anti-correlated across the pair.
      up: sign === 1 ? !spin : spin,
    };
  });
}

export function EntanglementStill() {
  const left = cluster(112, -1);
  const right = cluster(328, 1);

  return (
    <svg
      viewBox="0 0 440 220"
      className="size-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Correlation bundle. */}
      <g stroke="var(--cg-accent-violet)" fill="none" opacity="0.22">
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const lift = (t - 0.5) * 74;
          return (
            <path
              key={i}
              d={`M 150 ${110 + lift * 0.6} Q 220 ${110 + lift * 1.3} 290 ${110 + lift * 0.6}`}
              strokeWidth="1"
            />
          );
        })}
      </g>

      {[...left, ...right].map((p) => (
        <circle
          key={p.key}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={p.up ? 'var(--cg-accent-teal)' : 'var(--cg-accent-violet)'}
          opacity="0.75"
        />
      ))}
    </svg>
  );
}
