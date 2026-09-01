# Sources

Everything AIQuantumOS reads, in two parts: the sources the written
material was checked against, and the feeds the ingestion worker polls.

---

## 1. Static content

All explanatory copy on this site is written originally. Nothing is
reproduced from a source. These are the works the material was checked
against, and the ones the inline citation markers resolve to.

### Primary literature

| Work | Where |
| --- | --- |
| Benioff, *The computer as a physical system* (1980) | Journal of Statistical Physics |
| Feynman, *Simulating Physics with Computers* (1982) | [International Journal of Theoretical Physics](https://link.springer.com/article/10.1007/BF02650179) |
| Bennett and Brassard, *Quantum cryptography: public key distribution and coin tossing* (1984) | [Theoretical Computer Science](https://www.sciencedirect.com/science/article/pii/S0304397514004241) |
| Deutsch, *Quantum theory, the Church-Turing principle and the universal quantum computer* (1985) | [Proceedings of the Royal Society A](https://royalsocietypublishing.org/doi/10.1098/rspa.1985.0070) |
| Shor, *Scheme for reducing decoherence in quantum computer memory* (1995) | [Physical Review A](https://journals.aps.org/pra/abstract/10.1103/PhysRevA.52.R2493) |
| Grover, *A fast quantum mechanical algorithm for database search* (1996) | [arXiv](https://arxiv.org/abs/quant-ph/9605043) |
| Steane, *Error Correcting Codes in Quantum Theory* (1996) | [Physical Review Letters](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.77.793) |
| Shor, *Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms* (1997) | [SIAM Journal on Computing](https://epubs.siam.org/doi/10.1137/S0097539795293172) |
| Farhi, Goldstone and Gutmann, *A Quantum Approximate Optimization Algorithm* (2014) | [arXiv](https://arxiv.org/abs/1411.4028) |
| Preskill, *Quantum Computing in the NISQ era and beyond* (2018) | [Quantum](https://quantum-journal.org/papers/q-2018-08-06-79/) |
| Arute et al., *Quantum supremacy using a programmable superconducting processor* (2019) | [Nature](https://www.nature.com/articles/s41586-019-1666-5) |
| Google Quantum AI, *Suppressing quantum errors by scaling a surface code logical qubit* (2023) | [Nature](https://www.nature.com/articles/s41586-022-05434-1) |

### Reference works and documentation

| Work | Where |
| --- | --- |
| Nielsen and Chuang, *Quantum Computation and Quantum Information* | [Cambridge University Press](https://www.cambridge.org/highereducation/books/quantum-computation-and-quantum-information/01E10196D0A682A6AEFFEA52D53BE9AE) |
| IBM Quantum Learning, *Basics of quantum information* | [learning.quantum.ibm.com](https://learning.quantum.ibm.com/course/basics-of-quantum-information) |
| IBM Quantum development roadmap | [ibm.com/roadmaps/quantum](https://www.ibm.com/roadmaps/quantum/) |
| Azure Quantum documentation, concepts overview | [learn.microsoft.com](https://learn.microsoft.com/en-us/azure/quantum/concepts-overview) |
| Amazon Braket documentation, supported devices | [docs.aws.amazon.com](https://docs.aws.amazon.com/braket/latest/developerguide/braket-devices.html) |
| D-Wave, *What is quantum annealing?* | [docs.dwavequantum.com](https://docs.dwavequantum.com/en/latest/quantum_research/quantum_annealing_intro.html) |
| PennyLane, *A brief overview of the variational quantum eigensolver* | [pennylane.ai](https://pennylane.ai/qml/demos/tutorial_vqe) |
| Quantinuum, H-Series systems | [quantinuum.com](https://www.quantinuum.com/products-solutions/quantum-computers) |

### Policy and standards

| Work | Where |
| --- | --- |
| NIST Post-Quantum Cryptography standardisation project | [csrc.nist.gov](https://csrc.nist.gov/projects/post-quantum-cryptography) |
| Cabinet approval of the National Quantum Mission (2023) | [Press Information Bureau](https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1917888) |
| National Quantum Mission programme page | [Department of Science and Technology](https://dst.gov.in/national-quantum-mission-nqm) |

Wikipedia was used only as a cross-check for dates and spellings, never
as a source for a claim.

---

## 2. Ingestion sources

The table below is generated from `src/lib/sources.ts`, the registry the
worker actually polls, by `node scripts/sources-table.mjs`. The same list
is published in the interface on `/updates`.

Preference order: official feeds and public APIs first, page markup only
where a publisher offers no usable feed.

### Global (19)

| Source | Read as |
| --- | --- |
| [arXiv quant-ph](https://arxiv.org/list/quant-ph/recent) | Public API |
| [IBM Research](https://research.ibm.com/blog) | Page markup |
| [Google Research](https://blog.google/technology/research/) | RSS |
| [Microsoft Quantum](https://cloudblogs.microsoft.com/quantum/) | RSS |
| [AWS Quantum Computing](https://aws.amazon.com/blogs/quantum-computing/) | RSS |
| [npj Quantum Information](https://www.nature.com/npjqi/) | RSS |
| [The Quantum Insider](https://thequantuminsider.com/) | RSS |
| [Quantum Computing Report](https://quantumcomputingreport.com/) | RSS |
| [IEEE Spectrum](https://spectrum.ieee.org/topic/computing/) | RSS |
| [MIT Technology Review](https://www.technologyreview.com/) | RSS |
| [Phys.org Quantum Physics](https://phys.org/physics-news/quantum-physics/) | RSS |
| [QuTech Delft](https://qutech.nl/) | RSS |
| [IonQ](https://ionq.com/) | Page markup |
| [Rigetti Computing](https://www.rigetti.com/) | Page markup |
| [Quantinuum](https://www.quantinuum.com/) | Page markup |
| [D-Wave Quantum](https://www.dwavequantum.com/) | Page markup |
| [PsiQuantum](https://www.psiquantum.com/) | Page markup |
| [Pasqal](https://pasqal.com/) | Page markup |
| [Xanadu](https://www.xanadu.ai/) | Page markup |

### India (18)

| Source | Read as |
| --- | --- |
| [The Quantum Insider India](https://thequantuminsider.com/tag/india/) | RSS |
| [National Quantum Mission coverage](https://dst.gov.in/national-quantum-mission-nqm) | News search |
| [Indian quantum computing coverage](https://news.google.com/) | News search |
| [Express Computer](https://www.expresscomputer.in/) | RSS |
| [ET Government](https://government.economictimes.indiatimes.com/) | RSS |
| [ET CIO](https://cio.economictimes.indiatimes.com/) | RSS |
| [The Times of India Tech](https://timesofindia.indiatimes.com/technology) | RSS |
| [The Hindu Technology](https://www.thehindu.com/sci-tech/technology/) | RSS |
| [The Hindu Science](https://www.thehindu.com/sci-tech/science/) | RSS |
| [MediaNama](https://www.medianama.com/) | RSS |
| [Inc42](https://inc42.com/) | RSS |
| [The Economic Times Tech](https://economictimes.indiatimes.com/tech) | RSS |
| [Mint Technology](https://www.livemint.com/technology) | RSS |
| [YourStory](https://yourstory.com/) | RSS |
| [The Hindu businessline](https://www.thehindubusinessline.com/info-tech/) | RSS |
| [The Indian Express Technology](https://indianexpress.com/section/technology/) | RSS |
| [QNu Labs](https://qnulabs.com/) | Page markup |
| [IIT Madras](https://www.iitm.ac.in/) | Page markup |

### Sources that were removed, and why

Documenting removals matters as much as documenting inclusions: a
registry that only records what worked reads as though nothing ever
fails.

| Source | Why it is not here |
| --- | --- |
| Press Information Bureau | Answers 403 to any identified non-browser client. Spoofing a browser user agent to get past a refusal is not something this pipeline does. |
| Department of Science and Technology | The advertised `whatsnew/rss.xml` path serves an ordinary HTML page, and that page carries no article list in its static markup. There is nothing to read. |
| Business Standard Technology | Answers 403. |
| QpiAI, BosonQ Psi | Both render their newsrooms client-side; a static fetch returns markup containing no articles. Reading a page that reliably yields nothing is worse than not listing it. Both remain profiled on the India plate. |

National Quantum Mission and policy coverage is instead reached through
The Hindu's science desk, MediaNama, Inc42 and the news search entries,
all of which report DST announcements and all of which publish real
feeds.

### Terms this pipeline holds itself to

- Every request carries an identifying user agent pointing at
  `/about#sourcing`, so a publisher who would rather not be read can
  block it and knows who to contact.
- Official feeds and public APIs are used wherever they exist.
- A 4xx response is never retried and never worked around.
- Items are summarised to a single line under 180 characters and always
  link out. Nothing is republished.
- Items surfaced through a news search are credited to the publisher that
  did the reporting, not to the aggregator.
- If a publisher asks to be removed, it is removed.
