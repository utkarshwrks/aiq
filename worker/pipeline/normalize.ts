import { createHash } from 'node:crypto';

/**
 * Normalisation is where the product's hard constraints are enforced on
 * data we do not control. Everything ingested passes through here before
 * it can reach the database, so no downstream component has to trust an
 * upstream publisher's formatting.
 */

/**
 * Emoji removal.
 *
 * The product carries no emoji anywhere, and a scraped headline is the
 * one place they can enter against our wishes. This covers the pictograph
 * block, regional indicator pairs, skin-tone modifiers, the zero-width
 * joiner sequences that compose multi-person glyphs, variation selectors,
 * and the keycap combiner - which together account for essentially every
 * emoji a publisher will emit.
 *
 * Deliberately does not touch mathematical or currency symbols: those
 * appear legitimately in quantum research headlines.
 */
const EMOJI_PATTERN = new RegExp(
  [
    '[\\u{1F000}-\\u{1FAFF}]', // pictographs, supplemental symbols
    '[\\u{1F1E6}-\\u{1F1FF}]', // regional indicators
    '[\\u{2600}-\\u{27BF}]', // misc symbols and dingbats
    '[\\u{2B00}-\\u{2BFF}]', // arrows and geometric extras
    '[\\u{FE00}-\\u{FE0F}]', // variation selectors
    '[\\u{1F3FB}-\\u{1F3FF}]', // skin tone modifiers
    '\\u{200D}', // zero-width joiner
    '\\u{20E3}', // combining keycap
    '\\u{2049}', // exclamation question mark
    '\\u{203C}', // double exclamation
  ].join('|'),
  'gu',
);

export function stripEmoji(input: string): string {
  return input.replace(EMOJI_PATTERN, '');
}

/** Common HTML entities seen in feed titles, resolved without a parser. */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
  '&ndash;': '-',
  '&mdash;': '-',
  '&hellip;': '...',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
};

export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(
      /&[a-zA-Z#0-9]+;/g,
      (entity) => ENTITIES[entity.toLowerCase()] ?? entity,
    );
}

/** Removes markup from feed descriptions, which frequently carry HTML. */
export function stripTags(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

/**
 * Collapses whitespace, normalises the several dash and quote characters
 * publishers use interchangeably, and trims. Typographic quotes are
 * folded to straight ones so the panel's monospaced register stays even.
 */
export function normaliseText(input: string): string {
  return input
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—―]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The full cleaning pipeline applied to any string from a source. */
export function cleanText(input: string | undefined | null): string {
  if (!input) return '';
  return normaliseText(stripEmoji(decodeEntities(stripTags(input))));
}

/**
 * Canonicalises a URL for deduplication: lowercases the host, drops the
 * fragment, strips tracking parameters, and removes a trailing slash. Two
 * links to the same article through different campaigns must hash alike,
 * otherwise the panel shows the same story three times.
 */
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'source',
  'ncid',
  'at_medium',
  'at_campaign',
];

export function canonicaliseUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    url.protocol = 'https:';

    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }
    url.searchParams.sort();

    let path = url.pathname;
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    url.pathname = path;

    return url.toString();
  } catch {
    // A malformed URL still needs a stable identity so it can be
    // deduplicated; falling back to the trimmed original is enough.
    return raw.trim();
  }
}

/** SHA-256 of the canonical URL. The sole deduplication key. */
export function urlHash(raw: string): string {
  return createHash('sha256').update(canonicaliseUrl(raw)).digest('hex');
}

/**
 * Parses the several date formats feeds emit. Returns null rather than
 * an epoch fallback: an item whose date cannot be read is better dropped
 * than shown at the top of a feed ordered by date.
 */
export function parseDate(input: string | undefined | null): Date | null {
  if (!input) return null;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;

  // Guard against feeds that emit dates far in the future, which would
  // pin a single item permanently to the top of the panel.
  const oneDayAhead = Date.now() + 24 * 60 * 60 * 1000;
  if (parsed.getTime() > oneDayAhead) return null;

  return parsed;
}
