'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_LETTERS,
  SORTED_GLOSSARY,
  type GlossaryEntry,
} from '@/content/glossary';
import { cn } from '@/lib/cn';

/**
 * The glossary index.
 *
 * Search runs entirely client-side over the full term list. That is the
 * right call at this size: forty-odd entries is a few kilobytes, and
 * shipping them means results appear as the reader types with no request
 * and no loading state. A server-backed search would be slower and worse
 * for a corpus this small; it becomes the right answer somewhere in the
 * high hundreds of entries.
 *
 * Matching is scored rather than boolean so that a query matching a term
 * outranks one matching only a definition, which is what a reader
 * expects when they type a word they already half-know.
 */

const CATEGORY_TONE = {
  concept: 'teal',
  hardware: 'violet',
  algorithm: 'teal',
  'error-correction': 'amber',
  metric: 'neutral',
  programme: 'amber',
} as const;

function score(entry: GlossaryEntry, query: string): number {
  const term = entry.term.toLowerCase();
  const aliases = entry.aliases?.map((a) => a.toLowerCase()) ?? [];

  if (term === query) return 100;
  if (aliases.includes(query)) return 95;
  if (term.startsWith(query)) return 80;
  if (aliases.some((alias) => alias.startsWith(query))) return 70;
  if (term.includes(query)) return 60;
  if (aliases.some((alias) => alias.includes(query))) return 50;
  if (entry.definition.toLowerCase().includes(query)) return 20;
  if (entry.note?.toLowerCase().includes(query)) return 15;
  return 0;
}

export function GlossaryIndex() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryEntry['category'] | 'all'>('all');
  const input = useRef<HTMLInputElement | null>(null);

  // Deferred so a fast typist is never blocked by the list re-rendering.
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const needle = deferred.trim().toLowerCase();
    const scoped =
      category === 'all'
        ? SORTED_GLOSSARY
        : SORTED_GLOSSARY.filter((entry) => entry.category === category);

    if (needle.length === 0) return scoped;

    return scoped
      .map((entry) => ({ entry, score: score(entry, needle) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.term.localeCompare(b.entry.term))
      .map((result) => result.entry);
  }, [deferred, category]);

  const grouped = useMemo(() => {
    // Alphabetical grouping only makes sense for an unfiltered list; once
    // results are ranked by relevance, imposing A-Z headings on them
    // would be actively misleading about the order.
    if (deferred.trim().length > 0) return null;

    const map = new Map<string, GlossaryEntry[]>();
    for (const entry of results) {
      const letter = entry.term.replace(/^\W+/, '')[0]!.toUpperCase();
      const bucket = map.get(letter);
      if (bucket) bucket.push(entry);
      else map.set(letter, [entry]);
    }
    return [...map.entries()];
  }, [results, deferred]);

  return (
    <div>
      {/* --- Controls --------------------------------------------------- */}
      <div className="sticky top-14 z-[var(--z-sticky)] -mx-[var(--shell-gutter)] border-b border-hairline bg-deep/92 px-[var(--shell-gutter)] py-4 backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terms, aliases and definitions"
              aria-label="Search the glossary"
              aria-describedby="glossary-count"
              className={cn(
                'w-full border border-hairline bg-inset py-2.5 pl-10 pr-10',
                'font-mono text-[length:var(--text-sm)] text-ink',
                'placeholder:text-ink-faint',
                'rounded-[var(--radius-sm)]',
                'transition-colors duration-[var(--dur-fast)]',
                'focus:border-teal focus:outline-none',
              )}
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  input.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint transition-colors duration-[var(--dur-fast)] hover:text-teal"
              >
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter by category"
            className="flex flex-wrap gap-1.5"
          >
            {(['all', ...Object.keys(GLOSSARY_CATEGORIES)] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={category === key}
                onClick={() =>
                  setCategory(key as GlossaryEntry['category'] | 'all')
                }
                className={cn(
                  'border px-2.5 py-1.5',
                  'font-mono text-[length:var(--text-2xs)] uppercase tracking-[0.1em]',
                  'rounded-[var(--radius-sm)]',
                  'transition-colors duration-[var(--dur-fast)]',
                  category === key
                    ? 'border-teal text-teal'
                    : 'border-hairline text-ink-faint hover:border-hairline-strong hover:text-ink-muted',
                )}
              >
                {key === 'all'
                  ? 'All'
                  : GLOSSARY_CATEGORIES[key as GlossaryEntry['category']]}
              </button>
            ))}
          </div>
        </div>

        <p
          id="glossary-count"
          aria-live="polite"
          className="data mt-3 text-[length:var(--text-2xs)] uppercase tracking-[0.12em] text-ink-faint"
        >
          {results.length} {results.length === 1 ? 'term' : 'terms'}
          {deferred.trim().length > 0 && ' / ranked by relevance'}
        </p>
      </div>

      {/* --- A to Z rail ------------------------------------------------ */}
      {grouped && (
        <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap gap-1">
          {GLOSSARY_LETTERS.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex size-7 items-center justify-center border border-hairline font-mono text-[length:var(--text-2xs)] text-ink-muted transition-colors duration-[var(--dur-fast)] hover:border-teal hover:text-teal"
            >
              {letter}
            </a>
          ))}
        </nav>
      )}

      {/* --- Results ---------------------------------------------------- */}
      {results.length === 0 ? (
        <div className="cg-grid cg-grid-fine mt-10 flex min-h-[16rem] flex-col items-center justify-center gap-3 border border-hairline text-center">
          <p className="label-caps">No term resolves</p>
          <p className="max-w-sm text-[length:var(--text-sm)] text-ink-muted">
            Nothing in the index matches that query. Try a shorter fragment, or
            clear the category filter.
          </p>
        </div>
      ) : grouped ? (
        <div className="mt-10 space-y-12">
          {grouped.map(([letter, entries]) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-40">
              <div className="mb-5 flex items-center gap-5">
                <h2 className="data text-[length:var(--text-2xl)] leading-none text-ink-faint">
                  {letter}
                </h2>
                <div aria-hidden className="cg-rule flex-1" />
              </div>
              <dl className="grid gap-px border border-hairline bg-hairline md:grid-cols-2">
                {entries.map((entry) => (
                  <Entry key={entry.term} entry={entry} />
                ))}
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <dl className="mt-10 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
          {results.map((entry) => (
            <Entry key={entry.term} entry={entry} />
          ))}
        </dl>
      )}
    </div>
  );
}

function Entry({ entry }: { entry: GlossaryEntry }) {
  return (
    <div
      id={`term-${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      className="scroll-mt-40 bg-surface p-6"
    >
      {/* dt and dd must be direct children of the div that groups them
          inside a dl. Wrapping the term and its chip in a further div
          detaches the dt from the list, which is both invalid and
          announced incorrectly. */}
      <dt className="flex flex-wrap items-baseline justify-between gap-3 text-[length:var(--text-lg)] text-ink">
        <span>{entry.term}</span>
        <Tag tone={CATEGORY_TONE[entry.category]} swatch>
          {GLOSSARY_CATEGORIES[entry.category]}
        </Tag>
      </dt>

      <dd className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
        {entry.definition}
      </dd>

      {entry.note && (
        <dd className="mt-4 border-l border-amber/40 pl-4 text-[length:var(--text-sm)] leading-relaxed text-ink-muted">
          <span className="label-caps !text-amber/80">Often mis-stated</span>
          <span className="mt-1.5 block">{entry.note}</span>
        </dd>
      )}

      {entry.see && entry.see.length > 0 && (
        <dd className="mt-4 flex flex-wrap items-center gap-2">
          <span className="label-caps">See</span>
          {entry.see.map((term) => (
            <a
              key={term}
              href={`#term-${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="font-mono text-[length:var(--text-2xs)] text-teal underline decoration-teal/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:decoration-teal"
            >
              {term}
            </a>
          ))}
        </dd>
      )}
    </div>
  );
}
