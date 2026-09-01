/**
 * Topic classification.
 *
 * Deliberately a keyword rule set rather than a model. The taxonomy has
 * seven classes, the vocabulary of the field is narrow and stable, and a
 * rule set is auditable: when an item lands in the wrong column, the
 * reason is a line you can read. The interface below is the seam an
 * LLM-backed classifier would slot into later without touching callers.
 */

export type Topic =
  | 'HARDWARE'
  | 'ALGORITHMS'
  | 'POLICY'
  | 'FUNDING'
  | 'RESEARCH_PAPER'
  | 'INDUSTRY'
  | 'EDUCATION';

type Rule = {
  topic: Topic;
  /** Higher wins when several rules match. */
  weight: number;
  terms: readonly string[];
};

/**
 * Rules are ordered by how specific their vocabulary is, not by how
 * common the topic is. "Series B" is a near-certain funding signal;
 * "quantum computer" is a near-useless one and appears nowhere below.
 */
const RULES: readonly Rule[] = [
  {
    topic: 'FUNDING',
    weight: 5,
    terms: [
      'series a',
      'series b',
      'series c',
      'seed round',
      'funding round',
      'raises',
      'raised',
      'investment',
      'investors',
      'valuation',
      'acquisition',
      'acquires',
      'ipo',
      'venture capital',
      'crore',
      'million in funding',
    ],
  },
  {
    topic: 'POLICY',
    weight: 5,
    terms: [
      'national quantum mission',
      'ministry',
      'government',
      'policy',
      'regulation',
      'legislation',
      'act of parliament',
      'cabinet',
      'department of science',
      'standardisation',
      'standardization',
      'nist',
      'export control',
      'roadmap announced by',
      'public sector',
      'budget allocation',
    ],
  },
  {
    topic: 'HARDWARE',
    weight: 4,
    terms: [
      'superconducting',
      'trapped ion',
      'trapped-ion',
      'neutral atom',
      'photonic',
      'annealing',
      'qubit count',
      'physical qubits',
      'logical qubit',
      'cryostat',
      'dilution refrigerator',
      'processor',
      'chip',
      'fabrication',
      'coherence time',
      'gate fidelity',
      'error correction',
      'surface code',
      'transmon',
      'topological qubit',
      'silicon spin',
    ],
  },
  {
    topic: 'ALGORITHMS',
    weight: 4,
    terms: [
      'algorithm',
      'shor',
      'grover',
      'variational',
      'vqe',
      'qaoa',
      'quantum machine learning',
      'ansatz',
      'circuit depth',
      'compilation',
      'transpiler',
      'simulation of molecules',
      'hamiltonian',
      'optimisation problem',
      'optimization problem',
      'quantum advantage',
      'quantum supremacy',
    ],
  },
  {
    topic: 'EDUCATION',
    weight: 3,
    terms: [
      'course',
      'curriculum',
      'textbook',
      'tutorial',
      'workshop',
      'summer school',
      'fellowship',
      'training programme',
      'training program',
      'hackathon',
      'certification',
    ],
  },
  {
    topic: 'INDUSTRY',
    weight: 2,
    terms: [
      'partnership',
      'collaboration',
      'customer',
      'deployment',
      'commercial',
      'contract',
      'availability',
      'general availability',
      'cloud access',
      'data centre',
      'data center',
      'appoints',
      'joint venture',
      'memorandum of understanding',
    ],
  },
];

/**
 * The quantum vocabulary. Used to decide whether an item from a general
 * technology feed belongs in the panel at all.
 */
const QUANTUM_TERMS: readonly string[] = [
  'quantum',
  'qubit',
  'qubits',
  'superposition',
  'entangle',
  'entangled',
  'entanglement',
  'decoherence',
  'qiskit',
  'pennylane',
  'cirq',
  'quantum key distribution',
  'post-quantum',
  'quantum-safe',
  'annealer',
  'quant-ph',
];

function haystack(title: string, summary: string): string {
  return `${title} ${summary}`.toLowerCase();
}

/**
 * True when an item plausibly concerns quantum computing. Applied only
 * to sources flagged as general-interest; a quantum-specific feed is
 * trusted on its own subject.
 */
export function isQuantumRelevant(title: string, summary: string): boolean {
  const text = haystack(title, summary);
  return QUANTUM_TERMS.some((term) => text.includes(term));
}

/**
 * Classifies an item. Research preprints are recognised structurally
 * from their source rather than by vocabulary, because a paper title
 * reads exactly like a hardware or algorithms headline.
 */
export function classify(
  title: string,
  summary: string,
  sourceSlug: string,
): Topic {
  if (sourceSlug === 'arxiv-quant-ph' || sourceSlug === 'npj-quantum-information') {
    return 'RESEARCH_PAPER';
  }

  const text = haystack(title, summary);

  let best: { topic: Topic; score: number } = { topic: 'INDUSTRY', score: 0 };

  for (const rule of RULES) {
    let hits = 0;
    for (const term of rule.terms) {
      if (text.includes(term)) hits += 1;
    }
    if (hits === 0) continue;

    // Weight dominates, hit count breaks ties within a weight class.
    const score = rule.weight * 10 + hits;
    if (score > best.score) {
      best = { topic: rule.topic, score };
    }
  }

  return best.topic;
}

/**
 * TODO: swap this module's implementation for an LLM-backed classifier.
 *
 * The seam is deliberate. A replacement needs to satisfy exactly this
 * signature, run inside the ingestion worker rather than at request time,
 * and fall back to the rules above when the model call fails or the
 * response does not parse into the Topic union. Nothing outside this
 * module needs to change.
 */
export type Classifier = (
  title: string,
  summary: string,
  sourceSlug: string,
) => Topic;

export const activeClassifier: Classifier = classify;
