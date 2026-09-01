/**
 * The single HTTP entry point for every adapter.
 *
 * Centralising the fetch is what makes the ingestion polite by
 * construction rather than by each adapter remembering to be: one
 * identifying user agent that a publisher can block or contact us about,
 * one timeout, one retry policy with backoff, and one place to add a
 * rate limit if a source ever asks for one.
 */

const USER_AGENT =
  'AIQuantumOS-ingest/0.1 (+https://aiquantumos.com/about#sourcing)';

const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;

export class FetchError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Thrown when a request succeeds but the body is not the kind of
 * document the caller asked for. This is a real and common failure: some
 * publishers intermittently answer a feed URL with a cookie-consent
 * page, and others quietly turn a feed into an HTML index after a
 * redesign. Both produce a 200 and an unparseable feed, and both deserve
 * a message that says so rather than a sax error about line 13.
 */
export class ContentShapeError extends FetchError {
  constructor(url: string, expected: string, received: string) {
    super(`${url} returned ${received} where ${expected} was expected`);
    this.name = 'ContentShapeError';
  }
}

const XML_PROLOGUE = /^\s*(<\?xml|<rss|<rdf:RDF|<feed|<!DOCTYPE\s+rss)/i;

function looksLikeXml(body: string): boolean {
  // A byte order mark ahead of the prologue is common enough to allow.
  return XML_PROLOGUE.test(body.replace(/^\uFEFF/, ''));
}

export type FetchOptions = {
  /**
   * 'xml' makes a non-XML body a retryable failure, which recovers from
   * publishers that intermittently interpose a consent page and gives a
   * clear diagnosis when a feed URL has genuinely stopped being a feed.
   */
  expect?: 'xml' | 'any';
};

function backoff(attempt: number): number {
  // 500ms, 1500ms, 4500ms. Enough to ride out a brief upstream blip
  // without holding the scheduler open for a source that is properly down.
  return 500 * 3 ** (attempt - 1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchText(
  url: string,
  options: FetchOptions = {},
): Promise<string> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
          Accept:
            'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.5',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        // 4xx means the request is wrong or we are unwelcome; retrying
        // is both pointless and rude. Only 5xx and 429 are retried.
        if (
          response.status < 500 &&
          response.status !== 429 &&
          response.status !== 408
        ) {
          throw new FetchError(
            `${url} responded ${response.status}`,
            response.status,
          );
        }
        throw new FetchError(
          `${url} responded ${response.status}`,
          response.status,
        );
      }

      const body = await response.text();

      if (options.expect === 'xml' && !looksLikeXml(body)) {
        throw new ContentShapeError(
          url,
          'a feed',
          body.trimStart().startsWith('<') ? 'an HTML page' : 'a non-XML body',
        );
      }

      return body;
    } catch (error) {
      lastError = error;

      const status = error instanceof FetchError ? error.status : undefined;
      const retryable =
        error instanceof ContentShapeError ||
        status === undefined ||
        status >= 500 ||
        status === 429 ||
        status === 408;

      if (!retryable || attempt === MAX_ATTEMPTS) break;
      await sleep(backoff(attempt));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new FetchError(`${url} failed for an unknown reason`);
}
