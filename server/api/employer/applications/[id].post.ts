import { pool } from '~~/lib/db'
import { APPLICATION_STATUSES } from '~~/shared/application'

// Moves one application between new / shortlisted / rejected. The join to jobs
// is what proves the application belongs to this org.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing application id' })

  const body = await readBody(event)
  const status = String(body?.status ?? '')
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
    throw createError({ statusCode: 422, statusMessage: 'unknown status' })
  }

  const { rows } = await pool.query<{ id: string; status: string }>(
    `update applications a
        set status = $1, updated_at = now()
       from jobs j
      where a.id = $2 and j.id = a.job_id and j.organization_id = $3
      returning a.id, a.status`,
    [status, id, org.id],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'application not found' })
  return { application: rows[0] }
})
