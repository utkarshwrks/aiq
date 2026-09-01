import { describe, expect, it } from 'vitest';
import {
  classify,
  isQuantumRelevant,
  regionFor,
} from '../../worker/pipeline/classify';

describe('classify', () => {
  it('recognises preprint sources structurally, not by vocabulary', () => {
    // A paper title reads exactly like a hardware headline, so the
    // source decides.
    expect(
      classify('Superconducting qubit coherence improvements', '', 'arxiv-quant-ph'),
    ).toBe('RESEARCH_PAPER');
  });

  it('picks funding over industry when both vocabularies appear', () => {
    expect(
      classify(
        'QpiAI raises Series B in partnership with investors',
        '',
        'inc42',
      ),
    ).toBe('FUNDING');
  });

  it('classifies policy from mission and ministry vocabulary', () => {
    expect(
      classify('National Quantum Mission expands to new institutions', '', 'the-hindu-science'),
    ).toBe('POLICY');
  });

  it('classifies hardware from modality vocabulary', () => {
    expect(
      classify('Trapped ion processor reaches new gate fidelity', '', 'ionq-news'),
    ).toBe('HARDWARE');
  });

  it('falls back to industry rather than throwing on unmatched text', () => {
    expect(classify('An announcement', '', 'quantum-insider')).toBe('INDUSTRY');
  });
});

describe('isQuantumRelevant', () => {
  it('accepts items using the field vocabulary', () => {
    expect(isQuantumRelevant('New qubit design', '')).toBe(true);
    expect(isQuantumRelevant('Post-quantum migration guide', '')).toBe(true);
  });

  it('rejects general technology items', () => {
    expect(isQuantumRelevant('Startup raises funding for delivery app', '')).toBe(
      false,
    );
  });
});

describe('regionFor', () => {
  it('keeps an Indian publisher in the India lens', () => {
    expect(regionFor('Anything at all', '', 'INDIA')).toBe('INDIA');
  });

  it('moves a global item to India on a single headline signal', () => {
    expect(
      regionFor('IISc opens quantum computing hub', 'A new facility', 'GLOBAL'),
    ).toBe('INDIA');
  });

  it('does not move a global item on one passing body mention', () => {
    expect(
      regionFor(
        'IBM announces new processor',
        'Customers in Europe, India and Japan will get access.',
        'GLOBAL',
      ),
    ).toBe('GLOBAL');
  });

  it('moves a global item on two distinct body signals', () => {
    expect(
      regionFor(
        'New quantum partnership announced',
        'The National Quantum Mission and IIT Madras will collaborate.',
        'GLOBAL',
      ),
    ).toBe('INDIA');
  });

  it('does not treat Indiana as India', () => {
    expect(
      regionFor('Indiana University opens quantum lab', '', 'GLOBAL'),
    ).toBe('GLOBAL');
  });
});
