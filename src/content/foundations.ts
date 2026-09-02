import type { ReferenceKey } from "./references";

/**
 * The foundational concepts.
 *
 * Written from first principles rather than assembled from summaries.
 * Each entry carries a one-line definition for card use, a longer
 * explanation for the plate, the misconception it exists to correct, and
 * the sources it was checked against.
 *
 * The "corrects" field is the reason this file reads differently from
 * most introductions: every one of these ideas has a popular
 * mis-statement attached to it, and an explanation that does not name
 * the mis-statement leaves the reader holding both.
 */

export type Concept = {
  slug: string;
  /** Plate index, two digits. */
  index: string;
  name: string;
  /** One sentence, used on the landing strip. */
  definition: string;
  /** Two to four paragraphs for the foundations plate. */
  body: readonly string[];
  /** The popular mis-statement this concept is usually taught alongside. */
  corrects: string;
  /** Where the reader should go next. */
  leadsTo: readonly string[];
  cites: readonly ReferenceKey[];
};

export const CONCEPTS: readonly Concept[] = [
  {
    slug: "qubit",
    index: "01",
    name: "The qubit",
    definition:
      "A two-level quantum system whose state is a point on a sphere rather than one of two switch positions.",
    body: [
      "A classical bit is a switch: it is either down or up, and there is nothing in between. A qubit is a two-level quantum system, and its state is a direction. Any state is a weighted combination of the two reference directions - written |0> and |1> - where the weights are complex numbers called amplitudes. Amplitudes carry a phase, which has no classical counterpart, and that phase is what every quantum algorithm is ultimately manipulating.",
      "The moment the qubit is measured in the reference basis, one of the two outcomes occurs, with probability equal to the squared magnitude of the corresponding amplitude, and the state collapses to match. The direction is gone. This is why a qubit is not a bit that holds more information: you can put a continuum of directions in, but you can only ever get one bit out.",
    ],
    corrects:
      'A qubit is often described as "0 and 1 at the same time", which suggests it stores two bits. It stores one bit of extractable information. What it holds is a direction, and reading it destroys everything about that direction except which pole the measurement fell to.',
    leadsTo: ["superposition", "measurement"],
    cites: ["nielsen-chuang", "ibm-learning", "ms-azure-quantum-concepts"],
  },
  {
    slug: "superposition",
    index: "02",
    name: "Superposition",
    definition:
      "A quantum state written as a weighted combination of basis states, where the weights interfere rather than merely accumulate.",
    body: [
      "Superposition is the statement that if a system can be in state A and can be in state B, it can also be in any complex-weighted combination of the two. It is not a statement about ignorance. A qubit in an equal superposition of |0> and |1> is not secretly in one of them while we fail to look; it is in a state that is genuinely different from both, and that difference is measurable.",
      "An n-qubit register has 2^n amplitudes, and an operation applied to the register acts on all of them. This is where the apparent parallelism comes from, and also where the catch sits: the register holds 2^n amplitudes, but a measurement returns n bits. Any algorithm that is going to be useful has to concentrate the amplitude onto the answers worth reading before it measures.",
    ],
    corrects:
      'Superposition is routinely described as a computer "trying every possibility simultaneously". It does apply an operation to every amplitude at once, but only n bits come out of an n-qubit register. Without interference to concentrate amplitude on the right answers first, that parallelism yields nothing.',
    leadsTo: ["interference", "entanglement"],
    cites: ["nielsen-chuang", "ibm-learning", "preskill-nisq"],
  },
  {
    slug: "entanglement",
    index: "03",
    name: "Entanglement",
    definition:
      "A joint state of several qubits that cannot be written as a state for each one separately.",
    body: [
      "Two qubits are entangled when their joint state cannot be factored into a state for the first and a state for the second. The Bell pair is the canonical example: there is no pair of single-qubit states whose combination reproduces it. Each qubit, considered alone, is in no definite state at all, while the pair as a whole is in a perfectly definite one. Measure both halves in the same basis and the outcomes always agree, however far apart the measurements happen.",
      "Entanglement is not a channel. The correlated outcome cannot be used to send a message, because the local result is random and stays random until the two parties compare notes over an ordinary classical channel. What it provides is a resource - teleportation, dense coding, key distribution and most of error correction rest on it - and it is also the reason classical simulation is hard: describing n independent qubits takes n small descriptions, and n entangled ones takes 2^n amplitudes.",
    ],
    corrects:
      "Entanglement is often presented as instantaneous communication. It is not: each side sees pure randomness, and the correlation only becomes visible when the two results are compared over an ordinary classical channel, which travels no faster than light.",
    leadsTo: ["decoherence", "error-correction"],
    cites: ["nielsen-chuang", "ibm-learning", "ms-azure-quantum-concepts"],
  },
  {
    slug: "interference",
    index: "04",
    name: "Interference",
    definition:
      "The cancellation and reinforcement of amplitudes that turns superposition into computation.",
    body: [
      "When several computational paths lead to the same measurement outcome, their amplitudes add before the squaring that produces a probability. Because amplitudes are complex, that addition can cancel. Two paths of equal magnitude and opposite phase leave nothing behind, and arranging for exactly that is the useful work a quantum algorithm does.",
      "It also explains why quantum computers are so unforgiving of noise. Interference depends on the relative phases between paths being preserved exactly. Anything that scrambles those phases - a stray field, a thermal photon, an imperfect gate - degrades the cancellation, and the computation degrades with it.",
    ],
    corrects:
      "Speed-ups are frequently attributed to superposition alone. Superposition supplies the paths; interference is what makes some of them cancel. An algorithm with superposition and no interference gives a uniformly random answer.",
    leadsTo: ["decoherence", "algorithms"],
    cites: ["nielsen-chuang", "grover-1996", "shor-1997"],
  },
  {
    slug: "gates",
    index: "05",
    name: "Gates and circuits",
    definition:
      "Reversible operations that rotate a quantum state, composed into circuits the way logic gates compose into classical ones.",
    body: [
      "Quantum operations are unitary: they preserve total probability and, crucially, they are reversible. Every quantum gate has an inverse, which is already a sharp break from classical logic, where an AND gate discards information and cannot be undone.",
      "A small set suffices for everything. Single-qubit rotations together with one entangling two-qubit gate - the controlled-NOT is the usual choice - form a universal set, which is why vendors compete on the fidelity of a handful of gates rather than on a rich instruction set. On current hardware the depth of a circuit, meaning the number of sequential layers, matters more than its total gate count: every layer takes time, and time is what decoherence spends.",
    ],
    corrects:
      "Quantum gates are often imagined as logic gates that work on more values. They are rotations of a state vector, they are all reversible, and there is no quantum AND gate in the classical sense at all.",
    leadsTo: ["decoherence", "algorithms"],
    cites: ["nielsen-chuang", "ibm-learning", "ms-azure-quantum-concepts"],
  },
  {
    slug: "decoherence",
    index: "06",
    name: "Decoherence and noise",
    definition:
      "The leakage of quantum information into the environment, which destroys the phase relationships computation depends on.",
    body: [
      "A qubit is never truly isolated. It couples, however weakly, to everything around it, and that coupling entangles the qubit with its environment. Once the environment holds information about which state the qubit is in, the interference between those states is gone. That process is decoherence, and it is the central engineering problem of the field.",
      "It is quantified by two times. T1 measures how long an excited qubit takes to decay towards its ground state; T2 measures how long the relative phase between the two states survives, which is what interference needs. T2 is bounded by twice T1 and is often much shorter, because phase is the more fragile quantity. Gate errors compound it: a circuit of a thousand gates each accurate to one part in a thousand is, roughly, a coin flip.",
    ],
    corrects:
      'Decoherence is often described as the qubit "losing its state" through wear. Nothing is lost from the universe: the information leaks into the environment, and it is the environment learning which state the qubit is in that destroys the interference.',
    leadsTo: ["error-correction"],
    cites: ["nielsen-chuang", "preskill-nisq", "ibm-learning"],
  },
  {
    slug: "error-correction",
    index: "07",
    name: "Quantum error correction",
    definition:
      "Encoding one protected logical qubit across many physical qubits, and measuring the errors without measuring the data.",
    body: [
      "Classical error correction repeats a bit and takes a majority vote. Neither half of that works quantumly: an unknown state cannot be copied, and reading the copies to vote would collapse them. Quantum error correction gets around both by encoding a single logical qubit into an entangled state of many physical qubits, then measuring only carefully chosen joint properties - the syndrome - which reveal what error occurred without revealing anything about the encoded state.",
      "The threshold theorem makes the programme viable: provided the physical error rate is below some threshold, adding more physical qubits per logical qubit suppresses the logical error rate exponentially. Below the threshold, scaling helps; above it, scaling makes things worse. The cost is severe - estimates run to a thousand or more physical qubits per logical one - which is why a processor with a few hundred physical qubits is not a machine with a few hundred usable ones.",
    ],
    corrects:
      "Error correction is often assumed to be a software layer that can be added later. It sets the hardware requirement: the physical error rate has to be under the threshold before adding qubits helps at all, and the qubit overhead is three orders of magnitude.",
    leadsTo: ["fault-tolerance"],
    cites: [
      "shor-code-1995",
      "steane-1996",
      "google-surface-code-2023",
      "nielsen-chuang",
    ],
  },
  {
    slug: "measurement",
    index: "08",
    name: "Measurement",
    definition:
      "The irreversible step that converts amplitudes into one classical outcome, with probability given by their squared magnitudes.",
    body: [
      "Measurement is the only non-unitary operation in the model. Measuring a qubit in the computational basis returns 0 or 1, with probabilities equal to the squared magnitudes of the two amplitudes, and leaves the qubit in the state that matches the outcome. Everything else about the prior state is destroyed.",
      "This is the Born rule, and it is why quantum algorithms are designed backwards from their final measurement. A single run yields a single sample from a distribution, so extracting an answer means either engineering that distribution until the right answer is overwhelmingly likely, or running the circuit many times and doing statistics. The basis is a choice, too: the same state measured along a different axis yields a different distribution, which is precisely what key distribution and Bell tests exploit.",
    ],
    corrects:
      'Measurement is often described as "the observer collapsing the state", implying that consciousness is involved. Any sufficiently strong interaction with the environment does it; a detector, a stray photon and a physicist are on the same footing.',
    leadsTo: ["qubit", "entanglement"],
    cites: ["nielsen-chuang", "ibm-learning", "bb84"],
  },
];

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((concept) => concept.slug === slug);
}

/** The six shown on the landing strip. */
export const LANDING_CONCEPTS = CONCEPTS.slice(0, 6);
