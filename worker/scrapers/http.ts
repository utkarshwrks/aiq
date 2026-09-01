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

function backoff(attempt: number): number {
  // 500ms, 1500ms, 4500ms. Enough to ride out a brief upstream blip
  // without holding the scheduler open for a source that is properly down.
  return 500 * 3 ** (attempt - 1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchText(url: string): Promise<string> {
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

      return await response.text();
    } catch (error) {
      lastError = error;

      const status = error instanceof FetchError ? error.status : undefined;
      const retryable =
        status === undefined || status >= 500 || status === 429 || status === 408;

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
