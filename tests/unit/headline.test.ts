import { describe, expect, it } from 'vitest';
import { extractHeadlineAndDate } from '../../worker/scrapers/headline';

describe('extractHeadlineAndDate', () => {
  it('separates a leading chip and date from the headline', () => {
    const result = extractHeadlineAndDate(
      'Business Nov 24, 2025 Aramco and Pasqal deploy a quantum computer',
    );
    expect(result.headline).toBe('Aramco and Pasqal deploy a quantum computer');
    expect(result.date?.getUTCFullYear()).toBe(2025);
    expect(result.date?.getUTCMonth()).toBe(10);
    expect(result.date?.getUTCDate()).toBe(24);
  });

  it('handles a date fused onto the end of a headline', () => {
    const result = extractHeadlineAndDate(
      'How to Implement Post-Quantum CryptographyAugust 17, 2026',
    );
    expect(result.headline).toBe('How to Implement Post-Quantum Cryptography');
    expect(result.date?.getUTCMonth()).toBe(7);
  });

  it('reads day-first dates', () => {
    const result = extractHeadlineAndDate('24 November 2025 A milestone reached');
    expect(result.headline).toBe('A milestone reached');
    expect(result.date?.getUTCDate()).toBe(24);
  });

  it('reads ISO-like dates', () => {
    const result = extractHeadlineAndDate('2025-11-24 A milestone reached');
    expect(result.date?.getUTCFullYear()).toBe(2025);
  });

  it('builds dates at UTC noon so a timezone shift cannot move the day', () => {
    const result = extractHeadlineAndDate('Nov 24, 2025 Something happened');
    expect(result.date?.getUTCHours()).toBe(12);
  });

  it('leaves a headline with no date untouched', () => {
    const result = extractHeadlineAndDate('A perfectly ordinary headline here');
    expect(result.headline).toBe('A perfectly ordinary headline here');
    expect(result.date).toBeNull();
  });

  it('does not mistake an invalid date for a real one', () => {
    const result = extractHeadlineAndDate('Nov 45, 2025 Something happened');
    expect(result.date).toBeNull();
  });

  it('collapses whitespace', () => {
    expect(extractHeadlineAndDate('  spaced    out   headline  ').headline).toBe(
      'spaced out headline',
    );
  });
});
