import type { ReferenceKey } from './references';

/**
 * The Indian quantum ecosystem.
 *
 * Structured the way the programme itself is structured: a national
 * mission with four thematic hubs, the institutions carrying the
 * research, and the companies commercialising it. Figures are given only
 * where they come from a primary government source.
 */

export type IndiaNode = {
  slug: string;
  name: string;
  kind: 'hub' | 'institution' | 'company' | 'agency';
  city: string;
  lat: number;
  lon: number;
  /** One line for the map card. */
  summary: string;
  /** Two or three sentences for the plate. */
  detail: string;
  focus: readonly string[];
  homepage?: string;
  cites?: readonly ReferenceKey[];
};

export const MISSION = {
  name: 'National Quantum Mission',
  approved: 'April 2023',
  outlay: '6,003.65 crore rupees',
  period: '2023 to 2031',
  department: 'Department of Science and Technology',
  summary:
    'A national mission approved by the Union Cabinet to build quantum computing, communication, sensing and materials capability in India, organised around four thematic hubs at existing research institutions rather than a single new laboratory.',
  objectives: [
    'Intermediate-scale quantum computers in the superconducting and photonic platforms over the mission period',
    'Satellite-based secure quantum communication over long distances, and inter-city terrestrial links',
    'Quantum sensors and metrology for precision measurement, navigation and healthcare',
    'Quantum materials and device fabrication, including superconductors and single-photon sources',
  ],
  cites: ['nqm-cabinet', 'nqm-dst'] as const,
};

export const INDIA_NODES: readonly IndiaNode[] = [
  {
    slug: 'iisc-bengaluru',
    name: 'Indian Institute of Science',
    kind: 'hub',
    city: 'Bengaluru',
    lat: 13.02,
    lon: 77.57,
    summary: 'Thematic hub for quantum computing under the National Quantum Mission.',
    detail:
      'IISc leads the mission\'s quantum computing hub, coordinating work across participating institutions on superconducting and other platforms. It also hosts long-running research in quantum optics, spin systems and quantum information theory that predates the mission by decades.',
    focus: ['Quantum computing', 'Superconducting qubits', 'Quantum optics'],
    homepage: 'https://iisc.ac.in/',
    cites: ['nqm-dst'],
  },
  {
    slug: 'iit-madras',
    name: 'Indian Institute of Technology Madras',
    kind: 'hub',
    city: 'Chennai',
    lat: 12.99,
    lon: 80.24,
    summary: 'Thematic hub for quantum communication.',
    detail:
      'IIT Madras leads the quantum communication hub, covering terrestrial fibre links, free-space and satellite quantum key distribution, and quantum network protocols. The institute has worked with the Centre for Development of Telematics on inter-city secure link demonstrations.',
    focus: ['Quantum key distribution', 'Quantum networks', 'Satellite links'],
    homepage: 'https://www.iitm.ac.in/',
    cites: ['nqm-dst'],
  },
  {
    slug: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    kind: 'hub',
    city: 'Mumbai',
    lat: 19.13,
    lon: 72.92,
    summary: 'Thematic hub for quantum sensing and metrology.',
    detail:
      'IIT Bombay leads work on quantum sensors and metrology - magnetometry, gravimetry, atomic clocks and precision navigation. Sensing is the part of the mission closest to deployment, since useful quantum sensors do not require error correction or large qubit counts.',
    focus: ['Quantum sensing', 'Metrology', 'Atomic clocks'],
    homepage: 'https://www.iitb.ac.in/',
    cites: ['nqm-dst'],
  },
  {
    slug: 'iit-delhi',
    name: 'Indian Institute of Technology Delhi',
    kind: 'hub',
    city: 'New Delhi',
    lat: 28.55,
    lon: 77.19,
    summary: 'Thematic hub for quantum materials and devices.',
    detail:
      'IIT Delhi leads the materials and devices hub, covering superconducting films, topological materials, single-photon sources and detectors, and the fabrication capability the other three hubs depend on. Without domestic device fabrication the rest of the mission imports its hardware.',
    focus: ['Quantum materials', 'Device fabrication', 'Single-photon sources'],
    homepage: 'https://home.iitd.ac.in/',
    cites: ['nqm-dst'],
  },
  {
    slug: 'raman-research-institute',
    name: 'Raman Research Institute',
    kind: 'institution',
    city: 'Bengaluru',
    lat: 13.01,
    lon: 77.58,
    summary: 'Quantum information and computing laboratory, with work on free-space QKD.',
    detail:
      'RRI runs the Quantum Information and Computing laboratory and has demonstrated free-space quantum key distribution over practical distances, work carried out with ISRO. It is one of the longest-established experimental quantum optics groups in the country.',
    focus: ['Free-space QKD', 'Quantum optics', 'Entanglement experiments'],
    homepage: 'https://www.rri.res.in/',
  },
  {
    slug: 'tifr',
    name: 'Tata Institute of Fundamental Research',
    kind: 'institution',
    city: 'Mumbai',
    lat: 18.9,
    lon: 72.81,
    summary: 'Superconducting circuit and quantum measurement research.',
    detail:
      'TIFR operates superconducting qubit laboratories and works on quantum measurement, circuit quantum electrodynamics and low-temperature physics. Its Quantum Measurement and Control laboratory has produced several of the country\'s working superconducting devices.',
    focus: ['Superconducting circuits', 'Quantum measurement', 'Circuit QED'],
    homepage: 'https://www.tifr.res.in/',
  },
  {
    slug: 'cdac',
    name: 'Centre for Development of Advanced Computing',
    kind: 'agency',
    city: 'Pune',
    lat: 18.52,
    lon: 73.86,
    summary: 'National computing agency, bridging quantum research and deployed infrastructure.',
    detail:
      'C-DAC builds and operates India\'s high-performance computing infrastructure and has extended that role into quantum simulation and quantum-classical hybrid access. Its involvement matters because it is the organisation that turns research results into services other institutions can actually use.',
    focus: ['Quantum simulation', 'HPC integration', 'National infrastructure'],
    homepage: 'https://www.cdac.in/',
  },
  {
    slug: 'qnu-labs',
    name: 'QNu Labs',
    kind: 'company',
    city: 'Bengaluru',
    lat: 12.97,
    lon: 77.59,
    summary: 'Quantum key distribution and quantum-safe security products.',
    detail:
      'QNu Labs builds quantum random number generators and quantum key distribution systems, and works on migration to post-quantum cryptography for Indian enterprise and defence customers. It is among the earliest Indian quantum companies to ship hardware rather than services.',
    focus: ['Quantum key distribution', 'Quantum random numbers', 'Post-quantum migration'],
    homepage: 'https://qnulabs.com/',
  },
  {
    slug: 'qpiai',
    name: 'QpiAI',
    kind: 'company',
    city: 'Bengaluru',
    lat: 12.95,
    lon: 77.64,
    summary: 'Full-stack quantum computing and AI systems.',
    detail:
      'QpiAI works across quantum hardware, control electronics and machine learning tooling, and has announced superconducting quantum computers developed in India. Its position is unusual among Indian companies in spanning hardware and software rather than specialising in one.',
    focus: ['Superconducting hardware', 'Quantum machine learning', 'Control systems'],
    homepage: 'https://www.qpiai.tech/',
  },
  {
    slug: 'bosonq-psi',
    name: 'BosonQ Psi',
    kind: 'company',
    city: 'Bhilai',
    lat: 21.19,
    lon: 81.38,
    summary: 'Quantum-accelerated engineering simulation software.',
    detail:
      'BosonQ Psi develops simulation software that uses quantum and quantum-inspired methods for structural, thermal and fluid analysis. It targets the engineering simulation market rather than quantum research, which places it among the few Indian companies selling to industrial end users.',
    focus: ['Engineering simulation', 'Optimisation', 'Quantum-inspired methods'],
    homepage: 'https://bosonqpsi.com/',
  },
  {
    slug: 'drdo',
    name: 'Defence Research and Development Organisation',
    kind: 'agency',
    city: 'New Delhi',
    lat: 28.6,
    lon: 77.21,
    summary: 'Defence quantum communication and sensing programmes.',
    detail:
      'DRDO has run quantum key distribution demonstrations between defence establishments and works on quantum sensing for navigation and detection. Defence requirements have driven a substantial share of India\'s early quantum communication deployment.',
    focus: ['Secure communication', 'Quantum sensing', 'Navigation'],
    homepage: 'https://www.drdo.gov.in/',
  },
  {
    slug: 'isro',
    name: 'Indian Space Research Organisation',
    kind: 'agency',
    city: 'Bengaluru',
    lat: 13.03,
    lon: 77.52,
    summary: 'Satellite-based quantum communication research.',
    detail:
      'ISRO has demonstrated free-space quantum communication over line-of-sight links and is the natural partner for the mission\'s satellite quantum key distribution objective. Satellite QKD is the only practical route to secure quantum links across continental distances, because fibre loss makes long terrestrial links impossible without trusted relays.',
    focus: ['Satellite QKD', 'Free-space links', 'Ground stations'],
    homepage: 'https://www.isro.gov.in/',
  },
];

export const HUBS = INDIA_NODES.filter((node) => node.kind === 'hub');
export const INDIA_COMPANIES = INDIA_NODES.filter((node) => node.kind === 'company');

export const NODE_KIND_LABELS: Record<IndiaNode['kind'], string> = {
  hub: 'Mission hub',
  institution: 'Research institution',
  company: 'Company',
  agency: 'Government agency',
};
