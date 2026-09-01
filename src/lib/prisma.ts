import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * Next's dev server re-evaluates modules on every edit, so a client
 * constructed at module scope would leak a connection pool per reload
 * until Postgres refused new connections. Stashing it on globalThis in
 * development is the standard remedy; production gets a fresh client per
 * process, which is what it should have.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Whether a database is configured at all. The product is designed to
 * run without one - the Update Panel falls back to the last ingested
 * snapshot committed to the repository - so this is checked rather than
 * assumed at every entry point that touches storage.
 */
export function hasDatabase(): boolean {
  const url = process.env['DATABASE_URL'];
  return typeof url === 'string' && url.length > 0;
}
