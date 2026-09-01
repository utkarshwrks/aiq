# Resume point

**Status at pause:** the project builds, all checks pass, and everything
is committed and pushed to `origin/main`. Nothing is half-edited. You can
run it right now with `npm install && npm run dev`.

This file exists so work can be picked up exactly where it stopped. Read
section 3 first — that is the list of what is left.

---

## 1. Verified state at the pause

| Check | Command | Result |
| --- | --- | --- |
| Application typecheck | `npx tsc --noEmit` | clean |
| Worker typecheck | `npx tsc --noEmit -p worker/tsconfig.json` | clean |
| Lint | `npm run lint` | no warnings or errors |
| Unit tests | `npm test` | 70 passed |
| End-to-end tests | `npm run test:e2e` | 110 passed, 4 skipped (viewport-conditional), 0 failed |
| Production build | `npm run build` | 15 routes, all generated |
| Lighthouse desktop | performance 98, accessibility 100, best practices 96, SEO 100 |
| Lighthouse mobile | performance 96, accessibility 100, best practices 96, SEO 100 |
| axe (WCAG 2.1 AA) | all nine content routes | zero violations |

Last commit at pause: `perf(3d): gate the three.js chunk from outside the
dynamic import`.

## 2. What is complete

Everything in the brief except the four items in section 3.

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

## 3. What is left

Four items, in the order they should be done. Each states the exact
symptom, the file to change, and how to verify.

### 3.1 Hydration mismatch on relative timestamps — **highest priority**

**Symptom.** The browser console logs `Minified React error #418` (text
content mismatch) on `/` and `/updates`. Lighthouse best practices sits
at 96 because of it. Nothing is visibly broken, but React discards the
server-rendered markup for those subtrees and re-renders on the client.

**Cause.** Relative timestamps are computed from `Date.now()` during both
the server render and the client's first render, and the two differ.
Three call sites:

- `src/components/marketing/HeroDeck.tsx` — `syncLabel(stats.lastSyncedAt)`
- `src/components/panels/UpdatePanel.tsx` — `const now = useMemo(() => Date.now(), [feed])`
- `src/components/panels/UpdateRow.tsx` — receives `now` from the panel

**Fix.** Have the server supply the reference instant so the first client
render matches, then correct it after mount.

1. Add `src/hooks/useNow.ts`:

   ```ts
   'use client';
   import { useEffect, useState } from 'react';

   /**
    * Returns the server's reference instant until the component has
    * mounted, then the client's own clock, refreshed on an interval.
    * Using Date.now() during render makes the server and client disagree
    * on every timestamp, which discards the server markup.
    */
   export function useNow(serverNow: number, intervalMs = 60_000): number {
     const [now, setNow] = useState(serverNow);
     useEffect(() => {
       setNow(Date.now());
       const id = window.setInterval(() => setNow(Date.now()), intervalMs);
       return () => window.clearInterval(id);
     }, [intervalMs]);
     return now;
   }
   ```

2. Add a `now: number` prop to `HeroDeck` and `UpdatePanel`; pass
   `Date.now()` from the server components in `src/app/page.tsx` and
   `src/app/updates/page.tsx`.
3. Replace the `useMemo(() => Date.now(), [feed])` in `UpdatePanel` with
   `useNow(now)`, and use the same value in `HeroDeck`'s `syncLabel`
   call.

**Verify.** `node scripts/capture.mjs http://localhost:3000/ /tmp/x.png`
must print `no console errors or warnings`, and Lighthouse best practices
should reach 100.

### 3.2 Missing favicon produces a 404

**Symptom.** One `404` network request on every page load, reported by
Lighthouse.

**Fix.** Add `src/app/icon.svg` — the compass rose from
`src/components/ui/CompassRose.tsx`, on a `#0A0F14` ground, teal stroke,
32x32 viewBox. Next serves it as the favicon automatically. Optionally
add `src/app/apple-icon.png` at 180x180.

**Verify.** No 404 in `scripts/capture.mjs` output.

### 3.3 Navigation button accessible name does not contain its visible text

**Symptom.** axe's `label-content-name-mismatch` fires on the mobile
navigation button. It does not currently fail the suite because that rule
is best-practice rather than WCAG AA, but it is a real defect: voice
control users say what they see.

**Cause.** `src/components/layout/SiteHeader.tsx` — the button's visible
text is `Index` while its `aria-label` is `Open navigation`.

**Fix.** Change the label to `Open index` / `Close index` so the
accessible name contains the visible string. The e2e specs reference
`{ name: 'Open navigation' }` in two places and must be updated with it:
`tests/e2e/navigation.spec.ts` and `tests/e2e/accessibility.spec.ts`.

**Verify.** `npm run test:e2e` stays green and the axe rule clears.

### 3.4 Framer Motion and GSAP are declared but unused

**Symptom.** Both are in `package.json` dependencies; neither is imported
anywhere. They add nothing to the bundle (they are not imported, so they
are not bundled) but they are a maintenance liability and the brief names
both.

**Decision to implement.** Use Framer Motion for the one thing the brief
asks for that is genuinely missing — page transitions that "feel like a
map redrawing", which currently do not exist at all. Remove GSAP and
record the reasoning.

1. Add `src/components/layout/PageTransition.tsx`, a client component
   using `AnimatePresence` keyed on `usePathname()`. The transition
   should be a short opacity and 8px vertical settle on
   `var(--ease-instrument)` at `var(--dur-base)` — a redraw, not a slide.
   Wrap `{children}` in `src/app/layout.tsx` with it.
2. It must be inert under reduced motion: read `useReducedMotion()` from
   `src/hooks/useReducedMotion.ts` and render children directly when it
   returns true.
3. `npm uninstall gsap`, and add a DECISIONS.md entry: the single
   scroll-driven sequence in this product is transform-only and
   rAF-driven at a fraction of ScrollTrigger's cost, and ScrollTrigger's
   value is in complex timelines this product does not have.

**Verify.** `npm run build`, then `npm run test:e2e` — the reduced-motion
project must still pass, since it asserts content is present rather than
merely still.

## 4. Optional, not required by the brief

- Meilisearch for the glossary. Not needed at 45 entries; the client-side
  scored search is faster. Revisit somewhere in the high hundreds.
- Redis. The seam and the environment variable exist; see DECISIONS.md
  entry 11 for why it is not wired.
- Visual regression snapshots for the 3D scenes. `scripts/capture.mjs`
  covers this manually today.
- An Open Graph image. `metadata.openGraph` has no `images` entry, so
  link previews currently show text only.

## 5. How to pick this up

```bash
cd /Users/utkarshkushwaha/Desktop/Projects/aiuf
git pull
npm install
npm run dev
```

Then work section 3 top to bottom. After each item:

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
