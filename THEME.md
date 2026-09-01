# The Cartographer theme

The design language of AIQuantumOS, and the rules that keep it coherent.

---

## The idea

A scientific cartographer's instrument desk. Not literally a parchment
atlas — the reference point is a research vessel's navigation console
that happens to sit in a quantum laboratory. Topographic contour banding,
coordinate graticules, survey brackets, compass bearings, and every
numeral set as though it were a coordinate on a chart.

The consequence that matters most is a negative one: **this product has
no marketing surfaces.** There is no centred hero, no pill button, no
gradient card, and nothing is centre-aligned that could be set flush
left. An instrument panel is read, not pitched at.

## Tokens

Everything lives in `src/styles/theme.css` as a custom property. Nothing
downstream may hardcode a colour, a duration or an easing curve. Tailwind
utilities are bridged to those properties with `@theme inline`, so
`theme.css` stays authoritative at runtime rather than being inlined at
build time.

### Surfaces

| Token | Value | Use |
| --- | --- | --- |
| `--cg-bg-deep` | `#0A0F14` | Page ground |
| `--cg-bg-surface` | `#10171D` | Cards, feed rows |
| `--cg-bg-elevated` | `#17212A` | Hover states, raised panels |
| `--cg-bg-inset` | `#0D1319` | Recessed areas, canvas backgrounds |

The four steps are deliberately close together. Contrast comes from
hairlines, not from luminance jumps or drop shadows.

### Structure

| Token | Use |
| --- | --- |
| `--cg-line-grid` | Coordinate gridlines |
| `--cg-line-hairline` | The default border throughout |
| `--cg-line-hairline-strong` | Tick marks, registration brackets |
| `--cg-line-contour` | Topographic banding |

**There are no shadows in this product.** Structure is 1px rules. If a
border is not enough to separate two things, they are in the wrong
places.

### Ink

`--cg-ink` for primary text, `--cg-ink-muted` for body copy,
`--cg-ink-faint` for labels and metadata.

### Accents

| Token | Meaning | Discipline |
| --- | --- | --- |
| `--cg-accent-teal` | Quantum state, energy, live signal | The working accent |
| `--cg-accent-amber` | The cartographer's compass; warnings, corrections, the India lens | **At most one use per viewport** |
| `--cg-accent-violet` | Entanglement, secondary relationships, correlation | Paired with teal |

Amber's rationing is the rule most easily broken and the one that most
visibly cheapens the palette when it is.

### Radii

`2px`, `3px`, `4px`. That is the entire scale. Instruments do not have
pill buttons, and 4px is used sparingly.

### Motion

| Token | Curve | Use |
| --- | --- | --- |
| `--ease-instrument` | `cubic-bezier(0.22, 1, 0.36, 1)` | Everything that settles |
| `--ease-instrument-in` | `cubic-bezier(0.64, 0, 0.78, 0)` | Exits |
| `--ease-linear-sweep` | `cubic-bezier(0.4, 0, 0.6, 1)` | Continuous, looping motion |

Durations: `90ms` / `180ms` / `320ms` / `560ms` / `1200ms`.

**No bounce, no elastic, no overshoot.** A precision instrument settles.

Under `prefers-reduced-motion`, every duration collapses to 1ms in
`theme.css` itself rather than at each call site, so no component can
forget to honour it — and every 3D scene swaps to a static substitute in
React.

## Typography

| Face | Role |
| --- | --- |
| Space Grotesk | Display and headings |
| JetBrains Mono | Every numeral, label, coordinate, code fragment |
| Inter | Body prose |

All three are self-hosted through `next/font`. No third-party font
request sits on the critical path and there is no swap-induced layout
shift.

The rule worth stating: **anything measurable is monospaced.** Counts,
timestamps, coordinates, probabilities, qubit numbers, plate numbers. The
`.data` utility applies tabular, slashed-zero figures so a column of
numbers aligns the way it would on a chart.

`.label-caps` is the small-caps monospaced label used above every value
and beside every section marker.

## The four motifs

Declared in `src/styles/motifs.css`, all drawn with repeating gradients
rather than SVG or raster assets, so the recurring background grammar
costs zero network requests and one paint.

1. **The coordinate grid** — `.cg-grid`, `.cg-grid-fine`,
   `.cg-grid-masked`. Fine sub-cells inside coarse cells, radially masked
   so the centre of a panel stays readable.
2. **Topographic contours** — `.cg-contours`, `.cg-contours-offset`,
   `.cg-contours-drift`. Circular rings flattened by a `scaleY` on the
   drift layer. *Not* elliptical gradients: a repeating radial gradient
   with an ellipse shape elongates its rings as the radius grows, and the
   result is a bowtie interference figure rather than elevation banding.
   Drift is transform-only and never attached under reduced motion.
3. **Hairlines and ticks** — `.cg-rule`, `.cg-ticks`, `.cg-ticks-major`,
   `.cg-bracket`. The bracket is a corner registration mark, as on a
   survey plate.
4. **Data numerals** — `.data`, `.label-caps`.

## Components that carry the identity

- **`CompassRose`** — bearing ring, cardinal spurs, north needle. The
  header mark, every section marker, and the core of the loading state.
- **`CalibrationLoader`** — there is no spinner anywhere in this product.
  A deferred scene reports a real, ordered instrument calibration
  sequence.
- **`InstrumentLink`** — the only two action affordances: an underlined
  inline link, and a hairline bracket that fills on hover the way a
  selected chart cell does. Deliberately not a filled pill, which is the
  single strongest tell of a generated SaaS layout.
- **`SectionHeader`** and **`PageShell`** — one opening geometry for
  every section and every route: compass mark, plate number, monospaced
  eyebrow, display title, hairline. Shared geometry is what makes eight
  routes read as one instrument.

## Adding to the system

1. If you need a colour, add a token. Do not write a hex value in a
   component.
2. If you need a transition, use one of the three curves.
3. If you are reaching for a shadow, use a hairline.
4. If the value is a measurement, set it in `.data`.
5. If you are about to centre something, check whether flush left reads
   better. It usually does here.
