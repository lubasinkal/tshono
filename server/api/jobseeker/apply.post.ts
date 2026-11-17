import { pool } from '~~/lib/db'
import { employerJobUuid } from '~~/shared/job'
import { parseApply } from '~~/shared/application'

// Applies the signed-in jobseeker to one of the employer's jobs. Re-applying
// updates the note rather than creating a second row.
export default defineEventHandler(async (event) => {
  const session = await requireJobseeker(event)
  const parsed = parseApply(await readBody(event))
  if ('error' in parsed) throw createError({ statusCode: 422, statusMessage: parsed.error })

  const jobId = employerJobUuid(parsed.data.jobId)
  if (!jobId) {
    throw createError({ statusCode: 400, statusMessage: 'this job takes applications on the employer site' })
  }

  const { rows } = await pool.query<{ id: string; status: string }>(
    `insert into applications (job_id, user_id, note)
     select j.id, $2, $3
       from jobs j
      where j.id = $1 and j.status = 'live' and j.source = 'employer'
     on conflict (job_id, user_id) do update
       set note = excluded.note, updated_at = now()
     returning id, status`,
    [jobId, session.user.id, parsed.data.note],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found or closed' })
  return { application: rows[0] }
})
