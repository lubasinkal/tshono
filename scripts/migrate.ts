// Applies migrations/*.sql in order, each in a transaction, recorded once.
// Run: bun run db:migrate
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pool } from '../lib/db'

const dir = join(process.cwd(), 'migrations')
const client = await pool.connect()
try {
  await client.query(
    'create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())',
  )
  const done = new Set(
    (await client.query<{ id: string }>('select id from schema_migrations')).rows.map((r) => r.id),
  )
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()
  let applied = 0
  for (const file of files) {
    if (done.has(file)) continue
    await client.query('begin')
    try {
      await client.query(await readFile(join(dir, file), 'utf8'))
      await client.query('insert into schema_migrations (id) values ($1)', [file])
      await client.query('commit')
      applied++
      console.log('applied', file)
    } catch (e) {
      await client.query('rollback')
      console.error('failed', file)
      throw e
    }
  }
  console.log(applied ? `${applied} applied` : 'schema up to date')
} finally {
  client.release()
  await pool.end()
}
