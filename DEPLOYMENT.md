# Deployment

Two deployable units: the Next.js application and the ingestion worker.
They can be deployed independently, and the application functions with
the worker switched off entirely.

---

## 1. The application

### Vercel

1. Import the repository. Vercel detects Next.js; no build settings need
   changing.
2. Set environment variables (Project → Settings → Environment
   Variables):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for metadata and the sitemap |
   | `DATABASE_URL` | Optional | Without it the committed snapshot is served and reported as such |

3. Deploy.

`prisma generate` runs through the `postinstall` hook, so no custom build
command is needed.

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
