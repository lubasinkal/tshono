// Rebuilds the Typesense collection from Postgres: upserts every live job, then
// removes index docs that no longer exist. Safe to run any time; the index is
// disposable.
// Run: set -a; . ./.env.production; set +a; bun run scripts/reindex.ts
import { pool } from '../lib/db'
import { toJobDoc, type IndexableJob } from '../server/utils/typesense'

const host = (process.env.TYPESENSE_URL || process.env.NUXT_PUBLIC_SEARCH_HOST || 'ts.lubasiverse.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')
const key = process.env.TYPESENSE_ADMIN_KEY || process.env.TYPESENSE_API_KEY || ''
if (!key) {
  console.error('no Typesense admin key in env')
  process.exit(1)
}
const base = `https://${host}/collections/jobs/documents`
const headers = { 'X-TYPESENSE-API-KEY': key }

const { rows } = await pool.query(`select * from jobs where status = 'live'`)
const docs = (rows as IndexableJob[]).map(toJobDoc)
console.log(`postgres live jobs: ${docs.length}`)

for (let i = 0; i < docs.length; i += 500) {
  const batch = docs.slice(i, i + 500)
  const res = await fetch(`${base}/import?action=upsert`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'text/plain' },
    body: batch.map((d) => JSON.stringify(d)).join('\n'),
  })
  if (!res.ok) {
    console.error('import failed', res.status, (await res.text()).slice(0, 300))
    process.exit(1)
  }
  const lines = (await res.text()).split('\n').filter(Boolean).map((l) => JSON.parse(l))
  const failed = lines.filter((l) => !l.success)
  console.log(`  upserted ${batch.length - failed.length}/${batch.length}`)
  if (failed.length) console.error('  failures:', failed.slice(0, 3))
}

// Drop docs that Postgres no longer has (closed or deleted jobs).
const exportRes = await fetch(`${base}/export`, { headers })
const indexIds = (await exportRes.text()).split('\n').filter(Boolean)
  .map((l) => JSON.parse(l).id as string)
const live = new Set(docs.map((d) => d.id))
const stale = indexIds.filter((id) => !live.has(id))
if (stale.length) {
  const res = await fetch(`${base}?filter_by=${encodeURIComponent(`id:[${stale.map((s) => `\`${s}\``).join(',')}]`)}`, {
    method: 'DELETE',
    headers,
  })
  console.log(`deleted ${stale.length} stale docs`, res.status)
} else {
  console.log('no stale docs')
}

console.log(`index now matches postgres: ${docs.length} live docs`)
await pool.end()
