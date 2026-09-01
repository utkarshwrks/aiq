/**
 * Headline and date extraction for HTML index pages.
 *
 * Index pages wrap a whole card in one anchor, so the anchor's text runs
 * together the category chip, the date and the headline:
 *
 *   "Business Nov 24, 2025 Aramco and Pasqal make history with ..."
 *   "How to Implement Post-Quantum CryptographyAugust 17, 2026"
 *
 * Both problems have the same solution. The date is not noise to be
 * trimmed - it is the publication date the index page failed to mark up
 * machine-readably, and it is exactly what the feed ordering needs. So
 * this module pulls the date out, uses it, and returns the remaining
 * text as the headline.
 */

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const MONTH_NAMES = Object.keys(MONTHS).join('|');

/** "Nov 24, 2025" and "November 24 2025". */
const MONTH_FIRST = new RegExp(
  `\\b(${MONTH_NAMES})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`,
  'i',
);

/** "24 November 2025". */
const DAY_FIRST = new RegExp(
  `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_NAMES})\\.?,?\\s+(\\d{4})\\b`,
  'i',
);

/** "2025-11-24" and "2025/11/24". */
const ISO_LIKE = /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/;

export type Extracted = {
  headline: string;
  /** Null when the text carried no recognisable date. */
  date: Date | null;
};

function build(year: number, month: number, day: number): Date | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  // Constructed as UTC noon, so a timezone shift cannot move the date
  // across a day boundary in either direction.
  const date = new Date(Date.UTC(year, month, day, 12));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Finds and removes the first date in the text. Returns the date and the
 * text with it excised; whitespace around the cut is repaired, including
 * the common case of a date fused directly onto the end of a headline.
 */
/**
 * Index pages regularly emit a date immediately after the headline with
 * no separator at all - "...Post-Quantum CryptographyAugust 17, 2026" -
 * because the two sit in adjacent elements that render without a space.
 * A word boundary does not exist between "y" and "A", so the date
 * patterns below cannot see it. Splitting the fused pair first is what
 * makes those dates recoverable.
 *
 * The month must be followed by a day number for the split to apply, so
 * an ordinary word that happens to begin with a capitalised month prefix
 * is left alone.
 */
const FUSED_DATE =
  /([a-z])((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2})/g;

export function extractHeadlineAndDate(input: string): Extracted {
  const text = input.replace(/\s+/g, ' ').replace(FUSED_DATE, '$1 $2').trim();

  const attempts: Array<[RegExp, (m: RegExpMatchArray) => Date | null]> = [
    [
      MONTH_FIRST,
      (m) => build(Number(m[3]), MONTHS[m[1]!.toLowerCase()] ?? -1, Number(m[2])),
    ],
    [
      DAY_FIRST,
      (m) => build(Number(m[3]), MONTHS[m[2]!.toLowerCase()] ?? -1, Number(m[1])),
    ],
    [ISO_LIKE, (m) => build(Number(m[1]), Number(m[2]) - 1, Number(m[3]))],
  ];

  for (const [pattern, toDate] of attempts) {
    const match = text.match(pattern);
    if (!match || match.index === undefined) continue;

    const date = toDate(match);
    if (!date) continue;

    const before = text.slice(0, match.index);
    const after = text.slice(match.index + match[0].length);
    const headline = `${before} ${after}`.replace(/\s+/g, ' ').trim();

    return { headline: tidy(headline), date };
  }

  return { headline: tidy(text), date: null };
}

/**
 * Removes the leading category chip index pages put before a headline,
 * and the separators left behind once a date has been excised from the
 * middle of a run of text.
 */
const LEADING_CHIP =
  /^(business|news|press release|announcement|blog|article|insights?|company|research|events?|media|updates?)\b[\s:|,-]*/i;

function tidy(input: string): string {
  return input
    .replace(LEADING_CHIP, '')
    .replace(/^[\s:|,-]+/, '')
    .replace(/[\s:|,-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
