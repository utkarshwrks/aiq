# Decisions

Judgement calls made during the build, and the reasoning behind them.
Recorded because the brief left them open and because a future
maintainer's first question will be "why is it like this".

---

## 1. Build order departs from the brief

**Decision.** The ingestion pipeline was built before the landing page,
not after it.

**Why.** The brief's suggested sequence puts the landing page at step 4
and the pipeline at step 5, but the landing page contains the Update
Panel widget and a live source counter. Building it first would have
meant designing against placeholder data and then rebuilding once real
data arrived — and real feeds turned out to have properties no
placeholder would have suggested. The panel's ranking rules, the
per-source cap and the estimated-date marker all exist because of what
live data actually looked like.

## 2. The site runs without a database

**Decision.** Every ingestion run writes `updates.snapshot.json` into the
repository, and the application falls back to it when no `DATABASE_URL`
is configured, when a query throws, or when the table is empty.

**Why.** The brief specifies Postgres, and Postgres is fully implemented.
But a reference site whose central feature is blank on a fresh clone is a
worse product, and a database blip should degrade freshness rather than
take the landing page down. The origin is reported in the interface —
"Live index" or "Committed snapshot" — so the fallback is disclosed
rather than disguised.

**Cost.** The snapshot is a committed artefact that changes on every
ingestion run, which makes the repository history noisier. Accepted.

## 3. India is routed by subject, not by publisher

**Decision.** An item from a global source whose subject is India appears
in the India column, not the global one. Signals are word-bounded, and
the threshold is asymmetric: one signal in the headline, two in the body.

**Why.** The brief requires India to be a first-class lens rather than a
filter. Routing purely on the publisher's nationality would have made the
India column a list of *who published* rather than a view of the
ecosystem — and when The Quantum Insider reports on the National Quantum
Mission, that plainly belongs under India. The asymmetric threshold stops
a global story that mentions India once in passing from being relocated.

The two columns stay disjoint: an item appears in one or the other, never
both.

## 4. News search sources for the Indian long tail

**Decision.** Two of the registry entries are news search feeds rather
than individual publishers.

**Why.** After wiring eleven Indian publisher feeds, the India column was
drawing usable items from exactly one source. Indian quantum coverage is
real but spread thinly across a great many outlets, and no single feed
carries enough of it. A search feed reaches that long tail without
maintaining forty adapters.

**How the attribution problem is handled.** Items are credited to the
publisher that did the reporting, recovered from the item itself, not to
the aggregator. The registry records the kind separately and the
disclosure on `/updates` and `/about` marks those entries as search
entries. Crediting the aggregator would have misattributed the work.

## 5. Sources that refuse are removed, not worked around

**Decision.** A source that answers 403 to our identified user agent is
deleted from the registry. No user-agent spoofing, no header rotation.

**Why.** The pipeline publishes a user agent pointing back at the
sourcing page precisely so a publisher can decline. Circumventing a
decline would make that disclosure dishonest. Two government sources were
lost this way and the removals are documented in `SOURCES.md`.

## 6. Keyword classification rather than a model

**Decision.** Topic classification and India routing are keyword rule
sets. `Classifier` marks the seam an LLM-backed implementation would slot
into.

**Why.** Seven classes, narrow and stable vocabulary, and — decisively —
auditability: when an item lands in the wrong column, the reason is a
line you can read and fix. The brief asks for exactly this, with a hook
left for later.

## 7. Summaries are compressions, and say so

**Decision.** Without a model in the loop, `summarise` performs a
constrained compression of the publisher's own description: one sentence,
180 characters, boilerplate stripped, `null` when there is nothing
usable.

**Why.** The brief asks for original paraphrases. Deterministic code
cannot paraphrase, so rather than pretend otherwise the constraints are
enforced structurally at a length far below any excerpt threshold, and
the `null` return is what stops the panel padding itself with restated
headlines. `Summariser` is the seam for a model-generated paraphrase.

## 8. No coastline on the ecosystem map

**Decision.** The map is a coordinate graticule with plotted survey
crosses and six faint region labels. No country outlines.

**Why.** What the reader needs is where programmes sit relative to one
another, and a graticule states that the way a survey chart does. Country
outlines would have cost a quarter of a megabyte of path data to say the
same thing. The projection is named on the plate, and the crop — 72N to
45S, because the full extent spent a third of the figure on empty polar
ocean — is named too.

## 9. Tailwind v4 rather than v3

**Decision.** Tailwind CSS v4 with `@theme inline`.

**Why.** The brief requires that theme tokens live in `theme.css` as CSS
variables and that nothing downstream hardcodes a value. `@theme inline`
maps tokens into the utility namespace while emitting `var()` references
rather than resolving at build time, which keeps `theme.css`
authoritative at runtime. Under v3 the token layer and the Tailwind
config would have been two places to change one colour.

## 10. Prisma pinned to 6.x

**Decision.** `prisma@6` and `@prisma/client@6`, pinned.

**Why.** npm resolved `prisma` to an 8.0 release candidate whose CLI is a
different tool entirely — no `generate` command, oriented at the Prisma
platform rather than a self-hosted Postgres. 6.x is where the schema,
generate and migrate workflow this project uses is the documented one.

## 11. Redis is designed for but not required

**Decision.** `REDIS_URL` is documented and the caching seam exists, but
the application does not require Redis.

**Why.** The Update Panel is already cached at three layers — ISR on the
page, `s-maxage` on the API route, and SWR on the client — against data
that changes at most every three hours. Adding a required Redis instance
would add an operational dependency and a failure mode without measurably
reducing load. It becomes worthwhile at multi-instance scale, which is
why the environment variable is reserved.

## 12. The scene lab ships, but is not indexed

**Decision.** `/lab` is in the production build, excluded from
`robots.txt` and from the sitemap, and absent from navigation.

**Why.** The brief asks for the 3D components to be built in isolation
before being wired into routes. Keeping that harness in the deployed
build means the scenes can be checked against production conditions,
which is where WebGL problems actually appear. It is a development
surface, so it is not content.

## 13. No light mode

**Decision.** Dark only. `color-scheme: dark` is declared and there is no
toggle.

**Why.** The brief specifies a dark-first instrument aesthetic. A second
palette would double the token surface and halve the attention each gets,
and an instrument console is read in low light. Stated here so its
absence reads as a decision rather than an omission.

## 14. Qubit counts are not tabulated

**Decision.** The ecosystem register carries no qubit-count column.

**Why.** Counts change faster than a static page can, and — more
importantly — they are measured differently across modalities. Tabulating
them would imply a comparability that does not exist, and an annealer's
count next to a trapped-ion count is actively misleading. The Update
Panel is where current numbers belong.

## 15. The timeline is scroll-linked but not scroll-jacked

**Decision.** The landing rail advances with page scroll, and the linkage
releases permanently the moment the reader touches the rail.

**Why.** The brief asks for a scroll-driven strip. Taking over the page's
scroll to drive it is the single most reliable way to make a site
unusable on a trackpad. Linking a scrollable region's offset to page
progress gives the intended effect while leaving the region an ordinary
one: draggable, tabbable, and still under reduced motion.

## 16. Git identity

**Decision.** Commits are authored `utkarshwrks
<utkarshkushwwaha246@gmail.com>`, set both globally on the build machine
and locally in this repository.

**Why.** Requested during the build, and applied retroactively to the
existing history so authorship is uniform. For the commits to count
towards a GitHub contribution graph, that address must be added and
verified in the account's email settings.

## 17. Framer Motion and GSAP each drive one thing

**Decision.** Framer Motion drives the transition between plates
(`src/components/layout/PageTransition.tsx`). GSAP with ScrollTrigger
drives the scroll-driven sequence at the head of the timeline plate
(`src/components/marketing/TimelineSequence.tsx`). Neither library is
loaded on a route that does not use it.

**Why.** Both arrived as declared dependencies with nothing importing
them, which is a maintenance liability: a reader of `package.json`
reasonably assumes an animation library in the list is load-bearing. The
brief names both and assigns each a job, so each was given the job it was
named for rather than deleted.

Framer's `AnimatePresence` is the shortest honest way to hold a route's
outgoing markup for the length of an exit, which CSS cannot do because
the element it would animate is already unmounted. ScrollTrigger's pin
and scrub are likewise not worth reimplementing: pinning a section for
exactly the distance its content has left to travel, and recomputing that
on resize, is where a hand-rolled scroll listener stops being a few lines
and starts being a small library with bugs.

**Cost, and where it is paid.** GSAP with ScrollTrigger adds roughly
50KB to the timeline route and nothing to any other, because it is
imported from a client component that only that route renders. The
landing page's first-load JS is unchanged. That containment is the
condition on which the dependency is justified; if a second route needs
it, the shared chunk needs re-measuring.

**What was reconsidered.** An earlier pass removed GSAP outright, on the
argument that the only scroll-linked element - the landing teaser rail -
was transform-only and cheaper to drive with a rAF loop. That reasoning
held for the teaser and does not extend to the timeline sequence, which
pins. The teaser still uses its own loop and is not a GSAP consumer; see
entry 15 for why it does not hijack scroll.

## 18. Redis caches the composed feed, and is optional

**Decision.** `src/lib/cache.ts` wraps the Update Panel feed, the
ingestion stats and glossary search results in a TTL cache. The worker
drops those keys at the end of a run (`worker/cache.ts`). With
`REDIS_URL` unset, every call falls through to its loader.

**Why.** The panel is the most-read and least-changing thing on the site:
the worker writes at most every three hours, and between runs every
request otherwise issues the same four Postgres queries to produce a
byte-identical answer. Five minutes of TTL collapses that to one query
per cluster per window.

Optional is the important half. The product is required to run with no
database attached, and a cache that can take the site down when it fails
is worse than no cache. A configured but unreachable Redis logs once and
reads through: `enableOfflineQueue` is off and `maxRetriesPerRequest` is
one, so a request never queues behind a reconnecting cache.

The keys carry a version prefix (`feed:v1:`) so a change to the composed
shape cannot serve an old body to new code. Caching is skipped entirely
on the snapshot path, where it would put a network hop in front of a
local file read.

## 19. Glossary search is Postgres full-text, with a local pass in front

**Decision.** `/api/glossary/search` ranks with Postgres `ts_rank` over a
weighted `tsvector` - headword A, aliases B, definition C - against a
`glossary_terms` table mirrored from the authored file. The client keeps
its own scored match and renders it immediately, then replaces the
ordering when the server answers.

**Why both.** The corpus is forty-six entries, at which size shipping it
to the browser is genuinely faster than a request, and that is what makes
the field feel instant. But the authored file is not the only reader of
this feature's future: full-text search brings stemming and phrase
queries the client scoring does not attempt, and shipping the corpus
stops being reasonable well before the corpus stops growing. Running both
costs one request per query and removes the cliff.

The local pass is also the whole answer when no database is configured,
which is a supported way to run this product. Search cannot be the one
feature that stops working without Postgres.

**The file stays the source of truth.** `glossary_terms` is a projection,
rebuilt by `npm run db:seed:glossary`, which upserts by slug and deletes
anything no longer in the file. The table can never drift into holding
entries no reviewer has seen. Slugs are derived from the term rather than
authored, so the two cannot disagree.

## 20. Visual regression needs a frozen scene, not a longer timeout

**Decision.** Appending `?frozen=1` to a route pins every 3D scene to a
fixed animation phase and switches its render loop to `demand`; the
scene reports `data-frozen="true"` once a deterministic frame has drawn,
and the visual suite waits on that. Particle seeds come from a fixed PRNG
(`src/lib/prng.ts`) rather than `Math.random`.

**Why.** A screenshot of a running animation compares whichever frame the
capture happened to catch, which produces a suite that fails for no
reason often enough that people stop reading its failures. Waiting longer
does not fix it; stopping the clock does.

Seeding the particle field was worth doing on its own account, separately
from the tests: an instrument that rearranges itself between visits reads
as noise rather than as a diagram.

The suite runs as its own Playwright project at one viewport with
`deviceScaleFactor: 1` and pinned GPU flags, because a reference image
written by one renderer and checked by another is not a test. Tolerance
is `maxDiffPixelRatio: 0.02` - loose enough to absorb driver differences,
tight enough that a scene which fails to mount, loses its state vector or
loses a material still fails.

## 21. Figures are drawn, not photographed

**Decision.** The explanatory imagery on the content plates is twelve
authored inline SVG figures in `src/components/diagrams/`. There are no
photographs and no stock imagery anywhere in the product.

**Why.** A photograph of a dilution refrigerator tells a reader nothing
about superposition, and the ones that circulate are mostly press
images with licences this project has no basis to assume. Every figure
here instead carries a specific point: the bit-versus-qubit state space,
signed amplitudes against squared probabilities, the Bell correlation
table, path interference, circuit notation, the shortening Bloch vector,
the physical-to-logical encoding cost, the Born rule, the two shapes of
speed-up, the variational loop, the modality trade-off, and the mission
structure.

They are drawn in theme tokens on a shared grid, so they inherit the
palette rather than restating it and cannot drift into a second visual
language. Being markup rather than assets, they cost no additional
requests, stay crisp at any size, and are searchable and diffable.

**They replace prose, they do not decorate it.** The foundations bodies
were cut from three or four paragraphs to two per concept, and the
paragraphs that went are the ones a figure now states better. Each
`Figure` carries a caption written to stand alone, because that caption
is the drawing's text alternative for a reader who cannot see it.

## 22. The modality comparison is pips, and says so

**Decision.** The ecosystem figure scores five hardware approaches out of
five on gate speed, coherence, connectivity and fabrication, using
discrete pips rather than bars, and its caption opens by saying the
standings are not measurements.

**Why.** The comparison is the single most useful thing on that plate and
also the easiest to overclaim. Bars imply a measured quantity and invite
the reader to compare lengths across rows; pips read as a judgement,
which is what these are - read off each modality's own trade-off
sentence in `src/content/ecosystem.ts`. There are no numbers on the axis
of the complexity plot for the same reason: the shape of the growth is
the honest claim, and a scale would invite a benchmark comparison the
drawing cannot support.

Annealing is omitted from the grid rather than scored zero, because it
does not run gate-model algorithms at all and a low score would imply it
was trying to and failing. This is the same argument as entry 14 on
qubit counts.
