/**
 * Product-level constants. Anything that appears in more than one place
 * in the chrome - the product name, the navigation manifest, the legal
 * attribution - is declared here once.
 */

export const SITE = {
  name: 'AIQuantumOS',
  /** Used in <title> templates and structured data. */
  tagline: 'A living knowledge operating system for quantum computing',
  description:
    'AIQuantumOS is a continuously updated reference for quantum computing: first-principles foundations, algorithm explainers, a mapped global and Indian ecosystem, and an ingestion pipeline that tracks research and policy as it is published.',
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://aiquantumos.com',
  locale: 'en_IN',
  builder: {
    name: 'Cybokrafts Universal Innovations Pvt. Ltd.',
    short: 'Cybokrafts Universal Innovations',
    recognition: 'DPIIT-recognised startup',
    incubation: 'Incubated at IIT Indore',
  },
} as const;

export type NavItem = {
  href: string;
  label: string;
  /** Short monospaced descriptor shown beneath the label in the drawer. */
  descriptor: string;
  /** Faux map coordinate; purely a motif, rendered in the nav gutter. */
  coordinate: string;
};

/**
 * The route manifest. Ordered as a reader would traverse the material:
 * principles, then applications, then the field, then the live feed.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: '/foundations',
    label: 'Foundations',
    descriptor: 'Qubits, superposition, entanglement, error correction',
    coordinate: '01',
  },
  {
    href: '/algorithms',
    label: 'Algorithms',
    descriptor: 'Shor, Grover, VQE, QAOA, quantum machine learning',
    coordinate: '02',
  },
  {
    href: '/ecosystem',
    label: 'Ecosystem',
    descriptor: 'Hardware programmes and their modalities, worldwide',
    coordinate: '03',
  },
  {
    href: '/india',
    label: 'India',
    descriptor: 'National Quantum Mission, institutions, industry',
    coordinate: '04',
  },
  {
    href: '/updates',
    label: 'Updates',
    descriptor: 'Ingested research, policy and industry signal',
    coordinate: '05',
  },
  {
    href: '/timeline',
    label: 'Timeline',
    descriptor: 'From Feynman 1981 to the present day',
    coordinate: '06',
  },
  {
    href: '/glossary',
    label: 'Glossary',
    descriptor: 'Searchable A to Z of terminology',
    coordinate: '07',
  },
  {
    href: '/about',
    label: 'About',
    descriptor: 'What this is, who maintains it, how it is sourced',
    coordinate: '08',
  },
] as const;
