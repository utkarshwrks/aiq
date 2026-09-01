# AIQuantumOS

A reference-grade, continuously updated knowledge platform for quantum
computing: first-principles explanation through to frontier research, the
global and Indian ecosystems mapped, and an ingestion pipeline that reads
the field's own sources every three hours.

Built and maintained by **Cybokrafts Universal Innovations Pvt. Ltd.**, a
DPIIT-recognised startup incubated at IIT Indore.

---

## What is here

| Route | What it holds |
| --- | --- |
| `/` | The command deck: interactive Bloch sphere, foundations strip, live update panel, ecosystem plot, timeline rail |
| `/foundations` | Eight core concepts, each written against the version of itself that circulates most widely |
| `/algorithms` | Shor, Grover, VQE, QAOA, quantum machine learning and quantum simulation, with resource requirements stated |
| `/ecosystem` | Global hardware programmes organised by physical modality |
| `/india` | The National Quantum Mission, its four thematic hubs, institutions, agencies and companies |
| `/updates` | The full Update Panel plus the complete source register |
| `/timeline` | 1980 to the present, selected for events the field would have gone differently without |
| `/glossary` | Searchable A to Z, with explicit notes wherever a term is routinely misused |
| `/about` | What the product is, how it is sourced, and what it is not |
| `/lab` | Development harness for the three 3D scenes. Excluded from indexing |

## Requirements

- Node.js 20 or later
- PostgreSQL 14 or later — **optional**, see below

## Getting started

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000` with a fully populated Update
Panel and no further setup. That is deliberate: the ingestion worker
commits a snapshot to `src/content/updates.snapshot.json`, the
application falls back to it whenever no database is configured, and the
panel says "Committed snapshot" rather than pretending the data is live.

### Running with a database

```bash
cp .env.example .env.local          # then uncomment DATABASE_URL
npm run db:generate                 # generate the Prisma client
npm run db:push                     # create the schema
npm run ingest                      # one ingestion pass
```

With `DATABASE_URL` set, the panel reads live rows and its status bar
reports "Live index".

### Running the ingestion worker

```bash
npm run ingest:dry                  # read every source, write nothing
npm run ingest                      # read, persist, and rewrite the snapshot
npm run ingest -- --only=arxiv-quant-ph,inc42
npm run ingest:probe -- ibm-research    # diagnose one source
npm run worker                      # long-running scheduler, every three hours
```

The dry run is the tool to reach for first when a source misbehaves: it
reads live sources, reports exactly what each returned, and writes
nothing anywhere.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint, flat config, `next/core-web-vitals` |
| `npm run typecheck` | Type-checks the application **and** the worker |
| `npm test` | Vitest unit suite |
| `npm run test:e2e` | Playwright, across desktop, mobile and reduced motion |
| `npm run ingest` | One ingestion pass |
| `npm run worker` | The scheduled ingestion service |
| `npm run capture` | Headless screenshot of a route, for checking the 3D scenes |

## Project layout

```
src/
  app/            Route handlers and pages (App Router)
  components/
    3d/           React Three Fiber scenes, their fallbacks and layout maths
    layout/       Header, footer, page shell, skip link
    marketing/    Landing page sections
    panels/       Update panel, glossary index
    ui/           Primitives: Container, Panel, Tag, Readout, Citation, ...
  content/        The written material and the ingestion snapshot
  hooks/          useReducedMotion, useInView
  lib/            Site manifest, source registry, quantum maths, repository
  styles/         theme.css (tokens), motifs.css (visual grammar), globals.css
worker/
  scrapers/       One adapter per source kind, behind one polite HTTP layer
  pipeline/       normalize, classify, summarise, ingest
  persist.ts      Database writes
  snapshot.ts     Snapshot writer
tests/
  unit/           Vitest
  e2e/            Playwright
prisma/           Schema
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the ingestion pipeline works, end to end
- [THEME.md](./THEME.md) — the Cartographer design system
- [SOURCES.md](./SOURCES.md) — every source used, for content and for ingestion
- [DECISIONS.md](./DECISIONS.md) — the judgement calls made during the build, and why
- [DEPLOYMENT.md](./DEPLOYMENT.md) — deploying the site and the worker

## Constraints this project is built under

These are enforced, not aspirational:

- **No emoji anywhere.** Not in the interface, not in code comments, not
  in commit messages, not in ingested content. The normalisation stage
  strips them from scraped text and an end-to-end test scans every
  route's rendered output on every run.
- **The panel indexes, it never republishes.** Summaries are capped well
  below any excerpt length, every item links out, and an item with
  nothing usable to say is dropped rather than padded.
- **Every non-trivial factual claim is cited.** Inline markers resolve to
  a numbered reference list on each plate.
- **Reduced motion is a branch, not a degradation.** Every 3D scene has a
  static substitute drawn to the same specification, and the substitution
  is asserted by a dedicated test project.
- **India is a lens, not a filter.** Two columns, never merged, with
  items routed by subject rather than by the publisher's nationality.
