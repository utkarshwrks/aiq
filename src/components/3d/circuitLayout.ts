import type { Circuit, Gate } from '@/lib/circuits';

/**
 * Turns a circuit specification into scene coordinates. Kept separate
 * from the renderer so the layout can be unit-tested without a WebGL
 * context, and so the 2D fallback can lay itself out identically.
 */

export const WIRE_SPACING = 0.86;
export const STEP_SPACING = 0.92;
/** Extra wire run before the first column and after the last. */
export const WIRE_MARGIN = 0.8;

export function wireY(circuit: Circuit, index: number): number {
  return ((circuit.qubits - 1) / 2 - index) * WIRE_SPACING;
}

export function stepX(circuit: Circuit, step: number): number {
  return (step - (circuit.steps - 1) / 2) * STEP_SPACING;
}

export function wireStartX(circuit: Circuit): number {
  return stepX(circuit, 0) - WIRE_MARGIN;
}

export function wireEndX(circuit: Circuit): number {
  return stepX(circuit, circuit.steps - 1) + WIRE_MARGIN;
}

export function circuitWidth(circuit: Circuit): number {
  return wireEndX(circuit) - wireStartX(circuit);
}

/** Every wire index a gate occupies, for hit-testing and highlighting. */
export function gateWires(gate: Gate): number[] {
  const wires = [gate.target];
  if (gate.control !== undefined) wires.push(gate.control);
  if (gate.partner !== undefined) wires.push(gate.partner);
  return wires;
}

/**
 * Normalised position of a gate along the wire run, 0 at the left edge
 * and 1 at the right. The travelling pulse compares its own progress
 * against these to decide which gate is currently energised.
 */
export function gateProgress(circuit: Circuit, gate: Gate): number {
  const start = wireStartX(circuit);
  const width = circuitWidth(circuit);
  return (stepX(circuit, gate.step) - start) / width;
}
