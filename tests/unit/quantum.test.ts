import { describe, expect, it } from 'vitest';
import {
  anglesToAmplitudes,
  anglesToVector,
  clampTheta,
  formatAmplitude,
  formatState,
  probabilityOne,
  probabilityZero,
  toDegrees,
  vectorToAngles,
  wrapPhi,
} from '@/lib/quantum';

const close = (a: number, b: number, tolerance = 1e-9) =>
  Math.abs(a - b) < tolerance;

describe('bloch conversions', () => {
  it('places the poles at the computational basis states', () => {
    expect(anglesToVector({ theta: 0, phi: 0 })).toEqual({ x: 0, y: 0, z: 1 });

    const south = anglesToVector({ theta: Math.PI, phi: 0 });
    expect(close(south.z, -1)).toBe(true);
  });

  it('round-trips angles through the vector representation', () => {
    const original = { theta: 1.02, phi: 4.31 };
    const back = vectorToAngles(anglesToVector(original));
    expect(close(back.theta, original.theta, 1e-9)).toBe(true);
    expect(close(back.phi, original.phi, 1e-9)).toBe(true);
  });

  it('normalises a vector that is only approximately on the sphere', () => {
    // Raycast hits are never exactly unit length.
    const angles = vectorToAngles({ x: 0, y: 0, z: 1.0000004 });
    expect(close(angles.theta, 0, 1e-3)).toBe(true);
  });

  it('clamps and wraps out-of-range angles', () => {
    expect(clampTheta(-1)).toBe(0);
    expect(clampTheta(Math.PI + 1)).toBe(Math.PI);
    expect(close(wrapPhi(-Math.PI / 2), (3 * Math.PI) / 2)).toBe(true);
  });
});

describe('probabilities', () => {
  it('gives certainty at the poles', () => {
    expect(probabilityZero({ theta: 0, phi: 0 })).toBeCloseTo(1, 12);
    expect(probabilityOne({ theta: Math.PI, phi: 0 })).toBeCloseTo(1, 12);
  });

  it('gives an even split on the equator regardless of phase', () => {
    for (const phi of [0, 1, 2.5, 6]) {
      expect(probabilityZero({ theta: Math.PI / 2, phi })).toBeCloseTo(0.5, 12);
    }
  });

  it('always sums to one', () => {
    for (const theta of [0.1, 0.9, 2.2, 3.0]) {
      const angles = { theta, phi: 1.1 };
      expect(probabilityZero(angles) + probabilityOne(angles)).toBeCloseTo(1, 12);
    }
  });
});

describe('amplitudes', () => {
  it('normalises to unit total probability', () => {
    const { alpha, betaRe, betaIm } = anglesToAmplitudes({
      theta: 1.3,
      phi: 2.1,
    });
    expect(alpha ** 2 + betaRe ** 2 + betaIm ** 2).toBeCloseTo(1, 12);
  });
});

describe('formatting', () => {
  it('omits a vanishing imaginary part', () => {
    expect(formatAmplitude(0.5, 0)).toBe('0.500');
  });

  it('parenthesises a genuinely complex amplitude', () => {
    expect(formatAmplitude(-0.367, 0.391)).toBe('(-0.367 + 0.391i)');
    expect(formatAmplitude(0.2, -0.4)).toBe('(0.200 - 0.400i)');
  });

  it('drops zero terms from the state expression', () => {
    // At the north pole the |1> amplitude is zero and printing
    // "0.000 |1>" would be noise.
    expect(formatState({ theta: 0, phi: 0 })).toBe('1.000 |0>');
    expect(formatState({ theta: Math.PI, phi: 0 })).not.toContain('|0>');
  });

  it('never emits a bare "+ -" sequence', () => {
    const state = formatState({ theta: 1.13, phi: 2.32 });
    expect(state).not.toContain('+ -');
  });

  it('rounds degrees for the readout', () => {
    expect(toDegrees(Math.PI)).toBe(180);
    expect(toDegrees(Math.PI / 2)).toBe(90);
  });
});
