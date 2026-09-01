import Parser from 'rss-parser';
import type { RawItem, Scraper } from '../types';
import { fetchText } from './http';

/**
 * The RSS and Atom adapter, which handles twenty of the thirty-one
 * sources. Feeds are fetched through the shared HTTP layer rather than
 * by rss-parser's own client so that every request in the system carries
 * the same user agent, timeout and retry policy.
 */

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

type ParsedItem = {
  title?: string | undefined;
  link?: string | undefined;
  guid?: string | undefined;
  isoDate?: string | undefined;
  pubDate?: string | undefined;
  contentSnippet?: string | undefined;
  content?: string | undefined;
  contentEncoded?: string | undefined;
  summary?: string | undefined;
  creator?: string | undefined;
  author?: string | undefined;
};

/**
 * Feeds disagree about which field holds the description. Preference
 * runs from the shortest, cleanest field to the longest, because the
 * summariser has a hard character cap and starting from a full article
 * body wastes the budget on the first paragraph's throat-clearing.
 */
function pickSummary(item: ParsedItem): string | undefined {
  return (
    item.contentSnippet ??
    item.summary ??
    item.content ??
    item.contentEncoded ??
    undefined
  );
}

/**
 * Some feeds put the canonical link in guid and leave link empty, or
 * emit a relative link. Both are common enough to handle explicitly.
 */
function pickUrl(item: ParsedItem, base: string): string | undefined {
  const candidate = item.link ?? item.guid;
  if (!candidate) return undefined;
  try {
    return new URL(candidate, base).toString();
  } catch {
    return undefined;
  }
}

export const scrapeRss: Scraper = async (source) => {
  const xml = await fetchText(source.endpoint);
  const feed = await parser.parseString(xml);

  const items: RawItem[] = [];

  for (const entry of feed.items as ParsedItem[]) {
    const url = pickUrl(entry, source.homepage);
    const title = entry.title?.trim();
    if (!url || !title) continue;

    items.push({
      title,
      summary: pickSummary(entry),
      url,
      publishedAt: entry.isoDate ?? entry.pubDate,
      byline: entry.creator ?? entry.author,
    });
  }

  return items;
};
