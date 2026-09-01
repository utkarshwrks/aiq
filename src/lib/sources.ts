/**
 * The source registry.
 *
 * Every endpoint below was checked by actually reading it, not merely by
 * confirming it returns 200. The ordering principle is the one stated in
 * the brief: official feeds and public APIs first, HTML index pages only
 * where a publisher offers no usable feed.
 *
 * Three entries changed during that check. IBM's legacy WordPress feed
 * now redirects to a rebuilt blog with no feed, so it reads as HTML. The
 * Press Information Bureau was dropped: it answers 403 to any identified
 * non-browser client, and spoofing a browser user agent to get around
 * that is not something this pipeline does. The Department of Science
 * and Technology was dropped for a duller reason - its advertised
 * rss.xml serves the ordinary page, and that page carries no article
 * list in its static markup, so there is nothing to read.
 *
 * National Quantum Mission and policy coverage is instead picked up
 * through The Hindu's science desk and MediaNama, both of which report
 * DST announcements and both of which publish real feeds.
 *
 * QpiAI and BosonQ Psi are likewise absent from the ingestion list: both
 * render their newsrooms client-side, so a static fetch returns markup
 * with no articles in it. Reading a page that reliably yields nothing is
 * worse than not listing it. Both companies are profiled on the India
 * plate, which is where they belong.
 *
 * SOURCE_COUNT and FEED_SOURCE_COUNT are derived at the foot of this
 * file rather than written into prose here, so the figures the interface
 * shows can never drift from the list.
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
    // The legacy WordPress feed now redirects to the rebuilt blog, which
    // publishes no feed of its own; the index page is the only option.
    endpoint: 'https://research.ibm.com/blog',
    kind: 'HTML',
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
    slug: 'express-computer',
    name: 'Express Computer',
    homepage: 'https://www.expresscomputer.in/',
    endpoint: 'https://www.expresscomputer.in/feed/',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'EXC',
    covers: 'Indian enterprise technology and public-sector computing',
    requiresKeywordFilter: true,
  },
  {
    slug: 'et-government',
    name: 'ET Government',
    homepage: 'https://government.economictimes.indiatimes.com/',
    endpoint: 'https://government.economictimes.indiatimes.com/rss/topstories',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'ETG',
    covers: 'Indian government technology policy and mission programmes',
    requiresKeywordFilter: true,
  },
  {
    slug: 'et-cio',
    name: 'ET CIO',
    homepage: 'https://cio.economictimes.indiatimes.com/',
    endpoint: 'https://cio.economictimes.indiatimes.com/rss/topstories',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'ETC',
    covers: 'Indian enterprise technology leadership coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'business-standard-tech',
    name: 'Business Standard Technology',
    homepage: 'https://www.business-standard.com/technology',
    endpoint: 'https://www.business-standard.com/rss/technology-108.rss',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'BS',
    covers: 'Indian business and technology reporting',
    requiresKeywordFilter: true,
  },
  {
    slug: 'toi-tech',
    name: 'The Times of India Tech',
    homepage: 'https://timesofindia.indiatimes.com/technology',
    endpoint: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'TOI',
    covers: 'National technology news of record',
    requiresKeywordFilter: true,
  },
  {
    slug: 'the-hindu-technology',
    name: 'The Hindu Technology',
    homepage: 'https://www.thehindu.com/sci-tech/technology/',
    endpoint: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'THT',
    covers: 'Indian technology desk coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'the-hindu-science',
    name: 'The Hindu Science',
    homepage: 'https://www.thehindu.com/sci-tech/science/',
    endpoint: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'THS',
    covers: 'Indian science reporting, including national mission coverage',
    requiresKeywordFilter: true,
  },
  {
    slug: 'medianama',
    name: 'MediaNama',
    homepage: 'https://www.medianama.com/',
    endpoint: 'https://www.medianama.com/feed/',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'MN',
    covers: 'Indian technology policy and regulation',
    requiresKeywordFilter: true,
  },
  {
    slug: 'inc42',
    name: 'Inc42',
    homepage: 'https://inc42.com/',
    endpoint: 'https://inc42.com/feed/',
    kind: 'RSS',
    region: 'INDIA',
    monogram: 'I42',
    covers: 'Indian startup funding and deep-technology ventures',
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
