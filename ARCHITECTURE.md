# Architecture

How AIQuantumOS is put together, with most of the attention on the
ingestion pipeline, since that is the part that makes the rest of the
product trustworthy.

---

## 1. The two halves

The repository holds two programs that share a source registry and
nothing else.

**The application** is a Next.js 15 App Router site. It is mostly static:
the explanatory plates are generated at build time, and the two routes
that show ingested data revalidate every ten minutes.

**The worker** is a plain Node service. It reads sources on a schedule,
normalises what it finds, writes rows to Postgres, and rewrites a
snapshot file that the application can fall back on. It has its own
Prisma client, its own TypeScript configuration and no dependency on
Next.

They share exactly one module: `src/lib/sources.ts`, the source registry.
That is deliberate. The source table published on `/updates` and the list
the worker actually polls are the same list, so the disclosure cannot
drift from the behaviour.

```
                    src/lib/sources.ts
                     (the registry)
                   /                 \
                  /                   \
        worker/ (reads them)      app/ (discloses them)
              |
              v
   normalize -> classify -> summarise -> dedupe
              |
       +------+-------+
       |              |
    Postgres      snapshot.json
       |              |
       +------+-------+
              |
      src/lib/updates/repository.ts
              |
        UpdatePanel / API routes
```

## 2. The ingestion pipeline

### 2.1 Fetching

Every request in the system goes through `worker/scrapers/http.ts`. One
entry point means one user agent, one timeout, one retry policy, and one
place to add a rate limit if a publisher asks for one. Being polite by
construction beats being polite by each adapter remembering.

Three behaviours there are worth stating:

- **4xx responses are not retried.** The request is either wrong or
  unwelcome; repeating it is pointless and rude. Only 5xx, 429 and 408
  back off and try again, at 1.2s then 3.6s.
- **Feed requests do not advertise `text/html`.** Several publishers
  content-negotiate on `Accept` and will serve a human landing page, or a
  cookie-consent interstitial, to any client claiming to accept HTML.
  This was diagnosed the hard way: a perfectly valid feed was arriving as
  an unparseable web page.
- **Non-XML bodies on a feed request are a retryable error.** That
  recovers from the intermittent consent-page case and, when a feed URL
  has genuinely stopped being a feed, produces a message saying exactly
  that instead of a sax error about line 13.

### 2.2 Adapters

| Kind | Adapter | Notes |
| --- | --- | --- |
| `RSS` / `ATOM` | `scrapers/rss.ts` | The majority of sources |
| `JSON_API` | `scrapers/arxiv.ts` | arXiv's documented public API; no scraping |
| `NEWS_SEARCH` | `scrapers/googleNews.ts` | Reaches the Indian long tail; credits the originating publisher |
| `HTML` | `scrapers/html.ts` | Only where a publisher offers no feed |

The HTML adapter is built heuristic-first with a short selector override
table, rather than as the usual per-site selector set that breaks
silently at the next redesign. It prefers a heading element inside a card
— a page that marks its headline up as a heading has told us where the
headline is — and requires a path segment beneath `/news` or `/blog` so a
section's own hero card is not ingested as an article.

`scrapers/headline.ts` handles a specific and common failure: index pages
run the category chip, the date and the headline together in one anchor,
sometimes with no separator at all. The date in that string is not noise
to be trimmed; it is the publication date the page failed to mark up
machine-readably. The module extracts it, hands it back for use, and
returns the remainder as the headline.

### 2.3 Normalisation

`worker/pipeline/normalize.ts` enforces the product's hard constraints on
data we do not control.

- **Emoji removal** covers pictographs, regional indicator pairs,
  skin-tone modifiers, ZWJ sequences and variation selectors, and
  deliberately leaves mathematical and currency symbols alone — those
  appear legitimately in research headlines and in Indian funding
  coverage.
- **URL canonicalisation** lowercases the host, drops the fragment,
  strips seventeen tracking parameters and sorts the query, so the same
  article arriving through three campaign links deduplicates to one row.
  The SHA-256 of that canonical URL is the only deduplication key.
- **Date parsing** returns `null` rather than an epoch fallback for
  unparseable input, and rejects dates more than a day in the future.
  Either would pin an item permanently to the top of a date-ordered feed.

### 2.4 Classification

`worker/pipeline/classify.ts` is a keyword rule set, not a model. The
taxonomy has seven classes, the field's vocabulary is narrow and stable,
and when an item lands in the wrong column the reason is a line you can
read. `Classifier` marks the seam an LLM-backed implementation would slot
into without touching any caller.

Rules are ordered by how specific their vocabulary is rather than how
common the topic is, which is why "Series B" is a rule and "quantum
computer" is not. Preprints are recognised structurally from their
source, because a paper title reads exactly like a hardware headline.

The same module decides **which lens** an item belongs to. A publisher's
nationality is the default, but not the whole story: when an
international trade title reports on the National Quantum Mission, that
belongs under India. Signals are word-bounded — a substring match on
"india" also matches Indiana — and the threshold is asymmetric: one
signal in the headline suffices, two are needed in the body, so a global
story mentioning India once in passing is not relocated.

### 2.5 Summarisation

`worker/pipeline/summarise.ts` may emit only one short line whose job is
to tell the reader whether the link is worth following. Without a model
in the loop that is a compression rather than a paraphrase, so the
constraints are structural: one sentence, a 180-character cap, feed
boilerplate and arXiv preambles stripped, word-boundary truncation only.

Returning `null` is a first-class outcome. An item whose description is
missing, too short, or a restatement of its own headline is dropped
rather than shown padded.

### 2.6 Ranking

Two rules, both added because the first version of the feed was
unreadable without them.

1. **Known dates rank above first sightings.** Undated headlines scraped
   from company index pages carry today's timestamp, and without this
   they swept every dated item off the top of the panel. Items dated from
   first sighting are marked with a tilde in the interface rather than
   disguised.
2. **No source holds more than four slots** in a region's opening window.
   A newsroom posting six investor notices in a morning was becoming the
   entire visible feed. Overflow is appended rather than discarded, so
   the full page keeps its depth.

### 2.7 Scheduling

`worker/index.ts` runs every three hours in UTC. The timezone is pinned
so a server timezone change cannot silently shift when sources are read.
An overlap guard stops a slow run — one source timing out through its
three retries will do it — from having a second concurrent pass started
on top of it. A tick that throws is logged and swallowed; the next tick
is three hours away and should still happen.

## 3. Storage and the snapshot

Three tables: `sources`, `update_items`, `ingestion_log`. Region is an
enum rather than a tag because the product treats India as a first-class
lens. The run log exists so the panel's "last synced" line is a fact read
from the database rather than a value the client invents, and runs are
logged whether or not they succeed — a log containing only successes
cannot tell you ingestion has been failing for two days.

Every run also writes `src/content/updates.snapshot.json`. It is a cache,
not a second source of truth: built from the same normalised items in the
same run, and never hand-edited. It exists so the application renders a
real panel with no Postgres attached, and so a reader is never shown an
empty panel because a worker somewhere is down.

## 4. Reading, in the application

`src/lib/updates/repository.ts` is the only way anything reads the feed.
Two backends behind one interface:

- `DATABASE_URL` set → live rows, `origin: "database"`
- unset, **or the query throws**, **or the table is empty** → snapshot,
  `origin: "snapshot"`

A database blip should cost the panel its freshness, not take the landing
page down. Which backend answered is reported in the interface, so a
reader is never quietly looking at stale data believing it is live.

Both backends apply the same ordering, so switching between them does not
reorder the feed.

## 5. Rendering

Pages are React Server Components. The Update Panel is server-rendered
with real data and that data is handed to SWR as its fallback, so the
panel paints filled on first byte and client refreshes only ever replace
content already on screen.

The 3D layer enters the application through exactly one module,
`components/3d/lazy.tsx`. three.js, react-three-fiber and drei are
together the largest dependency in the product; loading them through
`next/dynamic` with SSR disabled keeps them out of every server render
and out of the initial route bundle, so a route showing no scene pays
nothing for the capability.

`SceneFrame` centralises four concerns so no individual scene can forget
them: the render loop is deferred until the frame is near the viewport,
reduced motion swaps the entire canvas for a static substitute rather
than slowing it, the Suspense boundary shows a themed calibration state,
and the canvas carries a text alternative because a WebGL surface is
opaque to assistive technology.

## 6. Testing

- **Unit** (Vitest): the ingestion pipeline, the quantum maths, the
  circuit layout. The pipeline is testable without a network or a
  database because `ingestSource` returns items rather than persisting
  them.
- **End-to-end** (Playwright): three projects — desktop, mobile, and a
  dedicated reduced-motion project that asserts every 3D scene is
  actually replaced rather than merely slowed. The emoji constraint is
  asserted by scanning every route's rendered text on every run.
- **Visual** (`scripts/capture.mjs`): headless render of a route with
  console errors reported. Scenes cannot be asserted on meaningfully in a
  unit test, so this is how they get checked. It found a GLSL precision
  mismatch that silently prevented the particle shader from ever linking.
