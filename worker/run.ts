import { ALL_SOURCES, type SourceDefinition } from '../src/lib/sources';
import { ingestAll } from './pipeline/ingest';
import {
  databaseConfigured,
  disconnect,
  knownHashes,
  logRun,
  pruneOlderThan,
  storeItems,
  syncSources,
} from './persist';
import { buildSnapshot, writeSnapshot } from './snapshot';
import { invalidateFeedCache } from './cache';

/**
 * One ingestion run, invokable from the CLI or from the scheduler.
 *
 *   npm run ingest              read every source, persist, write snapshot
 *   npm run ingest -- --dry     read every source, write nothing
 *   npm run ingest -- --only=arxiv-quant-ph,pib-science
 *
 * The dry run exists because the first question when a source misbehaves
 * is "what is it actually returning", and answering that should not
 * require a database or leave rows behind.
 */

/** Items past this age are dropped from storage on each run. */
const RETENTION_DAYS = 180;

export type RunOptions = {
  dry?: boolean;
  only?: readonly string[];
};

export type RunReport = {
  startedAt: Date;
  sources: number;
  seen: number;
  stored: number;
  skipped: number;
  failed: string[];
  persisted: boolean;
};

function selectSources(only?: readonly string[]): SourceDefinition[] {
  if (!only || only.length === 0) return [...ALL_SOURCES];
  const wanted = new Set(only);
  return ALL_SOURCES.filter((source) => wanted.has(source.slug));
}

export async function runIngestion(options: RunOptions = {}): Promise<RunReport> {
  const startedAt = new Date();
  const sources = selectSources(options.only);
  const persisting = !options.dry && databaseConfigured();

  if (persisting) {
    await syncSources();
  }

  const known = persisting ? await knownHashes() : new Set<string>();
  const { results, items } = await ingestAll(sources, { known });

  let stored = 0;
  if (persisting) {
    stored = await storeItems(items);
    await logRun(startedAt, results, stored);
    const pruned = await pruneOlderThan(RETENTION_DAYS);
    if (pruned > 0) {
      console.warn(`[ingest] pruned ${pruned} items past retention`);
    }
  }

  // The snapshot is written on any non-dry run, database or not. It is
  // what keeps the panel populated in environments with no Postgres.
  if (!options.dry) {
    await writeSnapshot(buildSnapshot(items));
  }

  return {
    startedAt,
    sources: sources.length,
    seen: results.reduce((total, result) => total + result.seen, 0),
    stored: persisting ? stored : items.length,
    skipped: results.reduce((total, result) => total + result.skipped, 0),
    failed: results.filter((result) => !result.ok).map((result) => result.slug),
    persisted: persisting,
  };
}

function parseArgs(argv: readonly string[]): RunOptions {
  const dry = argv.includes('--dry');
  const onlyArg = argv.find((arg) => arg.startsWith('--only='));
  const only = onlyArg?.slice('--only='.length).split(',').filter(Boolean);
  return { dry, ...(only ? { only } : {}) };
}

/** Entry point when the module is executed rather than imported. */
export async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const started = Date.now();

  try {
    const report = await runIngestion(options);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);

    console.warn(
      [
        `[ingest] ${options.dry ? 'dry run' : 'run'} complete in ${seconds}s`,
        `sources=${report.sources}`,
        `seen=${report.seen}`,
        `kept=${report.stored}`,
        `skipped=${report.skipped}`,
        `persisted=${report.persisted}`,
        report.failed.length > 0
          ? `failed=[${report.failed.join(', ')}]`
          : 'failed=[]',
      ].join(' '),
    );

    // A run in which every source failed is a failure, not a quiet
    // success with an empty result set.
    if (report.failed.length === report.sources) {
      process.exitCode = 1;
    }

    // Rows are on disk; drop the warm feed so readers see them now
    // rather than at the end of the TTL. Never after a dry run, which
    // wrote nothing.
    if (!options.dry && report.persisted) {
      await invalidateFeedCache();
    }
  } finally {
    await disconnect();
  }
}
