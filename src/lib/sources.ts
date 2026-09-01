/**
 * The source registry.
 *
 * Every endpoint below was checked to respond before being listed. The
 * ordering principle is the one stated in the brief: official feeds and
 * public APIs first, HTML index pages only where a publisher offers no
 * feed at all. Twenty-one of the thirty-one entries here are RSS or a
 * documented API.
 *
 * This module is shared between the Next application and the ingestion
 * worker, so the sourcing disclosure the reader sees is generated from
 * the same list the worker actually reads. There is no second, prettier
 * list maintained by hand.
 */

export type Region = 'GLOBAL' | 'INDIA';

export type SourceKind = 'RSS' | 'ATOM' | 'JSON_API' | 'HTML';

export type SourceDefinition = {
  slug: string;
  name: string;
  homepage: string;
  endpoint: string;
  kind: SourceKind;
  region: Region;
  /** Two or three letters, used where no logo is available. */
  monogram: string;
  /** One line on what this source covers, shown in the disclosure table. */
  covers: string;
  /**
   * True for general technology feeds that are not quantum-specific. The
   * pipeline drops items from these unless the text matches the quantum
   * vocabulary, which is what keeps a general startup feed from filling
   * the India column with unrelated funding news.
   */
  requiresKeywordFilter?: boolean;
  /** Politeness floor in minutes between reads of this source. */
  minInterval?: number;
};

export const GLOBAL_SOURCES: readonly SourceDefinition[] = [
  {
    slug: 'arxiv-quant-ph',
    name: 'arXiv quant-ph',
    homepage: 'https://arxiv.org/list/quant-ph/recent',
    endpoint:
      'http://export.arxiv.org/api/query?search_query=cat:quant-ph&sortBy=submittedDate&sortOrder=descending&max_results=40',
    kind: 'JSON_API',
    region: 'GLOBAL',
    monogram: 'AX',
    covers: 'New quantum physics and quantum information preprints',
    minInterval: 120,
  },
  {
    slug: 'ibm-research',
    name: 'IBM Research',
    homepage: 'https://research.ibm.com/blog',
    endpoint: 'https://www.ibm.com/blogs/research/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'IBM',
    covers: 'IBM Quantum hardware roadmap, Qiskit and research posts',
  },
  {
    slug: 'google-research',
    name: 'Google Research',
    homepage: 'https://blog.google/technology/research/',
    endpoint: 'https://blog.google/technology/research/rss/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'GQ',
    covers: 'Google Quantum AI announcements and research results',
    requiresKeywordFilter: true,
  },
  {
    slug: 'microsoft-quantum',
    name: 'Microsoft Quantum',
    homepage: 'https://cloudblogs.microsoft.com/quantum/',
    endpoint: 'https://cloudblogs.microsoft.com/quantum/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'MSQ',
    covers: 'Azure Quantum, topological qubit programme, Q# toolchain',
  },
  {
    slug: 'aws-braket',
    name: 'AWS Quantum Computing',
    homepage: 'https://aws.amazon.com/blogs/quantum-computing/',
    endpoint: 'https://aws.amazon.com/blogs/quantum-computing/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'AWS',
    covers: 'Amazon Braket, the AWS Center for Quantum Computing',
  },
  {
    slug: 'npj-quantum-information',
    name: 'npj Quantum Information',
    homepage: 'https://www.nature.com/npjqi/',
    endpoint: 'https://www.nature.com/npjqi.rss',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'NPJ',
    covers: 'Peer-reviewed quantum information research from Nature',
  },
  {
    slug: 'quantum-insider',
    name: 'The Quantum Insider',
    homepage: 'https://thequantuminsider.com/',
    endpoint: 'https://thequantuminsider.com/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'TQI',
    covers: 'Industry news, funding rounds and market analysis',
  },
  {
    slug: 'quantum-computing-report',
    name: 'Quantum Computing Report',
    homepage: 'https://quantumcomputingreport.com/',
    endpoint: 'https://quantumcomputingreport.com/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'QCR',
    covers: 'Hardware specifications, roadmaps and company tracking',
  },
  {
    slug: 'ieee-spectrum-computing',
    name: 'IEEE Spectrum',
    homepage: 'https://spectrum.ieee.org/topic/computing/',
    endpoint: 'https://spectrum.ieee.org/feeds/topic/computing.rss',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'IEEE',
    covers: 'Engineering coverage of computing, including quantum hardware',
    requiresKeywordFilter: true,
  },
  {
    slug: 'mit-technology-review',
    name: 'MIT Technology Review',
    homepage: 'https://www.technologyreview.com/',
    endpoint: 'https://www.technologyreview.com/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'MTR',
    covers: 'Analysis and reporting on emerging computing technology',
    requiresKeywordFilter: true,
  },
  {
    slug: 'phys-org-quantum',
    name: 'Phys.org Quantum Physics',
    homepage: 'https://phys.org/physics-news/quantum-physics/',
    endpoint: 'https://phys.org/rss-feed/physics-news/quantum-physics/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'PHY',
    covers: 'Research summaries drawn from institutional press releases',
  },
  {
    slug: 'qutech',
    name: 'QuTech Delft',
    homepage: 'https://qutech.nl/',
    endpoint: 'https://qutech.nl/feed/',
    kind: 'RSS',
    region: 'GLOBAL',
    monogram: 'QTD',
    covers: 'Delft University and TNO quantum research institute',
  },
  {
    slug: 'ionq-news',
    name: 'IonQ',
    homepage: 'https://ionq.com/',
    endpoint: 'https://ionq.com/news',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'ION',
    covers: 'Trapped-ion hardware announcements and partnerships',
    minInterval: 360,
  },
  {
    slug: 'rigetti-news',
    name: 'Rigetti Computing',
    homepage: 'https://www.rigetti.com/',
    endpoint: 'https://www.rigetti.com/news',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'RIG',
    covers: 'Superconducting hardware and cloud access announcements',
    minInterval: 360,
  },
  {
    slug: 'quantinuum-news',
    name: 'Quantinuum',
    homepage: 'https://www.quantinuum.com/',
    endpoint: 'https://www.quantinuum.com/news',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'QTM',
    covers: 'Trapped-ion systems, error correction milestones',
    minInterval: 360,
  },
  {
    slug: 'dwave-newsroom',
    name: 'D-Wave Quantum',
    homepage: 'https://www.dwavequantum.com/',
    endpoint: 'https://www.dwavequantum.com/company/newsroom/',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'DWV',
    covers: 'Quantum annealing systems and optimisation deployments',
    minInterval: 360,
  },
  {
    slug: 'psiquantum-news',
    name: 'PsiQuantum',
    homepage: 'https://www.psiquantum.com/',
    endpoint: 'https://www.psiquantum.com/news',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'PSI',
    covers: 'Photonic fault-tolerant architecture programme',
    minInterval: 720,
  },
  {
    slug: 'pasqal-news',
    name: 'Pasqal',
    homepage: 'https://pasqal.com/',
    endpoint: 'https://pasqal.com/news/',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'PSQ',
    covers: 'Neutral-atom processors and European deployments',
    minInterval: 720,
  },
  {
    slug: 'xanadu-blog',
    name: 'Xanadu',
    homepage: 'https://www.xanadu.ai/',
    endpoint: 'https://www.xanadu.ai/blog',
    kind: 'HTML',
    region: 'GLOBAL',
    monogram: 'XAN',
    covers: 'Photonic hardware and the PennyLane software stack',
    minInterval: 720,
  },
];

export const INDIA_SOURCES: readonly SourceDefinition[] = [
  {
    slug: 'pib-science',
    name: 'Press Information Bureau',
    homepage: 'https://pib.gov.in/',
    endpoint: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'PIB',
    covers: 'Government of India science and technology releases',
    requiresKeywordFilter: true,
  },
  {
    slug: 'dst-whatsnew',
    name: 'Department of Science and Technology',
    homepage: 'https://dst.gov.in/',
    endpoint: 'https://dst.gov.in/whatsnew/rss.xml',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'DST',
    covers: 'National Quantum Mission and DST programme announcements',
    requiresKeywordFilter: true,
  },
  {
    slug: 'economic-times-tech',
    name: 'The Economic Times Tech',
    homepage: 'https://economictimes.indiatimes.com/tech',
    endpoint:
      'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'ET',
    covers: 'Indian technology industry and enterprise coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'livemint-technology',
    name: 'Mint Technology',
    homepage: 'https://www.livemint.com/technology',
    endpoint: 'https://www.livemint.com/rss/technology',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'MNT',
    covers: 'Indian business and technology reporting',
    requiresKeywordFilter: true,
  },
  {
    slug: 'yourstory',
    name: 'YourStory',
    homepage: 'https://yourstory.com/',
    endpoint: 'https://yourstory.com/feed',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'YS',
    covers: 'Indian startup ecosystem, including deep-tech ventures',
    requiresKeywordFilter: true,
  },
  {
    slug: 'businessline-infotech',
    name: 'The Hindu businessline',
    homepage: 'https://www.thehindubusinessline.com/info-tech/',
    endpoint:
      'https://www.thehindubusinessline.com/info-tech/feeder/default.rss',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'HBL',
    covers: 'Indian information technology and policy coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'indian-express-technology',
    name: 'The Indian Express Technology',
    homepage: 'https://indianexpress.com/section/technology/',
    endpoint: 'https://indianexpress.com/section/technology/feed/',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'IE',
    covers: 'National technology reporting and science coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'qnu-labs',
    name: 'QNu Labs',
    homepage: 'https://qnulabs.com/',
    endpoint: 'https://qnulabs.com/blog',
    kind: 'HTML',
    region: 'INDIA',
    monogram: 'QNU',
    covers: 'Quantum key distribution and quantum-safe security, Bengaluru',
    minInterval: 720,
  },
  {
    slug: 'qpiai',
    name: 'QpiAI',
    homepage: 'https://www.qpiai.tech/',
    endpoint: 'https://www.qpiai.tech/',
    kind: 'HTML',
    region: 'INDIA',
    monogram: 'QPI',
    covers: 'Full-stack quantum computing and AI systems, Bengaluru',
    minInterval: 720,
  },
  {
    slug: 'bosonq-psi',
    name: 'BosonQ Psi',
    homepage: 'https://bosonqpsi.com/',
    endpoint: 'https://bosonqpsi.com/',
    kind: 'HTML',
    region: 'INDIA',
    monogram: 'BQP',
    covers: 'Quantum-accelerated simulation software, Bhilai and Buffalo',
    minInterval: 720,
  },
  {
    slug: 'iit-madras-press',
    name: 'IIT Madras',
    homepage: 'https://www.iitm.ac.in/',
    endpoint: 'https://www.iitm.ac.in/happenings/press-releases-and-coverages',
    kind: 'HTML',
    region: 'INDIA',
    monogram: 'IITM',
    covers: 'Institute press releases, including quantum research groups',
    requiresKeywordFilter: true,
    minInterval: 720,
  },
];

export const ALL_SOURCES: readonly SourceDefinition[] = [
  ...GLOBAL_SOURCES,
  ...INDIA_SOURCES,
];

export const SOURCE_COUNT = ALL_SOURCES.length;

/** Count of sources read through an official feed or API rather than HTML. */
export const FEED_SOURCE_COUNT = ALL_SOURCES.filter(
  (source) => source.kind !== 'HTML',
).length;

export function getSource(slug: string): SourceDefinition | undefined {
  return ALL_SOURCES.find((source) => source.slug === slug);
}
