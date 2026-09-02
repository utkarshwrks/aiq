import { describe, expect, it } from 'vitest';
import { configured, SITE } from '@/lib/site';

/**
 * Environment resolution.
 *
 * These exist because of a real production failure: NEXT_PUBLIC_SITE_URL
 * was declared on the host but left blank, `??` passed the empty string
 * through, and `new URL('')` in the root layout's metadataBase failed the
 * build during page collection - before any page rendered, with an error
 * that named neither the variable nor the file.
 */

describe('configured', () => {
  it('treats a present but empty variable as absent', () => {
    expect(configured('')).toBeUndefined();
    expect(configured('   ')).toBeUndefined();
  });

  it('treats an unset variable as absent', () => {
    expect(configured(undefined)).toBeUndefined();
  });

  it('returns a real value, trimmed', () => {
    expect(configured('https://example.com')).toBe('https://example.com');
    expect(configured('  https://example.com  ')).toBe('https://example.com');
  });
});

describe('SITE.url', () => {
  it('is always a parseable absolute URL', () => {
    // metadataBase does exactly this at build time. If it throws here, the
    // production build fails during page collection.
    expect(() => new URL(SITE.url)).not.toThrow();
  });

  it('has no trailing slash, so joined paths do not double up', () => {
    expect(SITE.url.endsWith('/')).toBe(false);
  });
});
