import Parser from 'rss-parser';
import type { RawItem, Scraper } from '../types';
import { fetchText } from './http';

/**
 * Google News search adapter.
 *
 * Indian quantum coverage is spread thinly across a great many outlets -
 * a mission announcement lands in one national daily, an institute
 * partnership in a trade title, a funding round in a business paper -
 * and no single publisher feed carries enough of it to make the India
 * lens a real view of the ecosystem. A news search feed is the honest
 * way to reach that long tail without maintaining forty adapters.
 *
 * Attribution is the thing to get right. Google News wraps every item's
 * title with the originating publisher and carries that publisher in a
 * source element. This adapter pulls the publisher out and reports it as
 * the item's source, so the panel credits the outlet that did the
 * reporting rather than the aggregator that surfaced it. The registry
 * still records that these arrive via Google News, and the sourcing
 * disclosure says so.
 */

const parser = new Parser({
  customFields: {
    item: [['source', 'sourceTag', { keepArray: false }]],
  },
});

type GoogleNewsEntry = {
  title?: string | undefined;
  link?: string | undefined;
  isoDate?: string | undefined;
  pubDate?: string | undefined;
  contentSnippet?: string | undefined;
  content?: string | undefined;
  sourceTag?: string | { _?: string; $?: { url?: string } } | undefined;
};

/**
 * Titles arrive as "Headline text - Publisher". The separator is a plain
 * hyphen surrounded by spaces, which also occurs inside headlines, so
 * only the final occurrence is treated as the publisher boundary and
 * only when what follows is short enough to be a masthead.
 */
function splitTitle(raw: string): { title: string; publisher?: string } {
  const index = raw.lastIndexOf(' - ');
  if (index === -1) return { title: raw };

  const publisher = raw.slice(index + 3).trim();
  const title = raw.slice(0, index).trim();

  if (publisher.length === 0 || publisher.length > 48 || title.length < 16) {
    return { title: raw };
  }

  return { title, publisher };
}

function publisherFrom(entry: GoogleNewsEntry): string | undefined {
  const tag = entry.sourceTag;
  if (typeof tag === 'string' && tag.trim().length > 0) return tag.trim();
  if (tag && typeof tag === 'object' && typeof tag._ === 'string') {
    return tag._.trim();
  }
  return undefined;
}

export const scrapeGoogleNews: Scraper = async (source) => {
  const xml = await fetchText(source.endpoint, { expect: 'xml' });
  const feed = await parser.parseString(xml);

  const items: RawItem[] = [];

  for (const entry of feed.items as GoogleNewsEntry[]) {
    const rawTitle = entry.title?.trim();
    const url = entry.link;
    if (!rawTitle || !url) continue;

    const { title, publisher } = splitTitle(rawTitle);
    const attributed = publisherFrom(entry) ?? publisher;

    items.push({
      title,
      // The snippet is a list of related-coverage links rather than a
      // description of the article, so it is not used.
      summary: undefined,
      url,
      publishedAt: entry.isoDate ?? entry.pubDate,
      byline: attributed,
    });
  }

  return items;
};
