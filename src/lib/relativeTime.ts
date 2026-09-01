/**
 * Relative timestamps for the update feed.
 *
 * Written by hand rather than pulled from a formatting library because
 * the panel needs a compact register - "4h", "3d" - that Intl's
 * RelativeTimeFormat does not produce, and because the values must be
 * identical on the server and on the client to avoid a hydration
 * mismatch on every single row.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Compact form for the feed rows. `now` is injectable so the value is
 * deterministic in tests and so a server render and the client's first
 * paint can agree on a single reference instant.
 */
export function compactRelative(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';

  const delta = now - then;

  // Clock skew between a publisher and this machine regularly produces a
  // small negative delta. Reporting "in 3 minutes" for something already
  // published reads as a bug, so anything inside a minute is "now".
  if (delta < MINUTE) return 'now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h`;
  if (delta < WEEK) return `${Math.floor(delta / DAY)}d`;
  if (delta < 52 * WEEK) return `${Math.floor(delta / WEEK)}w`;
  return `${Math.floor(delta / (52 * WEEK))}y`;
}

/** Long form for tooltips and the accessible label on each timestamp. */
export function absoluteLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
}

/** "Last synced" line beneath the panel header. */
export function syncLabel(iso: string | null, now: number = Date.now()): string {
  if (!iso) return 'Never synced';
  return `Synced ${compactRelative(iso, now)} ago`;
}
