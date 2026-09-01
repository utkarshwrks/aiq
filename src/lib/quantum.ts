/**
 * Small, dependency-free quantum-state helpers shared by the 3D scenes
 * and the readouts beside them. Everything here is single-qubit maths on
 * the Bloch sphere plus a couple of two-qubit correlation utilities.
 *
 * Conventions follow the standard textbook parameterisation:
 *
 *   |psi> = cos(theta/2) |0> + e^(i phi) sin(theta/2) |1>
 *
 * with theta in [0, pi] measured from +Z (which is |0>) and phi in
 * [0, 2pi) measured from +X in the XY plane.
 */

export type BlochAngles = {
  /** Polar angle from the +Z axis, radians, 0 to pi. */
  theta: number;
  /** Azimuthal angle from the +X axis, radians, 0 to 2pi. */
  phi: number;
};

export type BlochVector = {
  x: number;
  y: number;
  z: number;
};

export type Amplitudes = {
  /** Real amplitude of |0>. Always real and non-negative in this frame. */
  alpha: number;
  /** Complex amplitude of |1>, split into real and imaginary parts. */
  betaRe: number;
  betaIm: number;
};

const TAU = Math.PI * 2;

/** Wraps an angle into [0, 2pi). */
export function wrapPhi(phi: number): number {
  const wrapped = phi % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
}

/** Clamps a polar angle into [0, pi]. */
export function clampTheta(theta: number): number {
  return Math.min(Math.PI, Math.max(0, theta));
}

/** Angles to a unit vector on the Bloch sphere. */
export function anglesToVector({ theta, phi }: BlochAngles): BlochVector {
  const sinTheta = Math.sin(theta);
  return {
    x: sinTheta * Math.cos(phi),
    y: sinTheta * Math.sin(phi),
    z: Math.cos(theta),
  };
}

/**
 * Unit vector back to angles. The vector is normalised defensively
 * because callers frequently hand in a raycast hit point that is only
 * approximately on the sphere.
 */
export function vectorToAngles({ x, y, z }: BlochVector): BlochAngles {
  const len = Math.hypot(x, y, z) || 1;
  return {
    theta: clampTheta(Math.acos(Math.min(1, Math.max(-1, z / len)))),
    phi: wrapPhi(Math.atan2(y / len, x / len)),
  };
}

/** State amplitudes for a point on the sphere. */
export function anglesToAmplitudes({ theta, phi }: BlochAngles): Amplitudes {
  const half = theta / 2;
  const sin = Math.sin(half);
  return {
    alpha: Math.cos(half),
    betaRe: sin * Math.cos(phi),
    betaIm: sin * Math.sin(phi),
  };
}

/**
 * Probability of measuring |0> in the computational basis. This is the
 * number the hero readout shows, because it is the one quantity a reader
 * new to the subject can interpret without any further explanation.
 */
export function probabilityZero({ theta }: BlochAngles): number {
  const c = Math.cos(theta / 2);
  return c * c;
}

/** Probability of measuring |1>. Complement of probabilityZero. */
export function probabilityOne(angles: BlochAngles): number {
  return 1 - probabilityZero(angles);
}

/**
 * Formats an amplitude the way it would be written on a whiteboard:
 * a real part, then a signed imaginary part, both to three decimals.
 */
export function formatAmplitude(re: number, im: number): string {
  const r = re.toFixed(3);
  if (Math.abs(im) < 5e-4) return r;
  const sign = im < 0 ? '-' : '+';
  return `${r} ${sign} ${Math.abs(im).toFixed(3)}i`;
}

/** Radians to degrees, rounded, for the angle readouts. */
export function toDegrees(radians: number): number {
  return Math.round((radians * 180) / Math.PI);
}

/**
 * The six cardinal single-qubit basis states, used to label the sphere's
 * poles and equatorial crossings.
 */
export const CARDINAL_STATES: ReadonlyArray<{
  label: string;
  vector: BlochVector;
  description: string;
}> = [
  { label: '|0>', vector: { x: 0, y: 0, z: 1 }, description: 'Computational zero' },
  { label: '|1>', vector: { x: 0, y: 0, z: -1 }, description: 'Computational one' },
  { label: '|+>', vector: { x: 1, y: 0, z: 0 }, description: 'Equal superposition, zero phase' },
  { label: '|->', vector: { x: -1, y: 0, z: 0 }, description: 'Equal superposition, pi phase' },
  { label: '|i>', vector: { x: 0, y: 1, z: 0 }, description: 'Equal superposition, quarter phase' },
  { label: '|-i>', vector: { x: 0, y: -1, z: 0 }, description: 'Equal superposition, three-quarter phase' },
] as const;
