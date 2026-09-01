/**
 * Circuit specifications rendered by QuantumCircuitScene.
 *
 * These are real circuits, not decorative arrangements of shapes. A
 * reader who knows the notation should be able to check them, and a
 * reader who does not should still be looking at something that would
 * run.
 */

export type GateKind =
  | 'H' // Hadamard
  | 'X' // Pauli-X
  | 'Y' // Pauli-Y
  | 'Z' // Pauli-Z
  | 'S' // phase, quarter turn
  | 'T' // pi/8
  | 'RX'
  | 'RY'
  | 'RZ'
  | 'CNOT'
  | 'CZ'
  | 'SWAP'
  | 'MEASURE';

export type Gate = {
  kind: GateKind;
  /** Index of the wire the gate body sits on. */
  target: number;
  /** Control wire for two-qubit gates. */
  control?: number;
  /** Second target for SWAP. */
  partner?: number;
  /** Column position in the circuit, zero-indexed left to right. */
  step: number;
  /** Rotation angle label for parameterised gates, e.g. "pi/4". */
  param?: string;
};

export type Circuit = {
  id: string;
  name: string;
  /** One sentence on what the circuit does, shown beneath the scene. */
  summary: string;
  qubits: number;
  /** Number of columns; the pulse animation is timed against this. */
  steps: number;
  gates: readonly Gate[];
  /** The state the circuit prepares, in ket notation, where it is short enough to state. */
  prepares?: string;
};

/**
 * GHZ state preparation on three qubits. A Hadamard puts the first qubit
 * into an equal superposition; two CNOTs propagate it, leaving the three
 * qubits maximally entangled in (|000> + |111>) / sqrt(2).
 */
export const GHZ_CIRCUIT: Circuit = {
  id: 'ghz-3',
  name: 'GHZ state preparation',
  summary:
    'A Hadamard on the first qubit, propagated by two controlled-NOT gates, leaves all three qubits in a single maximally entangled state.',
  qubits: 3,
  steps: 5,
  prepares: '(|000> + |111>) / sqrt(2)',
  gates: [
    { kind: 'H', target: 0, step: 0 },
    { kind: 'CNOT', control: 0, target: 1, step: 1 },
    { kind: 'CNOT', control: 1, target: 2, step: 2 },
    { kind: 'MEASURE', target: 0, step: 4 },
    { kind: 'MEASURE', target: 1, step: 4 },
    { kind: 'MEASURE', target: 2, step: 4 },
  ],
};

/**
 * The Bell pair, the smallest circuit that produces entanglement, and the
 * one the entanglement explainer refers to directly.
 */
export const BELL_CIRCUIT: Circuit = {
  id: 'bell-2',
  name: 'Bell pair',
  summary:
    'The smallest circuit that produces entanglement: one Hadamard and one controlled-NOT correlate two qubits so that neither has a state of its own.',
  qubits: 2,
  steps: 4,
  prepares: '(|00> + |11>) / sqrt(2)',
  gates: [
    { kind: 'H', target: 0, step: 0 },
    { kind: 'CNOT', control: 0, target: 1, step: 1 },
    { kind: 'MEASURE', target: 0, step: 3 },
    { kind: 'MEASURE', target: 1, step: 3 },
  ],
};

/**
 * One Grover iteration on two qubits: an oracle marking |11> followed by
 * the diffusion operator. On two qubits a single iteration is enough to
 * find the marked item with certainty.
 */
export const GROVER_CIRCUIT: Circuit = {
  id: 'grover-2',
  name: 'Grover iteration, two qubits',
  summary:
    'An oracle phase-flips the marked basis state, then the diffusion operator reflects the amplitudes about their mean. On two qubits one iteration suffices.',
  qubits: 2,
  steps: 8,
  gates: [
    { kind: 'H', target: 0, step: 0 },
    { kind: 'H', target: 1, step: 0 },
    { kind: 'CZ', control: 0, target: 1, step: 1 },
    { kind: 'H', target: 0, step: 2 },
    { kind: 'H', target: 1, step: 2 },
    { kind: 'X', target: 0, step: 3 },
    { kind: 'X', target: 1, step: 3 },
    { kind: 'CZ', control: 0, target: 1, step: 4 },
    { kind: 'X', target: 0, step: 5 },
    { kind: 'X', target: 1, step: 5 },
    { kind: 'H', target: 0, step: 6 },
    { kind: 'H', target: 1, step: 6 },
    { kind: 'MEASURE', target: 0, step: 7 },
    { kind: 'MEASURE', target: 1, step: 7 },
  ],
};

/**
 * Quantum phase estimation on a three-qubit counting register: the
 * pattern underneath Shor's algorithm and much of quantum chemistry.
 * Rendered in the algorithms plate.
 */
export const PHASE_ESTIMATION_CIRCUIT: Circuit = {
  id: 'qpe-3',
  name: 'Phase estimation kernel',
  summary:
    'Hadamards prepare a counting register, controlled rotations write the eigenphase into it, and an inverse Fourier transform reads it out. This kernel sits underneath Shor factoring and much of quantum chemistry.',
  qubits: 4,
  steps: 7,
  gates: [
    { kind: 'H', target: 0, step: 0 },
    { kind: 'H', target: 1, step: 0 },
    { kind: 'H', target: 2, step: 0 },
    { kind: 'X', target: 3, step: 0 },
    { kind: 'CZ', control: 2, target: 3, step: 1 },
    { kind: 'CZ', control: 1, target: 3, step: 2 },
    { kind: 'CZ', control: 0, target: 3, step: 3 },
    { kind: 'SWAP', target: 0, partner: 2, step: 4 },
    { kind: 'RZ', target: 1, step: 5, param: 'pi/2' },
    { kind: 'H', target: 0, step: 5 },
    { kind: 'MEASURE', target: 0, step: 6 },
    { kind: 'MEASURE', target: 1, step: 6 },
    { kind: 'MEASURE', target: 2, step: 6 },
  ],
};

export const CIRCUITS = {
  [GHZ_CIRCUIT.id]: GHZ_CIRCUIT,
  [BELL_CIRCUIT.id]: BELL_CIRCUIT,
  [GROVER_CIRCUIT.id]: GROVER_CIRCUIT,
  [PHASE_ESTIMATION_CIRCUIT.id]: PHASE_ESTIMATION_CIRCUIT,
} as const;

/** Single-qubit gates render as a labelled body on their own wire. */
export const SINGLE_QUBIT_GATES: ReadonlySet<GateKind> = new Set<GateKind>([
  'H',
  'X',
  'Y',
  'Z',
  'S',
  'T',
  'RX',
  'RY',
  'RZ',
]);
