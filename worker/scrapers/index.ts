import type { SourceDefinition } from '../../src/lib/sources';
import type { Scraper } from '../types';
import { scrapeArxiv } from './arxiv';
import { scrapeGoogleNews } from './googleNews';
import { scrapeHtml } from './html';
import { scrapeRss } from './rss';

/**
 * Adapter resolution. arXiv is dispatched by slug rather than by kind
 * because its API returns Atom but needs its own field handling; every
 * other source is dispatched purely by how it is read.
 */
export function scraperFor(source: SourceDefinition): Scraper {
  if (source.slug === 'arxiv-quant-ph') return scrapeArxiv;

  switch (source.kind) {
    case 'RSS':
    case 'ATOM':
    case 'JSON_API':
      return scrapeRss;
    case 'NEWS_SEARCH':
      return scrapeGoogleNews;
    case 'HTML':
      return scrapeHtml;
  }
}

export { scrapeArxiv, scrapeGoogleNews, scrapeHtml, scrapeRss };
