import { pool } from '~~/lib/db'
import { publicJobId } from '~~/shared/job'

// Deletes the company the caller is acting as: its profile, jobs and invites
// cascade from organization. The account stays and can start a new one from the
// same page. Search is a separate index, so jobs are dropped from it first.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)

  const { rows } = await pool.query<{ id: string; source: string; external_id: string | null }>(
    'select id, source, external_id from jobs where organization_id = $1',
    [org.id],
  )
  for (const job of rows) await unindexJob(publicJobId(job))
  await pool.query('delete from organization where id = $1', [org.id])
  return { ok: true }
})
