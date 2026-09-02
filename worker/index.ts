import cron from 'node-cron';
import { runIngestion } from './run';
import { disconnect } from './persist';

/**
 * The ingestion scheduler.
 *
 * Runs every three hours, which sits in the middle of the two-to-four
 * hour window the brief specifies and, more to the point, is polite:
 * research feeds do not change faster than that, and reading thirty
 * publishers eight times a day is already generous to ourselves.
 *
 * The schedule is expressed in UTC so a server timezone change cannot
 * silently shift when sources are read.
 */

// Present-but-empty is not configured; see the note in src/lib/site.ts.
// An empty INGEST_CRON would otherwise fail cron.validate and stop the
// scheduler from ever starting.
const SCHEDULE = process.env['INGEST_CRON']?.trim() || '0 */3 * * *';
const TIMEZONE = 'Etc/UTC';

let running = false;

/**
 * Guards against overlap. If a run is slow - one source timing out three
 * times will do it - the next tick must not start a second concurrent
 * pass over the same sources.
 */
async function tick(): Promise<void> {
  if (running) {
    console.warn('[scheduler] previous run still in progress, skipping tick');
    return;
  }

  running = true;
  try {
    const report = await runIngestion();
    console.warn(
      `[scheduler] kept=${report.stored} seen=${report.seen} failed=${report.failed.length}`,
    );
  } catch (error) {
    // A thrown scheduler tick must not take the process down; the next
    // tick is three hours away and should still happen.
    console.error('[scheduler] run threw', error);
  } finally {
    running = false;
  }
}

function shutdown(signal: string): void {
  console.warn(`[scheduler] ${signal} received, shutting down`);
  void disconnect().finally(() => process.exit(0));
}

export function start(): void {
  if (!cron.validate(SCHEDULE)) {
    throw new Error(`[scheduler] INGEST_CRON is not a valid expression: ${SCHEDULE}`);
  }

  console.warn(`[scheduler] starting, schedule="${SCHEDULE}" tz=${TIMEZONE}`);

  cron.schedule(SCHEDULE, () => void tick(), { timezone: TIMEZONE });

  // Run once at boot so a freshly deployed worker does not leave the
  // panel stale until the next scheduled tick.
  void tick();

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
