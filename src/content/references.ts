import type { Reference } from '@/components/ui/ReferenceList';

/**
 * The shared reference pool.
 *
 * Content pages cite by key rather than by number, and the numbering is
 * assigned per page from the order of first use. That keeps a citation
 * stable when a paragraph moves, and stops two pages from disagreeing
 * about what "[3]" refers to.
 */

export type ReferenceKey =
  | 'feynman-1982'
  | 'deutsch-1985'
  | 'shor-1997'
  | 'grover-1996'
  | 'bb84'
  | 'nielsen-chuang'
  | 'ibm-learning'
  | 'ibm-roadmap'
  | 'ms-azure-quantum-concepts'
  | 'google-supremacy-2019'
  | 'google-surface-code-2023'
  | 'preskill-nisq'
  | 'arxiv-quant-ph'
  | 'nist-pqc'
  | 'nqm-cabinet'
  | 'nqm-dst'
  | 'aws-braket-docs'
  | 'quantinuum-h-series'
  | 'dwave-annealing'
  | 'pennylane-vqe'
  | 'qaoa-2014'
  | 'shor-code-1995'
  | 'steane-1996';

type Source = Omit<Reference, 'n'>;

export const REFERENCES: Record<ReferenceKey, Source> = {
  'feynman-1982': {
    source: 'International Journal of Theoretical Physics',
    title: 'Richard Feynman, Simulating Physics with Computers',
    href: 'https://link.springer.com/article/10.1007/BF02650179',
    year: '1982',
  },
  'deutsch-1985': {
    source: 'Proceedings of the Royal Society A',
    title:
      'David Deutsch, Quantum theory, the Church-Turing principle and the universal quantum computer',
    href: 'https://royalsocietypublishing.org/doi/10.1098/rspa.1985.0070',
    year: '1985',
  },
  'shor-1997': {
    source: 'SIAM Journal on Computing',
    title:
      'Peter Shor, Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer',
    href: 'https://epubs.siam.org/doi/10.1137/S0097539795293172',
    year: '1997',
  },
  'grover-1996': {
    source: 'arXiv',
    title: 'Lov Grover, A fast quantum mechanical algorithm for database search',
    href: 'https://arxiv.org/abs/quant-ph/9605043',
    year: '1996',
  },
  bb84: {
    source: 'Theoretical Computer Science',
    title:
      'Bennett and Brassard, Quantum cryptography: Public key distribution and coin tossing',
    href: 'https://www.sciencedirect.com/science/article/pii/S0304397514004241',
    year: '1984',
  },
  'nielsen-chuang': {
    source: 'Cambridge University Press',
    title: 'Nielsen and Chuang, Quantum Computation and Quantum Information',
    href: 'https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AEFFEA52D53BE9AE',
    year: '2010',
  },
  'ibm-learning': {
    source: 'IBM Quantum',
    title: 'IBM Quantum Learning, Basics of quantum information',
    href: 'https://learning.quantum.ibm.com/course/basics-of-quantum-information',
  },
  'ibm-roadmap': {
    source: 'IBM Quantum',
    title: 'IBM Quantum development roadmap',
    href: 'https://www.ibm.com/roadmaps/quantum/',
  },
  'ms-azure-quantum-concepts': {
    source: 'Microsoft Learn',
    title: 'Azure Quantum documentation, quantum computing concepts',
    href: 'https://learn.microsoft.com/en-us/azure/quantum/concepts-overview',
  },
  'google-supremacy-2019': {
    source: 'Nature',
    title: 'Arute et al., Quantum supremacy using a programmable superconducting processor',
    href: 'https://www.nature.com/articles/s41586-019-1666-5',
    year: '2019',
  },
  'google-surface-code-2023': {
    source: 'Nature',
    title:
      'Google Quantum AI, Suppressing quantum errors by scaling a surface code logical qubit',
    href: 'https://www.nature.com/articles/s41586-022-05434-1',
    year: '2023',
  },
  'preskill-nisq': {
    source: 'Quantum',
    title: 'John Preskill, Quantum Computing in the NISQ era and beyond',
    href: 'https://quantum-journal.org/papers/q-2018-08-06-79/',
    year: '2018',
  },
  'arxiv-quant-ph': {
    source: 'arXiv',
    title: 'Quantum Physics (quant-ph) recent submissions',
    href: 'https://arxiv.org/list/quant-ph/recent',
  },
  'nist-pqc': {
    source: 'NIST',
    title: 'Post-Quantum Cryptography standardisation project',
    href: 'https://csrc.nist.gov/projects/post-quantum-cryptography',
  },
  'nqm-cabinet': {
    source: 'Press Information Bureau',
    title: 'Cabinet approves National Quantum Mission',
    href: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1917888',
    year: '2023',
  },
  'nqm-dst': {
    source: 'Department of Science and Technology',
    title: 'National Quantum Mission',
    href: 'https://dst.gov.in/national-quantum-mission-nqm',
  },
  'aws-braket-docs': {
    source: 'Amazon Web Services',
    title: 'Amazon Braket documentation, supported devices',
    href: 'https://docs.aws.amazon.com/braket/latest/developerguide/braket-devices.html',
  },
  'quantinuum-h-series': {
    source: 'Quantinuum',
    title: 'H-Series trapped-ion quantum computers',
    href: 'https://www.quantinuum.com/products-solutions/quantum-computers',
  },
  'dwave-annealing': {
    source: 'D-Wave',
    title: 'What is quantum annealing?',
    href: 'https://docs.dwavequantum.com/en/latest/quantum_research/quantum_annealing_intro.html',
  },
  'pennylane-vqe': {
    source: 'PennyLane',
    title: 'A brief overview of the variational quantum eigensolver',
    href: 'https://pennylane.ai/qml/demos/tutorial_vqe',
  },
  'qaoa-2014': {
    source: 'arXiv',
    title: 'Farhi, Goldstone and Gutmann, A Quantum Approximate Optimization Algorithm',
    href: 'https://arxiv.org/abs/1411.4028',
    year: '2014',
  },
  'shor-code-1995': {
    source: 'Physical Review A',
    title: 'Peter Shor, Scheme for reducing decoherence in quantum computer memory',
    href: 'https://journals.aps.org/pra/abstract/10.1103/PhysRevA.52.R2493',
    year: '1995',
  },
  'steane-1996': {
    source: 'Physical Review Letters',
    title: 'Andrew Steane, Error Correcting Codes in Quantum Theory',
    href: 'https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.77.793',
    year: '1996',
  },
};

/**
 * Builds a page's numbered reference list from the keys it cites, in the
 * order given, and returns a lookup so the inline markers can find their
 * own number.
 */
export function buildReferences(keys: readonly ReferenceKey[]): {
  list: Reference[];
  numberOf: (key: ReferenceKey) => number;
} {
  const seen: ReferenceKey[] = [];
  for (const key of keys) {
    if (!seen.includes(key)) seen.push(key);
  }

  const list = seen.map((key, index) => ({ n: index + 1, ...REFERENCES[key] }));
  const numbers = new Map(seen.map((key, index) => [key, index + 1]));

  return {
    list,
    numberOf: (key) => numbers.get(key) ?? 0,
  };
}
