import { getSource } from '../src/lib/sources';
import { scraperFor } from './scrapers';

/**
 * Reads named sources and reports what each returned.
 *
 *   npm run ingest:probe -- ibm-research pib-science
 *
 * Exists because "the run says four sources failed" is not a diagnosis.
 * This prints the actual error or the actual first headline, per source,
 * without touching the database or the snapshot.
 */
async function main(): Promise<void> {
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) {
    console.warn('usage: npm run ingest:probe -- <slug> [slug...]');
    return;
  }

  for (const slug of slugs) {
    const source = getSource(slug);
    if (!source) {
      console.warn(`${slug}: not in the registry`);
      continue;
    }

    try {
      const items = await scraperFor(source)(source);
      console.warn(
        `${slug}: ok items=${items.length} first="${items[0]?.title?.slice(0, 70) ?? '-'}"`,
      );
    } catch (error) {
      console.warn(
        `${slug}: FAILED ${(error as Error).message.slice(0, 200)}`,
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error('[probe] failed', error);
  process.exit(1);
});
