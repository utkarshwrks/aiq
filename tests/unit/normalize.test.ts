import { describe, expect, it } from 'vitest';
import {
  canonicaliseUrl,
  cleanText,
  parseDate,
  stripEmoji,
  urlHash,
} from '../../worker/pipeline/normalize';

describe('stripEmoji', () => {
  it('removes pictographs from a headline', () => {
    expect(stripEmoji('Quantum leap 🚀 announced')).toBe(
      'Quantum leap  announced',
    );
  });

  it('removes flag sequences and skin tone modifiers', () => {
    expect(stripEmoji('India 🇮🇳 leads')).toBe('India  leads');
    expect(stripEmoji('team 👍🏽 ships')).toBe('team  ships');
  });

  it('removes zero-width-joined compound emoji entirely', () => {
    // A family glyph is several pictographs joined by ZWJ; leaving the
    // joiner behind would render as a stray invisible character.
    expect(stripEmoji('crew 👨‍👩‍👧 arrives').replace(/\s+/g, ' ')).toBe(
      'crew arrives',
    );
  });

  it('leaves mathematical and currency symbols alone', () => {
    // These occur legitimately in research headlines and in Indian
    // funding coverage; stripping them would corrupt real content.
    expect(stripEmoji('Cost ≈ O(n²) at ₹6,003 crore')).toBe(
      'Cost ≈ O(n²) at ₹6,003 crore',
    );
  });
});

describe('cleanText', () => {
  it('strips markup, decodes entities and normalises quotes', () => {
    expect(cleanText('<p>IBM&rsquo;s <b>roadmap</b> &amp; targets</p>')).toBe(
      "IBM's roadmap & targets",
    );
  });

  it('removes script and style content rather than exposing it', () => {
    expect(cleanText('<script>alert(1)</script>Real headline')).toBe(
      'Real headline',
    );
  });

  it('returns an empty string for null and undefined', () => {
    expect(cleanText(null)).toBe('');
    expect(cleanText(undefined)).toBe('');
  });
});

describe('canonicaliseUrl', () => {
  it('drops tracking parameters and the fragment', () => {
    expect(
      canonicaliseUrl(
        'https://example.com/post?utm_source=x&id=7&fbclid=abc#section',
      ),
    ).toBe('https://example.com/post?id=7');
  });

  it('normalises host, scheme and trailing slash', () => {
    expect(canonicaliseUrl('http://WWW.Example.com/post/')).toBe(
      'https://example.com/post',
    );
  });

  it('orders query parameters so equivalent links hash alike', () => {
    expect(canonicaliseUrl('https://example.com/a?b=2&a=1')).toBe(
      canonicaliseUrl('https://example.com/a?a=1&b=2'),
    );
  });
});

describe('urlHash', () => {
  it('gives one identity to the same article behind different campaigns', () => {
    const a = urlHash('https://example.com/story?utm_campaign=newsletter');
    const b = urlHash('https://www.example.com/story/');
    expect(a).toBe(b);
  });

  it('distinguishes different articles', () => {
    expect(urlHash('https://example.com/a')).not.toBe(
      urlHash('https://example.com/b'),
    );
  });
});

describe('parseDate', () => {
  it('parses RFC 822 and ISO 8601', () => {
    expect(parseDate('Wed, 02 Oct 2024 08:00:00 GMT')?.getUTCFullYear()).toBe(
      2024,
    );
    expect(parseDate('2024-10-02T08:00:00Z')?.getUTCFullYear()).toBe(2024);
  });

  it('returns null rather than an epoch fallback for junk', () => {
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  it('rejects dates far in the future', () => {
    // A future-dated item would pin itself permanently to the top of a
    // feed ordered by publication date.
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(parseDate(future.toISOString())).toBeNull();
  });
});
