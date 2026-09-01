import { describe, expect, it } from 'vitest';
import { BELL_CIRCUIT, GHZ_CIRCUIT, GROVER_CIRCUIT } from '@/lib/circuits';
import {
  circuitWidth,
  gateProgress,
  gateWires,
  stepX,
  wireEndX,
  wireStartX,
  wireY,
} from '@/components/3d/circuitLayout';

describe('circuit layout', () => {
  it('centres the wires vertically about the origin', () => {
    const top = wireY(GHZ_CIRCUIT, 0);
    const bottom = wireY(GHZ_CIRCUIT, GHZ_CIRCUIT.qubits - 1);
    expect(top + bottom).toBeCloseTo(0, 12);
  });

  it('centres the columns horizontally about the origin', () => {
    const first = stepX(GHZ_CIRCUIT, 0);
    const last = stepX(GHZ_CIRCUIT, GHZ_CIRCUIT.steps - 1);
    expect(first + last).toBeCloseTo(0, 12);
  });

  it('runs the wires past the first and last column', () => {
    expect(wireStartX(BELL_CIRCUIT)).toBeLessThan(stepX(BELL_CIRCUIT, 0));
    expect(wireEndX(BELL_CIRCUIT)).toBeGreaterThan(
      stepX(BELL_CIRCUIT, BELL_CIRCUIT.steps - 1),
    );
  });

  it('reports a positive width', () => {
    expect(circuitWidth(GROVER_CIRCUIT)).toBeGreaterThan(0);
  });

  it('maps gate progress into the unit interval, in step order', () => {
    for (const gate of GROVER_CIRCUIT.gates) {
      const progress = gateProgress(GROVER_CIRCUIT, gate);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }

    const first = GROVER_CIRCUIT.gates.find((g) => g.step === 0)!;
    const last = GROVER_CIRCUIT.gates.find(
      (g) => g.step === GROVER_CIRCUIT.steps - 1,
    )!;
    expect(gateProgress(GROVER_CIRCUIT, first)).toBeLessThan(
      gateProgress(GROVER_CIRCUIT, last),
    );
  });

  it('lists every wire a gate occupies', () => {
    expect(gateWires({ kind: 'H', target: 1, step: 0 })).toEqual([1]);
    expect(
      gateWires({ kind: 'CNOT', control: 0, target: 2, step: 1 }).sort(),
    ).toEqual([0, 2]);
    expect(
      gateWires({ kind: 'SWAP', target: 0, partner: 3, step: 2 }).sort(),
    ).toEqual([0, 3]);
  });
});

describe('circuit specifications', () => {
  it('keeps every gate inside its circuit\'s declared bounds', () => {
    for (const circuit of [BELL_CIRCUIT, GHZ_CIRCUIT, GROVER_CIRCUIT]) {
      for (const gate of circuit.gates) {
        expect(gate.step).toBeGreaterThanOrEqual(0);
        expect(gate.step).toBeLessThan(circuit.steps);
        for (const wire of gateWires(gate)) {
          expect(wire).toBeGreaterThanOrEqual(0);
          expect(wire).toBeLessThan(circuit.qubits);
        }
      }
    }
  });

  it('never puts a control on the same wire as its target', () => {
    for (const circuit of [BELL_CIRCUIT, GHZ_CIRCUIT, GROVER_CIRCUIT]) {
      for (const gate of circuit.gates) {
        if (gate.control !== undefined) {
          expect(gate.control).not.toBe(gate.target);
        }
      }
    }
  });
});
