import type { ReferenceKey } from './references';

/**
 * The global hardware and platform landscape.
 *
 * Organised by physical modality rather than by company size, because
 * modality is what actually determines a programme's constraints: what
 * its qubits are made of decides its coherence times, its connectivity,
 * its cooling requirements and its scaling path.
 *
 * Qubit counts are deliberately absent from the structured fields. They
 * change faster than this file can, they are measured differently by
 * different vendors, and quoting a stale one is worse than quoting none.
 * The Update Panel is where current numbers belong.
 */

export type Modality =
  | 'superconducting'
  | 'trapped-ion'
  | 'photonic'
  | 'neutral-atom'
  | 'annealing'
  | 'spin'
  | 'topological'
  | 'platform';

export type Player = {
  slug: string;
  name: string;
  modality: Modality;
  /** Headquarters, for the map. */
  location: string;
  country: string;
  /** Approximate coordinates, decimal degrees. */
  lat: number;
  lon: number;
  /** One sentence on what distinguishes this programme. */
  position: string;
  /** Two or three sentences of substance. */
  detail: string;
  homepage: string;
  cites?: readonly ReferenceKey[];
};

export const MODALITIES: Record<
  Modality,
  { label: string; principle: string; tradeoff: string }
> = {
  superconducting: {
    label: 'Superconducting',
    principle:
      'Microwave-driven circuits on a chip, cooled to around ten millikelvin so that superconducting current states behave as a two-level system.',
    tradeoff:
      'Fast gates and mature semiconductor fabrication, against short coherence times, dilution refrigerators, and connectivity limited to neighbours on the chip.',
  },
  'trapped-ion': {
    label: 'Trapped ion',
    principle:
      'Individual charged atoms held in electromagnetic traps and manipulated with lasers, using internal electronic states as the qubit.',
    tradeoff:
      'Exceptional coherence and all-to-all connectivity within a trap, against gate speeds orders of magnitude slower than superconducting circuits and hard questions about scaling beyond one trap.',
  },
  photonic: {
    label: 'Photonic',
    principle:
      'Quantum information encoded in properties of light and processed with interferometers, switches and detectors.',
    tradeoff:
      'Room-temperature operation and a natural fit with optical fibre for networking, against probabilistic gate operations and the difficulty of making photons interact at all.',
  },
  'neutral-atom': {
    label: 'Neutral atom',
    principle:
      'Neutral atoms held in optical tweezer arrays and entangled by exciting them into strongly interacting Rydberg states.',
    tradeoff:
      'Large arrays that are reconfigurable between runs and identical qubits by construction, against comparatively young control engineering.',
  },
  annealing: {
    label: 'Quantum annealing',
    principle:
      'A special-purpose machine that finds low-energy configurations of an Ising problem by slowly evolving a physical system into its ground state.',
    tradeoff:
      'Far more qubits than gate-model machines and a direct mapping for some optimisation problems, against being unable to run gate-model algorithms such as Shor or Grover at all.',
  },
  spin: {
    label: 'Silicon spin',
    principle:
      'Single electron or nuclear spins confined in silicon quantum dots, read and controlled electrically.',
    tradeoff:
      'The prospect of using existing semiconductor manufacturing at scale, against qubit counts that remain small compared to other modalities.',
  },
  topological: {
    label: 'Topological',
    principle:
      'Encoding information in non-local properties of engineered quasiparticles, so that local disturbances cannot corrupt it.',
    tradeoff:
      'Error protection built into the physics rather than added in software, against the fact that the required states are extraordinarily difficult to create and verify.',
  },
  platform: {
    label: 'Access platform',
    principle:
      'Cloud services that provide access to hardware built by others, together with compilers, simulators and job orchestration.',
    tradeoff:
      'Lets users compare modalities without capital expenditure, at the cost of a layer of abstraction between the programme and the machine.',
  },
};

export const PLAYERS: readonly Player[] = [
  {
    slug: 'ibm-quantum',
    name: 'IBM Quantum',
    modality: 'superconducting',
    location: 'Yorktown Heights, New York',
    country: 'United States',
    lat: 41.27,
    lon: -73.8,
    position:
      'The most public hardware roadmap in the field, and the widest deployed developer stack through Qiskit.',
    detail:
      'IBM has published dated processor targets years in advance and largely met them, which is unusual enough in this field to be a distinguishing feature in itself. Its more recent roadmaps are stated in terms of error-corrected logical qubits and quantum-centric supercomputing rather than physical qubit counts.',
    homepage: 'https://www.ibm.com/quantum',
    cites: ['ibm-roadmap'],
  },
  {
    slug: 'google-quantum-ai',
    name: 'Google Quantum AI',
    modality: 'superconducting',
    location: 'Santa Barbara, California',
    country: 'United States',
    lat: 34.42,
    lon: -119.7,
    position:
      'Concentrated on error correction, and the source of the field\'s two most consequential experimental results.',
    detail:
      'Google produced both the 2019 random circuit sampling experiment and the surface code results showing logical error rates falling as the code grows. Its programme is organised around reaching fault tolerance rather than around maximising qubit count.',
    homepage: 'https://quantumai.google/',
    cites: ['google-supremacy-2019', 'google-surface-code-2023'],
  },
  {
    slug: 'quantinuum',
    name: 'Quantinuum',
    modality: 'trapped-ion',
    location: 'Broomfield, Colorado',
    country: 'United States',
    lat: 39.92,
    lon: -105.09,
    position:
      'The highest gate fidelities publicly reported, on a trapped-ion architecture with all-to-all connectivity.',
    detail:
      'Formed from Honeywell Quantum Solutions and Cambridge Quantum, Quantinuum runs a quantum charge-coupled device architecture in which ions are physically shuttled between zones. Fewer qubits than the superconducting programmes, each considerably better behaved.',
    homepage: 'https://www.quantinuum.com/',
    cites: ['quantinuum-h-series'],
  },
  {
    slug: 'ionq',
    name: 'IonQ',
    modality: 'trapped-ion',
    location: 'College Park, Maryland',
    country: 'United States',
    lat: 38.99,
    lon: -76.94,
    position:
      'Trapped-ion systems delivered primarily through the major cloud platforms.',
    detail:
      'IonQ uses ytterbium ions in a linear trap with optical control, and was among the first quantum hardware companies to reach public markets. Its machines are available through Amazon Braket, Azure Quantum and Google Cloud, which has made it many developers\' first non-superconducting device.',
    homepage: 'https://ionq.com/',
    cites: ['aws-braket-docs'],
  },
  {
    slug: 'rigetti',
    name: 'Rigetti Computing',
    modality: 'superconducting',
    location: 'Berkeley, California',
    country: 'United States',
    lat: 37.87,
    lon: -122.27,
    position:
      'Vertically integrated superconducting hardware, including its own fabrication facility.',
    detail:
      'Rigetti operates Fab-1, its own dedicated quantum chip foundry, and has pursued multi-chip modules as a route past the reticle limits that constrain single-die processors. Smaller than the hyperscaler programmes and correspondingly more focused.',
    homepage: 'https://www.rigetti.com/',
  },
  {
    slug: 'psiquantum',
    name: 'PsiQuantum',
    modality: 'photonic',
    location: 'Palo Alto, California',
    country: 'United States',
    lat: 37.44,
    lon: -122.14,
    position:
      'Skipping the intermediate-scale era entirely in favour of a million-qubit photonic machine.',
    detail:
      'PsiQuantum has argued that only a fault-tolerant machine is worth building and is manufacturing photonic chips in a commercial semiconductor foundry rather than a laboratory. The strategy is unusually all-or-nothing: there is no small demonstration product along the way.',
    homepage: 'https://www.psiquantum.com/',
  },
  {
    slug: 'pasqal',
    name: 'Pasqal',
    modality: 'neutral-atom',
    location: 'Massy, France',
    country: 'France',
    lat: 48.73,
    lon: 2.28,
    position:
      'Neutral-atom processors, and the centre of gravity of European quantum hardware deployment.',
    detail:
      'Founded out of the Institut d\'Optique, Pasqal builds Rydberg atom arrays and has installed machines at European supercomputing centres. Neutral atoms give reconfigurable geometry between runs, which suits analogue simulation of condensed matter systems particularly well.',
    homepage: 'https://www.pasqal.com/',
  },
  {
    slug: 'quera',
    name: 'QuEra Computing',
    modality: 'neutral-atom',
    location: 'Boston, Massachusetts',
    country: 'United States',
    lat: 42.36,
    lon: -71.06,
    position:
      'Neutral-atom machines out of the Harvard and MIT groups, with early logical qubit demonstrations.',
    detail:
      'QuEra commercialises work from the Lukin and Greiner groups and has published results on error-corrected logical qubits in atom arrays. Its Aquila machine is available for analogue quantum simulation through Amazon Braket.',
    homepage: 'https://www.quera.com/',
  },
  {
    slug: 'dwave',
    name: 'D-Wave Quantum',
    modality: 'annealing',
    location: 'Burnaby, British Columbia',
    country: 'Canada',
    lat: 49.25,
    lon: -122.98,
    position:
      'The longest-running commercial quantum programme, built on annealing rather than the gate model.',
    detail:
      'D-Wave shipped hardware years before anyone else and has focused on optimisation workloads in logistics, scheduling and materials. Its annealers cannot run gate-model algorithms, a distinction that was widely blurred in early coverage and matters when comparing qubit counts.',
    homepage: 'https://www.dwavequantum.com/',
    cites: ['dwave-annealing'],
  },
  {
    slug: 'xanadu',
    name: 'Xanadu',
    modality: 'photonic',
    location: 'Toronto, Ontario',
    country: 'Canada',
    lat: 43.65,
    lon: -79.38,
    position:
      'Photonic hardware, and the maintainer of PennyLane, the most used differentiable quantum programming library.',
    detail:
      'Xanadu builds squeezed-light photonic processors operating at room temperature and reported a Gaussian boson sampling advantage experiment. Its software work has arguably had wider reach than its hardware, since PennyLane runs against most other vendors\' machines too.',
    homepage: 'https://www.xanadu.ai/',
    cites: ['pennylane-vqe'],
  },
  {
    slug: 'microsoft-quantum',
    name: 'Microsoft Quantum',
    modality: 'topological',
    location: 'Redmond, Washington',
    country: 'United States',
    lat: 47.67,
    lon: -122.12,
    position:
      'A long topological programme alongside Azure Quantum, which provides access to other vendors\' hardware.',
    detail:
      'Microsoft has pursued topological qubits for two decades on the argument that error protection built into the physics beats correcting errors in software. The bet remains unresolved and has attracted sustained scientific scrutiny; meanwhile Azure Quantum serves as a platform for machines Microsoft did not build.',
    homepage: 'https://azure.microsoft.com/en-us/products/quantum',
    cites: ['ms-azure-quantum-concepts'],
  },
  {
    slug: 'amazon-braket',
    name: 'Amazon Braket',
    modality: 'platform',
    location: 'Seattle, Washington',
    country: 'United States',
    lat: 47.61,
    lon: -122.33,
    position:
      'A neutral access layer across several hardware vendors and modalities.',
    detail:
      'Braket exposes superconducting, trapped-ion and neutral-atom machines through one interface, which makes it the most practical way to run the same circuit on genuinely different physics. AWS also runs its own hardware research through the AWS Center for Quantum Computing at Caltech.',
    homepage: 'https://aws.amazon.com/braket/',
    cites: ['aws-braket-docs'],
  },
  {
    slug: 'alice-bob',
    name: 'Alice and Bob',
    modality: 'superconducting',
    location: 'Paris, France',
    country: 'France',
    lat: 48.86,
    lon: 2.35,
    position:
      'Cat qubits, which suppress one error type in hardware so the code only has to correct the other.',
    detail:
      'The approach encodes a qubit in superpositions of coherent states of a superconducting resonator, where bit-flip errors are exponentially suppressed by design. If it holds, the error correction overhead falls substantially, because only phase flips need correcting.',
    homepage: 'https://alice-bob.com/',
  },
  {
    slug: 'quantum-brilliance',
    name: 'Quantum Brilliance',
    modality: 'spin',
    location: 'Canberra',
    country: 'Australia',
    lat: -35.28,
    lon: 149.13,
    position:
      'Diamond nitrogen-vacancy systems aimed at room-temperature accelerators rather than data-centre machines.',
    detail:
      'Nitrogen-vacancy centres in diamond hold spin coherence without cryogenics, which changes where a quantum processor can physically go. The company targets rack-mounted and eventually embedded accelerators rather than competing on qubit count.',
    homepage: 'https://quantumbrilliance.com/',
  },
  {
    slug: 'silicon-quantum-computing',
    name: 'Silicon Quantum Computing',
    modality: 'spin',
    location: 'Sydney',
    country: 'Australia',
    lat: -33.87,
    lon: 151.21,
    position:
      'Atom-precision silicon devices built by placing individual phosphorus atoms.',
    detail:
      'Out of Michelle Simmons\' group at UNSW, SQC fabricates devices by positioning dopant atoms one at a time with a scanning tunnelling microscope. Extremely slow to build and extremely precise, with a path to conventional silicon manufacturing if the physics holds.',
    homepage: 'https://sqc.com.au/',
  },
  {
    slug: 'qutech',
    name: 'QuTech',
    modality: 'superconducting',
    location: 'Delft',
    country: 'Netherlands',
    lat: 52.01,
    lon: 4.36,
    position:
      'A public research institute working across superconducting, spin and network hardware.',
    detail:
      'A collaboration between TU Delft and TNO, QuTech has produced foundational work on spin qubits and on quantum networking, including multi-node entanglement over metropolitan distances. It also runs Quantum Inspire, a public access platform.',
    homepage: 'https://qutech.nl/',
  },
];

export function playersByModality(): Array<{
  modality: Modality;
  players: Player[];
}> {
  const order: Modality[] = [
    'superconducting',
    'trapped-ion',
    'neutral-atom',
    'photonic',
    'spin',
    'annealing',
    'topological',
    'platform',
  ];

  return order
    .map((modality) => ({
      modality,
      players: PLAYERS.filter((player) => player.modality === modality),
    }))
    .filter((group) => group.players.length > 0);
}

export function getPlayer(slug: string): Player | undefined {
  return PLAYERS.find((player) => player.slug === slug);
}
