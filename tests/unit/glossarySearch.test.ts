import { describe, expect, it } from 'vitest';
import { localSearch } from '@/lib/glossary/search';
import { glossarySlug } from '@/content/glossary';

/**
 * The no-database search path.
 *
 * This is the only search that exists when the site runs without
 * Postgres, which is a supported configuration, so its ranking rules are
 * worth pinning down rather than leaving to the end-to-end suite to
 * notice indirectly.
 */

describe('glossarySlug', () => {
  it('derives a stable slug from a term', () => {
    expect(glossarySlug('CNOT gate')).toBe('cnot-gate');
    expect(glossarySlug('T1 / T2')).toBe('t1-t2');
  });

  it('does not leave leading or trailing separators', () => {
    expect(glossarySlug('|0> state')).toBe('0-state');
  });
});

describe('localSearch', () => {
  it('returns nothing for an empty query rather than everything', () => {
    expect(localSearch('')).toEqual([]);
    expect(localSearch('   ')).toEqual([]);
  });

  it('ranks an exact term match first', () => {
    const hits = localSearch('qubit');
    expect(hits[0]?.term).toBe('Qubit');
  });

  it('matches an alias as well as the headword', () => {
    const hits = localSearch('qkd');
    expect(hits[0]?.term).toBe('Quantum key distribution');
  });

  it('ranks a term match above a definition-only match', () => {
    const hits = localSearch('decoherence');
    expect(hits[0]?.term).toBe('Decoherence');
    // Other entries legitimately mention decoherence in their bodies.
    expect(hits.length).toBeGreaterThan(1);
    expect(hits[0]!.rank).toBeGreaterThan(hits[1]!.rank);
  });

  it('returns an empty list for a term that is not in the corpus', () => {
    expect(localSearch('zzzznotaterm')).toEqual([]);
  });

  it('carries a slug that matches the one derived from the term', () => {
    const hits = localSearch('entanglement');
    for (const hit of hits) {
      expect(hit.slug).toBe(glossarySlug(hit.term));
    }
  });
});
