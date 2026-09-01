import type { ReferenceKey } from './references';

/**
 * The history of quantum computing as a sequence of load-bearing events.
 *
 * Selection rule: an entry is here because the field would have gone
 * differently without it. Product launches and qubit-count records are
 * included only where they changed what people believed was achievable,
 * which is why several well-publicised announcements are absent.
 */

export type Era = 'theory' | 'algorithms' | 'experiment' | 'engineering' | 'policy';

export type Milestone = {
  year: string;
  /** Month where the specific date matters to the ordering. */
  month?: string;
  title: string;
  /** Two or three sentences. What happened, and why it mattered. */
  body: string;
  era: Era;
  /** Institution or individuals responsible. */
  actor: string;
  cites?: readonly ReferenceKey[];
  /** Shown on the landing teaser. */
  featured?: boolean;
};

export const ERA_LABELS: Record<Era, string> = {
  theory: 'Theory',
  algorithms: 'Algorithms',
  experiment: 'Experiment',
  engineering: 'Engineering',
  policy: 'Policy',
};

export const MILESTONES: readonly Milestone[] = [
  {
    year: '1980',
    title: 'A quantum mechanical model of computation',
    body: 'Paul Benioff describes a quantum mechanical model of a Turing machine, establishing that computation could in principle be carried out by a quantum system without violating thermodynamics. It is the first serious statement that the two subjects belong in the same sentence.',
    era: 'theory',
    actor: 'Paul Benioff',
  },
  {
    year: '1981',
    title: 'Feynman poses the problem',
    body: 'At the Physics of Computation conference at MIT, Richard Feynman observes that simulating quantum systems on classical computers appears to cost exponentially more as the system grows, and proposes building computers that are themselves quantum. The argument is published the following year.',
    era: 'theory',
    actor: 'Richard Feynman',
    cites: ['feynman-1982'],
    featured: true,
  },
  {
    year: '1984',
    title: 'BB84 and quantum key distribution',
    body: 'Charles Bennett and Gilles Brassard describe a key distribution protocol whose security rests on physics rather than on computational hardness. It becomes the first quantum information technology to reach commercial deployment, decades ahead of quantum computing itself.',
    era: 'theory',
    actor: 'Bennett and Brassard',
    cites: ['bb84'],
  },
  {
    year: '1985',
    title: 'The universal quantum computer',
    body: 'David Deutsch formalises the quantum Turing machine and shows that a universal quantum computer exists. The paper turns Feynman\'s proposal into a model of computation with a definition, and asks for the first time whether it is strictly more powerful than the classical one.',
    era: 'theory',
    actor: 'David Deutsch',
    cites: ['deutsch-1985'],
  },
  {
    year: '1994',
    title: 'Shor\'s factoring algorithm',
    body: 'Peter Shor gives a quantum algorithm that factors integers in polynomial time, breaking the assumption underlying RSA. The field acquires a concrete, consequential target overnight, and quantum computing stops being a curiosity for physicists and becomes a concern for cryptographers and governments.',
    era: 'algorithms',
    actor: 'Peter Shor',
    cites: ['shor-1997'],
    featured: true,
  },
  {
    year: '1995',
    title: 'Error correction becomes possible',
    body: 'Shor publishes a nine-qubit code showing that quantum information can be protected without being read, and Andrew Steane follows with a seven-qubit code in 1996. Before this it was widely believed that decoherence made large-scale quantum computation impossible in principle.',
    era: 'theory',
    actor: 'Shor, Steane',
    cites: ['shor-code-1995', 'steane-1996'],
  },
  {
    year: '1996',
    title: 'Grover search',
    body: 'Lov Grover gives a quantum algorithm that searches an unstructured space of N items in about the square root of N steps. The speed-up is quadratic rather than exponential, but it applies to an enormous class of problems, and the technique - amplitude amplification - recurs throughout the field.',
    era: 'algorithms',
    actor: 'Lov Grover',
    cites: ['grover-1996'],
  },
  {
    year: '1998',
    title: 'First working qubits',
    body: 'Nuclear magnetic resonance experiments demonstrate two- and three-qubit quantum computations in liquid solution. The approach does not scale, but it is the first time the gate model runs on real physical hardware rather than on paper.',
    era: 'experiment',
    actor: 'IBM, Oxford, Berkeley, MIT',
  },
  {
    year: '2001',
    title: 'Shor\'s algorithm runs',
    body: 'A seven-qubit NMR machine at IBM Almaden factors 15 into 3 and 5. The result is a demonstration rather than a computation - the answer was known in advance and the technique cannot scale - but it closes the loop from algorithm to hardware for the first time.',
    era: 'experiment',
    actor: 'IBM Almaden and Stanford',
  },
  {
    year: '2007',
    title: 'The transmon',
    body: 'A superconducting qubit design at Yale dramatically reduces sensitivity to charge noise, extending coherence times by orders of magnitude. The transmon becomes the basis of the superconducting programmes at IBM, Google and Rigetti, and remains the most widely deployed qubit modality.',
    era: 'engineering',
    actor: 'Yale University',
  },
  {
    year: '2011',
    title: 'The first commercial quantum machine',
    body: 'D-Wave ships D-Wave One, a 128-qubit quantum annealer. It is not a gate-model computer and cannot run Shor or Grover, and the extent of its advantage is debated for years, but it is the first time an organisation can buy quantum hardware.',
    era: 'engineering',
    actor: 'D-Wave Systems',
    cites: ['dwave-annealing'],
  },
  {
    year: '2016',
    title: 'Quantum hardware reaches the cloud',
    body: 'IBM puts a five-qubit processor on the public internet through the IBM Quantum Experience. Access stops requiring a laboratory affiliation, and a generation of researchers, students and developers runs its first circuit on real hardware.',
    era: 'engineering',
    actor: 'IBM',
    cites: ['ibm-learning'],
    featured: true,
  },
  {
    year: '2018',
    title: 'The NISQ era is named',
    body: 'John Preskill characterises the coming decade of noisy, intermediate-scale quantum devices: fifty to a few hundred qubits, no error correction, and an open question about what such machines are actually good for. The framing sets the research agenda for the following years.',
    era: 'theory',
    actor: 'John Preskill',
    cites: ['preskill-nisq'],
  },
  {
    year: '2019',
    month: 'October',
    title: 'A sampling task beyond classical reach',
    body: 'Google reports that its 53-qubit Sycamore processor completed a random circuit sampling task in about 200 seconds that it estimated would take a leading supercomputer far longer. The specific classical estimate is contested and later improved on, but the experiment establishes that engineered quantum devices had reached a regime classical simulation struggles with.',
    era: 'experiment',
    actor: 'Google Quantum AI',
    cites: ['google-supremacy-2019'],
    featured: true,
  },
  {
    year: '2020',
    title: 'Photonic sampling and a second modality',
    body: 'A Chinese team reports Gaussian boson sampling with photons, and trapped-ion and neutral-atom machines reach commercial availability through cloud providers. The field stops being a single-technology bet: superconducting circuits, trapped ions, photons and neutral atoms are all viable, with different failure modes.',
    era: 'experiment',
    actor: 'USTC, IonQ, Quantinuum',
    cites: ['aws-braket-docs'],
  },
  {
    year: '2022',
    title: 'Error correction crosses into the useful regime',
    body: 'Google reports that increasing the size of a surface code logical qubit reduced its logical error rate, the first experimental sign of the scaling behaviour the threshold theorem predicts. Published in Nature the following year, it converts the central assumption of fault tolerance from theory into measurement.',
    era: 'experiment',
    actor: 'Google Quantum AI',
    cites: ['google-surface-code-2023'],
    featured: true,
  },
  {
    year: '2023',
    month: 'April',
    title: 'India approves the National Quantum Mission',
    body: 'The Union Cabinet approves a mission with an outlay of 6,003.65 crore rupees running to 2031, targeting intermediate-scale quantum computers, satellite and terrestrial quantum communication, sensing and materials. It places India among the small group of countries with a funded, coordinated national quantum programme.',
    era: 'policy',
    actor: 'Government of India',
    cites: ['nqm-cabinet', 'nqm-dst'],
    featured: true,
  },
  {
    year: '2024',
    title: 'Post-quantum cryptography is standardised',
    body: 'NIST publishes its first post-quantum cryptographic standards after an eight-year public competition. The migration of the world\'s deployed cryptography begins before a machine capable of breaking the old schemes exists, on the reasoning that data captured today can be decrypted later.',
    era: 'policy',
    actor: 'NIST',
    cites: ['nist-pqc'],
  },
  {
    year: '2024',
    month: 'December',
    title: 'Below-threshold error correction',
    body: 'Google reports a surface code logical qubit whose error rate falls as the code grows, sustained below the fault-tolerance threshold. The result is the clearest evidence to date that the scaling argument underpinning the whole fault-tolerant programme holds in real hardware.',
    era: 'experiment',
    actor: 'Google Quantum AI',
    cites: ['google-surface-code-2023'],
  },
  {
    year: '2025',
    title: 'Logical qubits become the unit of progress',
    body: 'Roadmaps across the industry shift from advertising physical qubit counts to reporting logical qubits and error rates, and vendors begin publishing dated fault-tolerance targets. The change of unit is itself the milestone: it marks the point at which the field agreed on what it is actually building.',
    era: 'engineering',
    actor: 'IBM, Quantinuum, Google and others',
    cites: ['ibm-roadmap', 'quantinuum-h-series'],
  },
];

export const FEATURED_MILESTONES = MILESTONES.filter((m) => m.featured);

/** Milestones grouped by decade, for the timeline plate's rails. */
export function byDecade(): Array<{ decade: string; items: Milestone[] }> {
  const groups = new Map<string, Milestone[]>();

  for (const milestone of MILESTONES) {
    const decade = `${milestone.year.slice(0, 3)}0s`;
    const existing = groups.get(decade);
    if (existing) existing.push(milestone);
    else groups.set(decade, [milestone]);
  }

  return [...groups.entries()].map(([decade, items]) => ({ decade, items }));
}
