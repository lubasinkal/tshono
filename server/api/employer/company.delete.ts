import { pool } from '~~/lib/db'

// Deletes the company the caller is acting as: its profile, jobs and invites
// cascade from organization. The account stays and can start a new one from the
// same page. Search is a separate index, so the jobs are dropped from it too.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)

  const { rows } = await pool.query<{ id: string }>('select id from jobs where organization_id = $1', [org.id])
  await pool.query('delete from organization where id = $1', [org.id])

  for (const job of rows) {
    try {
      await unindexJob(job.id)
    } catch (e) {
      console.error('typesense unindex failed', (e as Error).message)
    }
  }
  return { ok: true }
})
