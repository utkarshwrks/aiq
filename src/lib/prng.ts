/**
 * A small deterministic pseudo-random generator (mulberry32).
 *
 * Used where a scene needs scattered values that must be the same on
 * every load: an instrument that rearranges itself between visits reads
 * as noise rather than as a diagram, and a particle field seeded from
 * Math.random cannot be compared against a reference screenshot.
 *
 * Not for anything security-relevant. This is a layout tool.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
