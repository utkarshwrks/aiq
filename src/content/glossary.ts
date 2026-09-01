/**
 * The glossary.
 *
 * Definitions are written to be read cold, without the surrounding
 * plate. Where a term is routinely used loosely, the entry says so:
 * a glossary that repeats the ambient confusion is worse than none.
 */

export type GlossaryEntry = {
  term: string;
  /** Alternative spellings and abbreviations, matched by the search. */
  aliases?: readonly string[];
  definition: string;
  /** Optional clarification of a common misuse. */
  note?: string;
  /** Related terms, by exact term string. */
  see?: readonly string[];
  category:
    | 'concept'
    | 'hardware'
    | 'algorithm'
    | 'error-correction'
    | 'metric'
    | 'programme';
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: 'Amplitude',
    definition:
      'The complex number attached to each basis state of a quantum system. The probability of measuring that state is the squared magnitude of its amplitude; the phase carries no probability of its own but determines how amplitudes interfere.',
    see: ['Interference', 'Born rule'],
    category: 'concept',
  },
  {
    term: 'Amplitude amplification',
    definition:
      'The general technique underlying Grover search: repeatedly reflecting a state about a marked subspace and about the mean, which rotates amplitude onto the marked states quadratically faster than sampling would find them.',
    see: ["Grover's algorithm"],
    category: 'algorithm',
  },
  {
    term: 'Ansatz',
    aliases: ['ansatze'],
    definition:
      'The fixed circuit shape whose parameters a variational algorithm tunes. Choosing one expressive enough to contain the target state but shallow enough to run on real hardware is the central unsolved problem of variational methods.',
    see: ['Variational quantum eigensolver', 'Barren plateau'],
    category: 'algorithm',
  },
  {
    term: 'Barren plateau',
    definition:
      'A region of a variational circuit\'s parameter landscape where gradients vanish exponentially with the number of qubits, making training effectively impossible. A structural obstacle for variational algorithms at scale rather than a tuning problem.',
    see: ['Ansatz', 'Variational quantum eigensolver'],
    category: 'algorithm',
  },
  {
    term: 'Bell state',
    aliases: ['bell pair', 'epr pair'],
    definition:
      'One of four maximally entangled two-qubit states. Measuring both halves in the same basis always produces correlated outcomes, and neither qubit has a state of its own.',
    see: ['Entanglement'],
    category: 'concept',
  },
  {
    term: 'Bloch sphere',
    definition:
      'The geometric representation of a single qubit\'s pure states as points on a unit sphere, with the computational basis states at the poles. It does not generalise to more than one qubit, which is why intuition built on it fails for entanglement.',
    note: 'Applies to a single qubit only. There is no Bloch sphere for a two-qubit state.',
    see: ['Qubit'],
    category: 'concept',
  },
  {
    term: 'Born rule',
    definition:
      'The rule that the probability of a measurement outcome equals the squared magnitude of the corresponding amplitude. It is the only place probability enters quantum mechanics; everything else is deterministic evolution.',
    see: ['Measurement', 'Amplitude'],
    category: 'concept',
  },
  {
    term: 'Circuit depth',
    definition:
      'The number of sequential layers of gates in a circuit. More predictive of whether a circuit will run usefully on current hardware than total gate count, because depth is what decoherence is measured against.',
    see: ['Decoherence', 'T2'],
    category: 'metric',
  },
  {
    term: 'Coherence time',
    definition:
      'How long a qubit maintains the quantum properties a computation depends on. Reported as T1 for energy relaxation and T2 for phase coherence, with T2 the more restrictive figure in practice.',
    see: ['Decoherence', 'T1', 'T2'],
    category: 'metric',
  },
  {
    term: 'Computational basis',
    definition:
      'The reference basis in which qubit states are conventionally written and measured, labelled |0> and |1>. Nothing physical distinguishes it; it is a choice of coordinates.',
    category: 'concept',
  },
  {
    term: 'CNOT gate',
    aliases: ['controlled-not', 'cx gate'],
    definition:
      'A two-qubit gate that flips the target qubit when the control is in state |1>. The standard entangling gate, and together with single-qubit rotations it forms a universal gate set.',
    see: ['Universal gate set', 'Entanglement'],
    category: 'concept',
  },
  {
    term: 'Decoherence',
    definition:
      'The loss of quantum coherence caused by a system becoming entangled with its environment. The information is not destroyed, it leaks outward, and once the environment holds it the interference the computation needs is gone.',
    see: ['Coherence time', 'Quantum error correction'],
    category: 'concept',
  },
  {
    term: 'Dilution refrigerator',
    definition:
      'The cryogenic system that cools superconducting quantum processors to around ten millikelvin, using a helium-3 and helium-4 mixture. Its size, cost and cooling budget are among the practical limits on scaling superconducting machines.',
    see: ['Superconducting qubit'],
    category: 'hardware',
  },
  {
    term: 'Fault tolerance',
    definition:
      'Operating a quantum computer such that errors are corrected faster than they accumulate, allowing arbitrarily long computations. Requires the physical error rate to be below the threshold and imposes a large physical-to-logical qubit overhead.',
    see: ['Threshold theorem', 'Logical qubit'],
    category: 'error-correction',
  },
  {
    term: 'Gate fidelity',
    definition:
      'How closely a physical gate operation matches the ideal unitary it is meant to implement, usually quoted as a percentage. Two-qubit gate fidelity is the figure that limits circuit depth on essentially every platform.',
    category: 'metric',
  },
  {
    term: "Grover's algorithm",
    definition:
      'A quantum search algorithm that finds a marked item among N unstructured candidates in about the square root of N steps. The speed-up is quadratic and provably optimal for unstructured search.',
    note: 'Frequently reported as making search exponentially faster. It does not; the gain is quadratic.',
    see: ['Amplitude amplification'],
    category: 'algorithm',
  },
  {
    term: 'Hadamard gate',
    definition:
      'The single-qubit gate that maps a basis state to an equal superposition of both basis states. The usual first operation in a circuit, because it is what creates the superposition everything else acts on.',
    category: 'concept',
  },
  {
    term: 'Interference',
    definition:
      'The addition of amplitudes from different computational paths before probabilities are taken, allowing paths to cancel. The mechanism that turns superposition into useful computation.',
    see: ['Amplitude', 'Superposition'],
    category: 'concept',
  },
  {
    term: 'Logical qubit',
    definition:
      'A qubit encoded across many physical qubits by an error-correcting code, with an error rate far below that of its constituents. The unit in which progress towards useful quantum computing is now measured.',
    see: ['Physical qubit', 'Surface code'],
    category: 'error-correction',
  },
  {
    term: 'Measurement',
    definition:
      'The irreversible operation that yields one classical outcome from a quantum state, with probability given by the Born rule, and collapses the state to match.',
    note: 'No observer is required. Any sufficiently strong interaction with the environment has the same effect.',
    see: ['Born rule'],
    category: 'concept',
  },
  {
    term: 'National Quantum Mission',
    aliases: ['nqm'],
    definition:
      'India\'s national quantum programme, approved by the Union Cabinet in April 2023 with an outlay of 6,003.65 crore rupees to 2031, organised around four thematic hubs covering computing, communication, sensing and materials.',
    see: ['Thematic hub'],
    category: 'programme',
  },
  {
    term: 'NISQ',
    aliases: ['noisy intermediate-scale quantum'],
    definition:
      'The current era of quantum hardware: enough qubits to be beyond easy classical simulation, not enough fidelity to run error correction. Named by John Preskill in 2018.',
    see: ['Fault tolerance'],
    category: 'concept',
  },
  {
    term: 'No-cloning theorem',
    definition:
      'The result that an unknown quantum state cannot be copied. It is why classical repetition codes do not work quantumly, and why quantum key distribution can detect eavesdropping.',
    see: ['Quantum key distribution', 'Quantum error correction'],
    category: 'concept',
  },
  {
    term: 'Physical qubit',
    definition:
      'An individual hardware qubit, as fabricated. Vendor qubit counts refer to these, which is why a processor with a few hundred physical qubits is not a machine with a few hundred usable ones.',
    see: ['Logical qubit'],
    category: 'hardware',
  },
  {
    term: 'Post-quantum cryptography',
    aliases: ['pqc'],
    definition:
      'Classical cryptographic schemes designed to resist attack by quantum computers. Standardised by NIST and being deployed now, on the reasoning that traffic captured today can be decrypted once a capable machine exists.',
    note: 'Runs on ordinary computers. It is not quantum cryptography, which uses quantum physics to distribute keys.',
    see: ['Quantum key distribution', "Shor's algorithm"],
    category: 'programme',
  },
  {
    term: 'Quantum advantage',
    aliases: ['quantum supremacy'],
    definition:
      'A demonstration that a quantum device performs some task beyond the practical reach of classical computers. Claims are only as strong as the classical baseline they are measured against, and several have been weakened by subsequent classical improvements.',
    note: 'Advantage on a contrived sampling task is not advantage on a useful problem, and the two are regularly conflated.',
    category: 'metric',
  },
  {
    term: 'Quantum annealing',
    definition:
      'A special-purpose approach that finds low-energy configurations of an optimisation problem by evolving a physical system towards its ground state. Cannot run gate-model algorithms.',
    note: 'Annealer qubit counts are not comparable with gate-model qubit counts; the machines do different things.',
    category: 'hardware',
  },
  {
    term: 'Quantum error correction',
    aliases: ['qec'],
    definition:
      'Encoding a logical qubit across many physical qubits and measuring error syndromes without measuring the encoded data, so errors can be identified and corrected without collapsing the state.',
    see: ['Surface code', 'Threshold theorem'],
    category: 'error-correction',
  },
  {
    term: 'Quantum Fourier transform',
    aliases: ['qft'],
    definition:
      'The quantum analogue of the discrete Fourier transform, computable in about n^2 gates on n qubits. The engine of phase estimation and therefore of Shor factoring.',
    see: ["Shor's algorithm"],
    category: 'algorithm',
  },
  {
    term: 'Quantum key distribution',
    aliases: ['qkd'],
    definition:
      'Distributing an encryption key using quantum states, such that eavesdropping necessarily disturbs the transmission and is detected. Security rests on physics rather than on computational hardness.',
    note: 'Distributes keys only. It does not encrypt data, and it needs a classical authenticated channel alongside it.',
    see: ['Post-quantum cryptography', 'No-cloning theorem'],
    category: 'programme',
  },
  {
    term: 'Qubit',
    definition:
      'A two-level quantum system used as the unit of quantum information. Its state is a complex-weighted combination of two reference states, and measuring it yields exactly one classical bit.',
    note: 'It does not store more than one bit of retrievable information, despite holding a continuum of states.',
    see: ['Bloch sphere', 'Superposition'],
    category: 'concept',
  },
  {
    term: "Shor's algorithm",
    definition:
      'A polynomial-time quantum algorithm for factoring integers and computing discrete logarithms, which breaks RSA and elliptic curve cryptography given a sufficiently large fault-tolerant machine.',
    see: ['Quantum Fourier transform', 'Post-quantum cryptography'],
    category: 'algorithm',
  },
  {
    term: 'Superconducting qubit',
    definition:
      'A qubit built from a superconducting circuit containing a Josephson junction, operated at millikelvin temperatures and controlled with microwave pulses. The most widely deployed modality.',
    see: ['Transmon', 'Dilution refrigerator'],
    category: 'hardware',
  },
  {
    term: 'Superposition',
    definition:
      'A quantum state expressed as a complex-weighted combination of basis states. Not a statement of ignorance about which state the system is really in.',
    note: 'It does not mean a computer evaluates every possibility at once and reads them all; only n bits emerge from n qubits.',
    see: ['Amplitude', 'Interference'],
    category: 'concept',
  },
  {
    term: 'Surface code',
    definition:
      'A quantum error-correcting code arranged on a two-dimensional lattice requiring only nearest-neighbour interactions, which is why it suits planar chip fabrication. The leading candidate for fault-tolerant hardware.',
    see: ['Quantum error correction', 'Threshold theorem'],
    category: 'error-correction',
  },
  {
    term: 'Syndrome measurement',
    definition:
      'Measuring joint properties of a group of physical qubits to reveal what error has occurred without revealing the encoded logical state. The operation that makes quantum error correction possible at all.',
    see: ['Quantum error correction'],
    category: 'error-correction',
  },
  {
    term: 'T1',
    definition:
      'The characteristic time for an excited qubit to relax towards its ground state. Measures energy loss.',
    see: ['T2', 'Coherence time'],
    category: 'metric',
  },
  {
    term: 'T2',
    definition:
      'The characteristic time over which the relative phase between a qubit\'s basis states survives. Bounded above by twice T1 and usually much shorter, and it is phase that interference depends on.',
    see: ['T1', 'Coherence time'],
    category: 'metric',
  },
  {
    term: 'Thematic hub',
    aliases: ['t-hub'],
    definition:
      'One of the four institutional consortia through which the National Quantum Mission is delivered, covering quantum computing, communication, sensing and metrology, and materials and devices.',
    see: ['National Quantum Mission'],
    category: 'programme',
  },
  {
    term: 'Threshold theorem',
    definition:
      'The result that if physical error rates are below a certain threshold, adding more physical qubits per logical qubit suppresses logical errors exponentially. Below the threshold scaling helps; above it, scaling makes things worse.',
    see: ['Fault tolerance', 'Surface code'],
    category: 'error-correction',
  },
  {
    term: 'Transmon',
    definition:
      'A superconducting qubit design that suppresses sensitivity to charge noise by operating at a large ratio of Josephson to charging energy. The dominant superconducting qubit design since the late 2000s.',
    see: ['Superconducting qubit'],
    category: 'hardware',
  },
  {
    term: 'Trapped ion',
    definition:
      'A qubit modality using individual charged atoms held in electromagnetic traps and manipulated with lasers. Offers long coherence and all-to-all connectivity at the cost of much slower gates.',
    category: 'hardware',
  },
  {
    term: 'Trotterisation',
    definition:
      'Approximating evolution under a sum of non-commuting Hamiltonian terms by a sequence of short evolutions under each in turn. The standard method for digital quantum simulation, with error controlled by step size.',
    see: ['Quantum simulation'],
    category: 'algorithm',
  },
  {
    term: 'Universal gate set',
    definition:
      'A finite set of gates from which any unitary operation can be approximated to arbitrary accuracy. Single-qubit rotations plus one entangling two-qubit gate suffice.',
    see: ['CNOT gate'],
    category: 'concept',
  },
  {
    term: 'Variational quantum eigensolver',
    aliases: ['vqe'],
    definition:
      'A hybrid algorithm that finds ground-state energies by having a classical optimiser tune the parameters of a shallow quantum circuit. Designed for hardware without error correction.',
    see: ['Ansatz', 'Barren plateau'],
    category: 'algorithm',
  },
  {
    term: 'Quantum simulation',
    definition:
      'Using a controllable quantum system to model the behaviour of one that cannot be simulated classically. The original proposed application and the one with the clearest theoretical basis.',
    see: ['Trotterisation'],
    category: 'algorithm',
  },
];

export const GLOSSARY_CATEGORIES: Record<GlossaryEntry['category'], string> = {
  concept: 'Concept',
  hardware: 'Hardware',
  algorithm: 'Algorithm',
  'error-correction': 'Error correction',
  metric: 'Metric',
  programme: 'Programme',
};

/** Alphabetically sorted, case-insensitive, ignoring leading punctuation. */
export const SORTED_GLOSSARY = [...GLOSSARY].sort((a, b) =>
  a.term.replace(/^\W+/, '').localeCompare(b.term.replace(/^\W+/, ''), 'en', {
    sensitivity: 'base',
  }),
);

/** The letters actually present, for the A-Z rail. */
export const GLOSSARY_LETTERS = [
  ...new Set(
    SORTED_GLOSSARY.map((entry) =>
      entry.term.replace(/^\W+/, '')[0]!.toUpperCase(),
    ),
  ),
];
