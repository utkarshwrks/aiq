'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the server's reference instant until the component has
 * mounted, then the client's own clock, refreshed on an interval.
 *
 * Calling Date.now() during render makes the server and the client
 * disagree on every timestamp they format, which makes React discard the
 * server markup for those subtrees and re-render them. Taking the
 * instant from the server for the first paint and correcting it in an
 * effect keeps the two renders identical and still keeps the feed's
 * relative times honest for a reader who leaves the tab open.
 */
export function useNow(serverNow: number, intervalMs = 60_000): number {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
