import { describe, expect, it } from 'vitest';
import { absoluteLabel, compactRelative, syncLabel } from '@/lib/relativeTime';

const NOW = Date.parse('2026-03-15T12:00:00Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('compactRelative', () => {
  it('uses the compact register the feed rows need', () => {
    expect(compactRelative(ago(5 * MINUTE), NOW)).toBe('5m');
    expect(compactRelative(ago(4 * HOUR), NOW)).toBe('4h');
    expect(compactRelative(ago(3 * DAY), NOW)).toBe('3d');
    expect(compactRelative(ago(21 * DAY), NOW)).toBe('3w');
  });

  it('reports "now" rather than a future time under clock skew', () => {
    // Publisher clocks regularly run ahead of ours; "in 3 minutes" for
    // something already published reads as a bug.
    expect(compactRelative(new Date(NOW + 3 * MINUTE).toISOString(), NOW)).toBe(
      'now',
    );
  });

  it('returns an empty string for an unparseable timestamp', () => {
    expect(compactRelative('nonsense', NOW)).toBe('');
  });
});

describe('syncLabel', () => {
  it('states plainly when nothing has synced', () => {
    expect(syncLabel(null, NOW)).toBe('Never synced');
  });

  it('reports the interval since the last run', () => {
    expect(syncLabel(ago(2 * HOUR), NOW)).toBe('Synced 2h ago');
  });
});

describe('absoluteLabel', () => {
  it('formats in UTC so server and client agree', () => {
    const label = absoluteLabel('2026-03-15T12:00:00Z');
    expect(label).toContain('2026');
    expect(label).toContain('March');
  });

  it('returns an empty string for junk', () => {
    expect(absoluteLabel('nope')).toBe('');
  });
});
