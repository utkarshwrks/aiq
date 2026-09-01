import Parser from 'rss-parser';
import type { RawItem, Scraper } from '../types';
import { fetchText } from './http';

/**
 * arXiv adapter.
 *
 * arXiv publishes a documented public API, so there is no scraping here
 * at all - which is exactly why it is the first source in the registry.
 * The API returns Atom, with the abstract in the summary element and the
 * authors in repeated author/name elements.
 *
 * The API's terms ask for no more than one request every three seconds;
 * the scheduler reads this source once per run, well inside that.
 */

const parser = new Parser({
  customFields: {
    item: [['published', 'published']],
  },
});

type AtomEntry = {
  title?: string | undefined;
  link?: string | undefined;
  id?: string | undefined;
  summary?: string | undefined;
  contentSnippet?: string | undefined;
  published?: string | undefined;
  isoDate?: string | undefined;
  creator?: string | undefined;
  author?: string | undefined;
};

/**
 * arXiv titles are wrapped across lines in the source Atom, so the
 * newlines have to go before the title is compared or displayed.
 */
function flatten(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

export const scrapeArxiv: Scraper = async (source) => {
  const xml = await fetchText(source.endpoint, { expect: 'xml' });
  const feed = await parser.parseString(xml);

  const items: RawItem[] = [];

  for (const entry of feed.items as AtomEntry[]) {
    const title = entry.title ? flatten(entry.title) : undefined;
    // The abs link is the human-readable landing page; entry.id is the
    // canonical arXiv URI and is what we want readers sent to.
    const url = entry.link ?? entry.id;
    if (!title || !url) continue;

    items.push({
      title,
      summary: entry.summary ?? entry.contentSnippet,
      url,
      publishedAt: entry.isoDate ?? entry.published,
      byline: entry.creator ?? entry.author,
    });
  }

  return items;
};
