import { main } from './run';

/**
 * Thin executable wrapper. run.ts stays importable by the scheduler and
 * by tests without either of them triggering a process exit.
 */
main().catch((error: unknown) => {
  console.error('[ingest] run failed', error);
  process.exit(1);
});
