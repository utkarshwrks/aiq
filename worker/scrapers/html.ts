import * as cheerio from 'cheerio';
import type { RawItem, Scraper } from '../types';
import { extractHeadlineAndDate } from './headline';
import { fetchText } from './http';

/**
 * The HTML index adapter, used only for the eleven publishers that offer
 * no feed of any kind.
 *
 * A per-site CSS selector set is a maintenance liability - it breaks
 * silently on the next redesign - so this adapter is built the other way
 * round: a structural heuristic first, with a small selector override
 * table for the handful of sites the heuristic reads badly. When a site
 * changes, the heuristic usually still finds the links, and the override
 * table stays short enough to actually maintain.
 *
 * This adapter reads the same index page a reader would, takes only the
 * headline and the link, and never follows through to article bodies.
 */

type Override = {
  /** Container for one item. */
  item: string;
  /** Link within the container, or the container itself when it is the anchor. */
  link?: string;
  title?: string;
  date?: string;
};

const OVERRIDES: Record<string, Override> = {
  'ionq-news': { item: 'a[href*="/news/"]' },
  'rigetti-news': { item: 'a[href*="/news/"]' },
  'quantinuum-news': { item: 'a[href*="/news/"]' },
  'dwave-newsroom': { item: 'a[href*="/news/"]' },
  'psiquantum-news': { item: 'a[href*="/news/"]' },
  'pasqal-news': { item: 'a[href*="/news"]' },
  'xanadu-blog': { item: 'a[href*="/blog/"]' },
  'qnu-labs': { item: 'a[href*="/blog"]' },
  'iit-madras-press': { item: 'a[href*="press"]' },
  'ibm-research': { item: 'a[href^="/blog/"]' },
};

/**
 * Link text that is navigation rather than content. Checked by exact
 * match after normalisation, so a headline containing the word "news" is
 * not discarded.
 */
const NAVIGATION_TEXT = new Set([
  'news',
  'blog',
  'all news',
  'read more',
  'learn more',
  'view all',
  'see all',
  'more',
  'next',
  'previous',
  'home',
  'about',
  'contact',
  'careers',
  'press',
  'newsroom',
  'media',
  'events',
  'resources',
]);

function isPlausibleHeadline(text: string): boolean {
  const normalised = text.trim().replace(/\s+/g, ' ');
  if (normalised.length < 24 || normalised.length > 220) return false;
  if (NAVIGATION_TEXT.has(normalised.toLowerCase())) return false;
  // A headline has words. A breadcrumb or a date does not.
  return normalised.split(' ').length >= 4;
}

export const scrapeHtml: Scraper = async (source) => {
  const html = await fetchText(source.endpoint);
  const $ = cheerio.load(html);

  const override = OVERRIDES[source.slug];
  const selector = override?.item ?? 'article a, li a, h2 a, h3 a';

  const seen = new Set<string>();
  const items: RawItem[] = [];

  $(selector).each((_, element) => {
    const node = $(element);
    const anchor = override?.link ? node.find(override.link).first() : node;
    const href = (anchor.is('a') ? anchor : node.find('a').first()).attr('href');
    if (!href) return;

    let parsed: URL;
    try {
      parsed = new URL(href, source.endpoint);
    } catch {
      return;
    }

    // A section landing page - /news, /blog - is navigation, not an
    // article. Requiring a path segment beneath it is what keeps the
    // section's own hero card out of the feed.
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return;

    const url = parsed.toString();
    if (seen.has(url)) return;

    // Prefer a heading inside the card. An index page that marks its
    // headline up as a heading has told us where the headline is, and
    // taking the whole anchor's text instead would glue the category
    // chip and the date onto the front of it.
    const heading = node.find('h1, h2, h3, h4, h5').first();
    const rawTitle = (
      override?.title
        ? node.find(override.title).first().text()
        : heading.length > 0
          ? heading.text()
          : node.text()
    );

    const { headline, date: inlineDate } = extractHeadlineAndDate(rawTitle);
    if (!isPlausibleHeadline(headline)) return;

    seen.add(url);

    // A machine-readable datetime is authoritative where one exists. The
    // date recovered from the card text is the fallback, and leaving the
    // field undefined is the last resort - the pipeline then dates the
    // item from first sighting rather than inventing a publication date.
    const markedUpDate =
      node.find('time').first().attr('datetime') ??
      node.find('time').first().text().trim() ??
      undefined;

    items.push({
      title: headline,
      url,
      publishedAt: markedUpDate || inlineDate?.toISOString() || undefined,
      // Index pages give a headline and a link. Anything more would mean
      // following through to the article body, which this adapter does
      // not do.
      summary: undefined,
    });
  });

  // Index pages list a lot of links. Taking the leading slice keeps a
  // redesign that breaks the heuristic from flooding the panel.
  return items.slice(0, 25);
};
