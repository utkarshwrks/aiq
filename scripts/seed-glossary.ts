import { PrismaClient, Prisma } from '@prisma/client';
import { GLOSSARY, glossarySlug } from '../src/content/glossary';

/**
 * Mirrors the authored glossary into Postgres and installs the index
 * that makes full-text search worth having.
 *
 * The authored file stays the source of truth. This is a projection of
 * it, safe to drop and rebuild, and re-runnable: terms are upserted by
 * slug and anything no longer in the file is deleted, so the table can
 * never drift into holding entries no reviewer has seen.
 */

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (!process.env['DATABASE_URL']) {
    console.error('[seed] DATABASE_URL is not set; nothing to seed');
    process.exitCode = 1;
    return;
  }

  // A GIN index over the same weighted document the query builds. Without
  // it Postgres re-computes every row's tsvector on every search, which
  // is survivable at this size and indefensible at any other.
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS glossary_terms_document_idx
    ON glossary_terms USING GIN ((
      setweight(to_tsvector('english', coalesce(term, '')), 'A') ||
      setweight(to_tsvector('english', coalesce("aliasText", '')), 'B') ||
      setweight(to_tsvector('english', coalesce(definition, '')), 'C')
    ))
  `;

  for (const entry of GLOSSARY) {
    const aliases = [...(entry.aliases ?? [])];
    const data = {
      term: entry.term,
      definition: entry.definition,
      aliases,
      // Kept in lockstep with `aliases`; see the schema for why the
      // joined form is stored rather than computed in the index.
      aliasText: aliases.join(' '),
      category: entry.category,
    };
    const slug = glossarySlug(entry.term);
    await prisma.glossaryTerm.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }

  const slugs = GLOSSARY.map((entry) => glossarySlug(entry.term));
  const removed = await prisma.glossaryTerm.deleteMany({
    where: { slug: { notIn: slugs } },
  });

  console.warn(
    `[seed] glossary synced: ${GLOSSARY.length} upserted, ${removed.count} removed`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('[seed] failed', error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());

export type { Prisma };
