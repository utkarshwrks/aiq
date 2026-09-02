remove vizkus group fron whole project and also add some picture and diagram # Resume point

**Status at pause:** the project builds and all checks pass. Nothing is
half-edited. You can run it right now with `npm install && npm run dev`.

This file exists so work can be picked up exactly where it stopped.
Section 3 records the audit against the client brief and how each open
item was closed; section 4 is what remains optional.

---

## 1. Verified state at the pause

| Check | Command | Result |
| --- | --- | --- |
| Application typecheck | `npx tsc --noEmit` | clean |
| Worker typecheck | `npx tsc --noEmit -p worker/tsconfig.json` | clean |
| Lint | `npm run lint` | no errors; 10 `no-console` warnings, all in `scripts/*.mjs`, which exist to print |
| Unit tests | `npm test` | 78 passed |
| End-to-end tests | `npm run test:e2e` | 114 passed, 4 skipped (viewport-conditional), 0 failed |
| Production build | `npm run build` | 20 routes, all generated |
| Lighthouse desktop | performance 100, accessibility 100, best practices 100, SEO 100 |
| Lighthouse mobile | performance 94-95, accessibility 100, best practices 100, SEO 100 |
| axe (WCAG 2.1 AA + best practice) | all nine content routes | zero violations |
| Brief conformance | section-by-section re-read | all clauses answered; see section 3 |

Mobile performance reads 94-95 rather than the 96 recorded at the
previous pause. The LCP element is the hero `h1`, which is present in the
server HTML with a 36ms element render delay, so nothing added since sits
in its path; the spread is Lighthouse's simulated-throttling variance.

## 2. What is complete

Everything in the brief.

- **Theme.** All tokens in `src/styles/theme.css`, four motifs in
  `motifs.css`, three self-hosted faces. No hardcoded colours anywhere.
- **3D.** All three scenes built, verified in a real browser, each with a
  static substitute asserted by a dedicated reduced-motion test project.
  Scene lab at `/lab`.
- **Ingestion.** 37 sources, adapters for RSS/Atom, a public API, news
  search and page markup; normalisation, classification, summarisation
  and deduplication; Postgres schema, run log, retention pruning, cron
  scheduler with an overlap guard, and a committed snapshot fallback.
- **Update Panel.** Two lenses that never merge, live status, topic
  filter, themed empty states, full source register published.
- **Content.** All nine routes written originally with inline citations
  and per-page reference lists.
- **Docs.** README, ARCHITECTURE, THEME, SOURCES, DECISIONS, DEPLOYMENT.

## 3. Audit against the brief

The project was re-read against the client brief section by section.
Seven items were open; all seven are closed. Each is listed with the
clause it answers.

### 3.1 Section 12 - attribution

The footer and /about credit Cybokrafts Universal Innovations Pvt. Ltd.,
its DPIIT recognition and its IIT Indore incubation, from
`src/lib/site.ts`. A group line was added and then removed at the
client's instruction; do not reintroduce it.

### 3.2 Section 3 - GSAP and ScrollTrigger were not used

Both were declared dependencies with nothing importing them. GSAP had
been uninstalled in an earlier pass, which the brief does not permit: it
names GSAP with ScrollTrigger for scroll-driven cinematic sequences.
Reinstalled and given the job.

### 3.3 Section 4 - /timeline was not scroll-driven

The plate was a static decade list. `TimelineSequence.tsx` now heads it:
a pinned section whose survey rail traverses sideways against page
scroll, with the year readout, era swatch and progress rule re-registering
as it passes each mark. Scrubbed, not hijacked - ScrollTrigger maps the
reader's own scroll onto the rail's offset, and the full linkable record
still follows below. Inert under reduced motion, where the rail is an
ordinary horizontal scroller.

Costs ~50KB on `/timeline` and nothing on any other route.

### 3.4 Section 3 - Redis was declared but not wired

`src/lib/cache.ts` caches the composed feed, the ingestion stats and
glossary search under versioned keys; `worker/cache.ts` drops them at the
end of a run that persisted rows. Optional and non-fatal throughout.

Two bugs were found by running it against a real Redis rather than by
reading it:

- A failed cache read returned early, so every cold instance permanently
  skipped the write for the first key it touched. A failed read is now a
  miss, and the write still happens.
- The worker issued `KEYS` before its connection was writeable, and with
  the offline queue disabled that is rejected outright - so invalidation
  had **never** worked, silently, in the exact path the feature exists
  for. It now connects explicitly first, and sweeps with `SCAN` rather
  than blocking the server with `KEYS`.

### 3.5 Section 3 - glossary search was not Postgres full-text

Now `ts_rank` over a weighted document (headword A, aliases B, definition
C) against a `glossary_terms` table mirrored from the authored file by
`npm run db:seed:glossary`. `/api/glossary/search` serves it; the client
renders its local scored match immediately and takes the server ordering
when it arrives, so the field stays instant and still works with no
database at all.

One bug found by running it: `array_to_string` is STABLE, not IMMUTABLE,
and Postgres refuses a non-immutable function in an index expression. The
joined alias text is now a stored column, and the GIN index builds.
Verified with `EXPLAIN` that the query uses the index rather than falling
back to a sequential scan that would still return correct answers.

### 3.6 Section 3 - no visual regression on the 3D components

`tests/e2e/visual.spec.ts` holds reference screenshots of all three
scenes and the timeline sequence, as its own Playwright project at a
fixed viewport, `deviceScaleFactor: 1` and pinned GPU flags. `?frozen=1`
pins each scene's animation phase and switches its loop to `demand`; the
scene sets `data-frozen="true"` once a deterministic frame has drawn and
the suite waits on that rather than on a timeout. Particle seeds moved
from `Math.random` to a fixed PRNG, which the scene wanted anyway.

### 3.7 Vercel readiness

`vercel.json` pins the framework, the build command (`prisma generate &&
next build`), the region and cache headers for the icon and fonts.
`.env.example`, README and DEPLOYMENT document Redis and the glossary
seed step.

### Verified against real services

Postgres 16 and Redis 7 were run in throwaway containers and the
database-backed paths exercised end to end: schema push, glossary seed,
index usage under `EXPLAIN`, full-text ranking, stemming ("entangled"
finds the entanglement entries), phrase queries, cache population, and a
worker invalidation flipping the feed from the cached snapshot to
`origin: database`. The containers were removed afterwards; nothing in
the repository depends on them.

### 3.8 Density pass - prose cut, figures added

Requested by the client after the audit: less text, more visual
material.

- **Attribution.** The group line added in 3.1 was removed again at the
  client's instruction. Do not reintroduce it.
- **Prose.** The foundations concept bodies went from three or four
  paragraphs each to two - 1,671 words to 1,078, a 36 per cent cut - with
  the surviving paragraphs carrying the clauses worth keeping from the
  ones that went. One VQE paragraph was cut where the new loop figure
  states the same thing. The algorithms, ecosystem and timeline prose was
  left alone: it is already short, structured fields rather than running
  text, and cutting distinct points to hit a word count would have been
  worse work than leaving it.
- **Figures.** Twelve authored inline SVG figures in
  `src/components/diagrams/`, wired to eight foundations concepts, two
  algorithms, the ecosystem plate and the India plate. No photographs -
  see DECISIONS entry 21 for why. Two figures carry deliberate
  unnumbered axes; see entry 22.

`src/content/india.ts` gained `short` and `theme` on the four hub
entries so the mission diagram reads its institutions from the registry
rather than restating them.

## 4. Optional, not required by the brief

- Meilisearch for the glossary. Not needed at 45 entries; the client-side
  scored search is faster. Revisit somewhere in the high hundreds.
- Redis. The seam and the environment variable exist; see DECISIONS.md
  entry 11 for why it is not wired.
- Visual regression snapshots for the 3D scenes. `scripts/capture.mjs`
  covers this manually today.
- An Open Graph image. `metadata.openGraph` has no `images` entry, so
  link previews currently show text only.
- `src/app/apple-icon.png` at 180x180. iOS falls back to a screenshot
  of the page without it.

## 5. How to pick this up

```bash
cd /Users/utkarshkushwaha/Desktop/Projects/aiuf
git pull
npm install
npm run dev
```

Nothing in section 3 is outstanding. After any change:

```bash
npm run typecheck && npm run lint && npm test && npm run test:e2e
```

To re-measure performance and accessibility:

```bash
npm run build && npx next start -p 3210 &
npx lighthouse http://127.0.0.1:3210/ --quiet --chrome-flags="--headless=new"
node scripts/contrast-report.mjs http://127.0.0.1:3210/<route>
```

To refresh the ingestion snapshot:

```bash
npm run ingest
git add src/content/updates.snapshot.json
git commit -m "chore(content): refresh the ingestion snapshot"
```

## 6. Things worth knowing before changing anything

- **`src/lib/sources.ts` is shared between the application and the
  worker.** The source table published on `/updates`, the counters in the
  hero, and the list the worker polls all read from it. Editing it
  changes all three, which is intentional.
- **The snapshot is a build artefact, not data to edit.** It is
  regenerated by `npm run ingest`. Hand-editing it will be overwritten.
- **`SceneFrame` and `DeferredScene` are both needed.** DeferredScene
  keeps the chunk off the load path; SceneFrame handles reduced motion,
  the canvas text alternative and the Suspense boundary once the chunk
  has arrived. Removing either reintroduces a defect that has already
  been fixed once.
- **Never widen `--cg-ink-faint` darker again.** It sits at 4.74:1
  against the elevated surface and is used for small text, so there is no
  large-text exemption. The previous value failed WCAG AA on every route.
