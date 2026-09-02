# Deployment

Two deployable units: the Next.js application and the ingestion worker.
They can be deployed independently, and the application functions with
the worker switched off entirely.

---

## 1. The application

### Vercel

`vercel.json` sets the framework, the install and build commands, and
cache headers for the icon and the self-hosted fonts. It deliberately
does **not** pin a region: single-region placement differs by plan, and
an India-facing product wants `bom1` (Mumbai), which is set once in
Project Settings > Functions rather than in the file, where it would fail
a deploy on a plan that does not allow it.

No environment variable is required to deploy. With none set, the build
succeeds and the site serves the committed ingestion snapshot - which is
the intended preview-deployment experience. `prisma generate` runs
without `DATABASE_URL` present; only `prisma db push` and the seed need a
live database.


1. Import the repository. Vercel detects Next.js; no build settings need
   changing.
2. Set environment variables (Project → Settings → Environment
   Variables):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for metadata and the sitemap. Set it once the production domain is known; until then the fallback in `src/lib/site.ts` is used |
   | `DATABASE_URL` | Optional | Without it the committed snapshot is served and reported as such |
   | `REDIS_URL` | Optional | Caches the composed feed and glossary search for five minutes. Pointless without `DATABASE_URL`, since the snapshot path is not cached |

3. Deploy.

`vercel.json` runs `prisma generate` explicitly before `next build`. The
`postinstall` hook does the same thing, but Vercel restores a cached
`node_modules` on most builds and skips install scripts when it does, so
the generate step cannot be left to it alone.

**The feed will read "Committed snapshot" until a worker is running.**
That is correct behaviour, not a broken deployment: Vercel hosts the
application only. The ingestion worker is a long-running process with a
cron schedule and cannot run as a serverless function - see section 3.

**Note on `DATABASE_URL` and serverless.** If you point the application at
Postgres, use a pooled connection string. Serverless functions open a
connection per invocation, and a direct connection string will exhaust
Postgres' connection limit under any real traffic. Supabase, Neon and RDS
Proxy all provide a pooled endpoint; use that one for the application and
the direct one for migrations.

### Any Node host

```bash
npm ci
npm run build
npm start          # listens on PORT, default 3000
```

Node 20 or later.

## 2. The database

Required only if you want live rows rather than the snapshot.

```bash
export DATABASE_URL="postgresql://user:password@host:5432/aiquantumos"
npm run db:generate
npm run db:push          # or: npx prisma migrate deploy
```

`db:push` is appropriate for a first deployment. Once the schema is live
and carrying data, use migrations:

```bash
npx prisma migrate dev --name <change>   # authoring, locally
npx prisma migrate deploy                # applying, in an environment
```

Postgres 14 or later. The schema is small; the `update_items` table grows
by a few hundred rows per day and is pruned to a 180-day horizon on every
run.

Then seed the glossary mirror, which also installs the GIN index that
full-text search reads:

```bash
npm run db:seed:glossary
```

Re-run it after any edit to `src/content/glossary.ts`. It upserts by slug
and deletes anything no longer in the file, so it is safe to run at every
deploy; wiring it into your release step is the reliable option.

## 2b. Redis

Optional. Set `REDIS_URL` on both the application and the worker and the
composed feed, the ingestion stats and glossary search results are cached
for five minutes; the worker drops those keys at the end of each run so
new items appear immediately rather than at the end of the TTL.

```bash
export REDIS_URL="rediss://default:password@host:6379"
```

Leave it unset and every read goes to Postgres, or to the committed
snapshot. A configured but unreachable Redis is logged and read through -
it will not take the site down. Any managed Redis works; the cache holds
a few kilobytes and needs no persistence, since everything in it is
derived and re-derivable.

## 3. The ingestion worker

The worker is a long-running Node process, not a serverless function: it
holds a cron schedule and an overlap guard across ticks.

### Railway or Render

1. New service from the same repository.
2. Build command: `npm ci && npm run db:generate`
3. Start command: `npm run worker`
4. Environment:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | Yes | Use the **direct** connection string, not the pooled one |
   | `INGEST_CRON` | No | Defaults to `0 */3 * * *`, evaluated in UTC |

The worker runs one pass immediately at boot, so a fresh deployment does
not leave the panel stale until the next scheduled tick.

### A VPS with systemd

```ini
# /etc/systemd/system/aiquantumos-worker.service
[Unit]
Description=AIQuantumOS ingestion worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/srv/aiquantumos
EnvironmentFile=/srv/aiquantumos/.env
ExecStart=/usr/bin/npm run worker
Restart=always
RestartSec=30
User=aiquantumos

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now aiquantumos-worker
journalctl -u aiquantumos-worker -f
```

### As a scheduled job instead

If you would rather not run a persistent process, the one-shot entry
point is safe to invoke from any external scheduler:

```bash
npm run ingest
```

It is idempotent — deduplication is enforced by a unique constraint on
the URL hash — so an accidental double invocation stores nothing twice.

## 4. Keeping the snapshot current

The snapshot in the repository is what the application serves when no
database is attached. To refresh it:

```bash
npm run ingest
git add src/content/updates.snapshot.json
git commit -m "chore(content): refresh the ingestion snapshot"
```

Worth doing periodically even when running with a database, so preview
deployments and fresh clones stay current.

## 5. Verifying a deployment

```bash
curl -s https://<host>/api/stats | jq
# -> lastSyncedAt, totalItems, sourceCount, feedSourceCount, origin

curl -s "https://<host>/api/updates?limit=3" | jq '.global[0]'
curl -sI https://<host>/robots.txt
```

`origin` is the field to check: `"database"` means live rows,
`"snapshot"` means the committed fallback is being served.

Then, from a checkout:

```bash
npm run typecheck        # application and worker
npm test                 # unit suite
npm run test:e2e         # builds and exercises the real site
```

## 6. Operational notes

- **A failing source is not an outage.** Each source's outcome is
  recorded individually and the run continues. Check `ingestion_log`, or
  `npm run ingest:probe -- <slug>` for a specific diagnosis.
- **A run where every source failed** exits non-zero, which is the signal
  worth alerting on. Individual failures are not.
- **Feeds change.** Publishers redesign and feed paths break. The probe
  script prints exactly what a source returned, and the fetch layer
  reports "returned an HTML page where a feed was expected" rather than a
  parser error, which is usually the whole diagnosis.
- **Rate limiting.** Sources are read sequentially, once per run, with a
  politeness floor per source. If a publisher asks for a lower cadence,
  raise `minInterval` in the registry.
