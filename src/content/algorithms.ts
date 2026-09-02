import type { ReferenceKey } from './references';

/**
 * The algorithms.
 *
 * Each entry states what the algorithm actually does, what the speed-up
 * genuinely is, and - the field's most-skipped question - what has to be
 * true of the hardware before it is worth running. An explainer that
 * gives the asymptotics and omits the resource requirement is how people
 * end up believing a laptop-sized machine is about to break RSA.
 */

export type Complexity = {
  /** Best known classical cost, informally stated. */
  classical: string;
  /** Quantum cost. */
  quantum: string;
  /** Exponential, quadratic, polynomial, or heuristic. */
  kind: 'exponential' | 'quadratic' | 'polynomial' | 'heuristic';
};

export type Algorithm = {
  slug: string;
  index: string;
  name: string;
  /** One line for cards. */
  tagline: string;
  /** What problem it solves, stated without metaphor. */
  problem: string;
  /** How it works, two or three paragraphs. */
  mechanism: readonly string[];
  complexity: Complexity;
  /** What it is actually good for. */
  relevance: string;
  /** What has to be true of the hardware first. */
  requirement: string;
  /** A circuit from the circuit registry, if one illustrates it. */
  circuitId?: string;
  cites: readonly ReferenceKey[];
};

export const ALGORITHMS: readonly Algorithm[] = [
  {
    slug: 'shor',
    index: '01',
    name: "Shor's algorithm",
    tagline: 'Factors integers in polynomial time, which breaks RSA.',
    problem:
      'Given a large composite integer, find its prime factors. The presumed classical hardness of this problem is what RSA public-key cryptography rests on, and the same structure underlies the discrete logarithm problem behind Diffie-Hellman and elliptic curve cryptography.',
    mechanism: [
      'Factoring is reduced to period finding. If you can find the period of the function f(x) = a^x mod N for a randomly chosen a, then with good probability that period yields a non-trivial factor of N by elementary number theory. The reduction is entirely classical; no quantum mechanics is involved in it.',
      'The quantum part is finding the period. The algorithm prepares a superposition over inputs, evaluates the modular exponential into a second register, and then applies an inverse quantum Fourier transform to the first. Interference concentrates the amplitude onto values related to the period, and a measurement plus a continued-fraction expansion recovers it.',
      'What makes this exponentially fast is not that the superposition tries every exponent. It is that the Fourier transform converts a periodicity spread across 2^n amplitudes into a small number of measurement outcomes, and the transform itself costs only about n^2 gates.',
    ],
    complexity: {
      classical:
        'Sub-exponential: the general number field sieve, roughly exp(n^(1/3)) for an n-bit number',
      quantum: 'Polynomial: about n^2 log n log log n gate operations',
      kind: 'exponential',
    },
    relevance:
      'This is the result that made governments fund quantum computing. It is also why post-quantum cryptography standardisation began well before a machine capable of running it existed: encrypted traffic captured today can be stored and decrypted later, so the migration has to precede the threat.',
    requirement:
      'Breaking 2048-bit RSA requires several thousand logical qubits running billions of gate operations, with essentially no errors. At plausible surface-code overheads that means millions of physical qubits. No machine within an order of magnitude of that exists, and the honest estimate for when one might is a range, not a date.',
    circuitId: 'qpe-3',
    cites: ['shor-1997', 'nist-pqc', 'nielsen-chuang'],
  },
  {
    slug: 'grover',
    index: '02',
    name: "Grover's algorithm",
    tagline: 'Searches an unstructured space in the square root of the time.',
    problem:
      'Given a function that recognises a correct answer but offers no structure to exploit, find an input it accepts. This is the abstraction behind brute-force search: password cracking, constraint satisfaction, and any problem where checking is easy and finding is not.',
    mechanism: [
      'The register starts in an equal superposition over all N candidates, so every one carries amplitude 1 over the square root of N. An oracle flips the sign of the amplitude on the marked item - it does not identify it, it only marks it - and then a diffusion operator reflects every amplitude about their mean.',
      'The pair of reflections is a rotation in a two-dimensional plane spanned by the marked state and everything else. Each iteration rotates the state a little further towards the marked item. After about the square root of N iterations the amplitude on the answer is near one, and a measurement returns it.',
      'Iterating too many times is a real failure mode: the rotation continues past the target and the success probability falls again. The number of iterations must be chosen, not maximised, which is a genuinely counter-intuitive property for anyone used to classical search.',
    ],
    complexity: {
      classical: 'N/2 evaluations on average for an unstructured space of size N',
      quantum: 'About the square root of N evaluations, and this is provably optimal',
      kind: 'quadratic',
    },
    relevance:
      'A quadratic speed-up is modest next to an exponential one, but it applies extremely broadly, and amplitude amplification - the technique underneath it - reappears throughout quantum algorithm design. Its most cited practical consequence is that symmetric key lengths should double to retain their security margin.',
    requirement:
      'The quadratic gain is eaten by constant factors and error correction overhead on any near-term machine. Grover becomes worthwhile only on fault-tolerant hardware, and only for problems large enough that the square root actually matters.',
    circuitId: 'grover-2',
    cites: ['grover-1996', 'nielsen-chuang'],
  },
  {
    slug: 'vqe',
    index: '03',
    name: 'Variational quantum eigensolver',
    tagline:
      'Finds ground-state energies by letting a classical optimiser drive a shallow quantum circuit.',
    problem:
      'Find the lowest eigenvalue of a Hamiltonian - physically, the ground-state energy of a molecule or material. This is the calculation at the centre of computational chemistry, and it is exactly the problem Feynman had in mind when he proposed quantum computers.',
    mechanism: [
      'A parameterised circuit - the ansatz - prepares a trial state. The quantum device measures the expectation value of the Hamiltonian in that state, which the variational principle guarantees is an upper bound on the true ground-state energy. A classical optimiser adjusts the parameters and the loop repeats.',
      'The weaknesses are equally structural. Choosing an ansatz expressive enough to contain the ground state but shallow enough to run is unsolved in general; the number of measurements needed to estimate an energy to chemical accuracy is very large; and the optimisation landscape suffers from barren plateaus where gradients vanish exponentially with system size.',
    ],
    complexity: {
      classical:
        'Exact diagonalisation scales exponentially with system size; approximate methods trade accuracy for cost',
      quantum:
        'Circuit depth is shallow, but the measurement count and optimisation cost are both substantial and problem-dependent',
      kind: 'heuristic',
    },
    relevance:
      'VQE is the flagship of the noisy intermediate-scale era: it runs on machines that exist today. Whether it beats the best classical methods on a problem anyone cares about remains genuinely open, and claims in either direction should be read carefully.',
    requirement:
      'Runs on current hardware, which is precisely why it is studied. What it needs is not more qubits but better gate fidelity and far cheaper measurement, plus a resolution to the barren plateau problem for anything beyond small molecules.',
    cites: ['pennylane-vqe', 'preskill-nisq', 'feynman-1982'],
  },
  {
    slug: 'qaoa',
    index: '04',
    name: 'Quantum approximate optimisation algorithm',
    tagline:
      'Alternates two Hamiltonians to search for good solutions to combinatorial problems.',
    problem:
      'Find a good - not necessarily optimal - solution to a combinatorial optimisation problem such as MaxCut, portfolio selection or scheduling. These problems are NP-hard in general, and approximate answers are what practice actually wants.',
    mechanism: [
      'The cost function is encoded as a Hamiltonian whose ground state is the optimal solution. QAOA alternates two operations p times: evolution under the cost Hamiltonian, which imprints phases proportional to solution quality, and evolution under a mixing Hamiltonian, which converts those phases into amplitude differences.',
      'The 2p angles are tuned by a classical optimiser, exactly as in VQE. As p increases the circuit approaches adiabatic evolution and the solution quality improves; as p increases the circuit also gets deeper and the noise gets worse. Where those curves cross is the whole practical question.',
      'At p = 1 the algorithm has provable approximation guarantees for some problems, and those guarantees are not better than the best classical approximation algorithms. Establishing an advantage at larger p is an open problem, not a settled result.',
    ],
    complexity: {
      classical:
        'Strong approximation algorithms and heuristics exist and are extremely well tuned',
      quantum:
        'Circuit depth grows linearly in p; solution quality as a function of p is not established analytically for most problems',
      kind: 'heuristic',
    },
    relevance:
      'QAOA is the most-studied route to near-term advantage in optimisation, and the most contested. Every claimed demonstration has to be measured against a properly tuned classical baseline, which is a bar a good deal of published work does not clear.',
    requirement:
      'Runs today at small p. Meaningful depth requires far better two-qubit gate fidelity, and any credible advantage claim requires the classical comparison to be done seriously.',
    cites: ['qaoa-2014', 'preskill-nisq'],
  },
  {
    slug: 'quantum-machine-learning',
    index: '05',
    name: 'Quantum machine learning',
    tagline:
      'A family of proposals for using quantum circuits as models or as kernels.',
    problem:
      'Learn a function from data using a quantum circuit somewhere in the pipeline - as a parameterised model, as a kernel that computes similarity in a large feature space, or as a subroutine for linear algebra.',
    mechanism: [
      'The most active line treats a parameterised quantum circuit as a model, trained by gradient descent much like a neural network. A second line uses the quantum device only to evaluate a kernel - the inner product between quantum feature vectors - and hands that to a classical support vector machine.',
      'The theoretical appeal is that a quantum circuit maps data into an exponentially large Hilbert space, and a kernel in that space might separate data that no efficiently computable classical kernel can. There are constructed problems where this provably holds.',
      'The obstacle is loading data. Getting a classical dataset into a quantum state can cost as much as the computation saves, which dissolves the advantage for exactly the applications people most want. And several early proposals that assumed cheap quantum memory were subsequently matched by classical algorithms once the same assumptions were granted classically.',
    ],
    complexity: {
      classical:
        'Highly optimised, hardware-accelerated, and improving rapidly - the moving baseline is itself part of the problem',
      quantum:
        'Advantage demonstrated on constructed problems; no established advantage on a natural dataset',
      kind: 'heuristic',
    },
    relevance:
      'The most speculative area in the field and the most over-claimed. It is worth studying because the theoretical questions are real; it is worth reading sceptically because the marketing runs far ahead of the results.',
    requirement:
      'Beyond hardware, the field needs an answer to data loading and a problem where the quantum feature map is the right inductive bias rather than an arbitrary one.',
    cites: ['preskill-nisq', 'pennylane-vqe', 'arxiv-quant-ph'],
  },
  {
    slug: 'quantum-simulation',
    index: '06',
    name: 'Quantum simulation',
    tagline:
      'Using a controllable quantum system to model one you cannot control.',
    problem:
      'Predict the behaviour of a quantum system - a molecule, a superconductor, a nuclear interaction - whose state space is too large to represent classically. This is the original application, and the one with the clearest theoretical footing.',
    mechanism: [
      'Digital simulation decomposes time evolution under a target Hamiltonian into a sequence of gates, typically by Trotterisation: splitting the evolution into small steps whose error is controlled and analysable. Given a fault-tolerant machine, this gives provable accuracy at known cost.',
      'Analogue simulation instead engineers a physical system whose natural Hamiltonian resembles the target. Neutral atom arrays and trapped ions are particularly suited to this, since their geometry and interactions can be tuned to match a lattice model directly. There is no gate decomposition and no universal programmability, but there is also far less overhead.',
      'Both approaches share the field\'s clearest argument for advantage: the classical cost of simulating a strongly correlated quantum system grows exponentially with size, and there is no reason to expect that to change.',
    ],
    complexity: {
      classical:
        'Exponential in the number of strongly correlated particles; tensor network methods push the boundary but do not remove it',
      quantum:
        'Polynomial in system size and simulated time for digital simulation on fault-tolerant hardware',
      kind: 'exponential',
    },
    relevance:
      'The application most likely to matter first, and the one with the least hype attached. Catalysis, battery chemistry, nitrogen fixation and high-temperature superconductivity are the commonly cited targets.',
    requirement:
      'Useful digital simulation of an industrially relevant molecule needs error correction. Analogue simulation of condensed matter models is already producing results that are hard to reproduce classically.',
    cites: ['feynman-1982', 'preskill-nisq', 'nielsen-chuang'],
  },
];

export function getAlgorithm(slug: string): Algorithm | undefined {
  return ALGORITHMS.find((algorithm) => algorithm.slug === slug);
}

export const COMPLEXITY_LABELS: Record<Complexity['kind'], string> = {
  exponential: 'Exponential speed-up',
  quadratic: 'Quadratic speed-up',
  polynomial: 'Polynomial speed-up',
  heuristic: 'Heuristic, unproven',
};
