import { pool } from '~~/lib/db'
import { publicJobId } from '~~/shared/job'

// The signed-in jobseeker's applications, newest first, with enough job detail
// to link back to the role.
export default defineEventHandler(async (event) => {
  const session = await requireJobseeker(event)
  const { rows } = await pool.query(
    `select a.id, a.status, a.note, a.created_at as "createdAt",
            j.title, coalesce(j.company, o.name) as company, j.closing,
            j.source, j.external_id, j.status as "jobStatus", j.id as "jobUuid"
       from applications a
       join jobs j on j.id = a.job_id
       left join organization o on o.id = j.organization_id
      where a.user_id = $1
      order by a.created_at desc`,
    [session.user.id],
  )
  return {
    applications: rows.map(({ jobUuid, source, external_id, ...row }: any) => ({
      ...row,
      jobId: publicJobId({ id: jobUuid, source, external_id }),
    })),
  }
})
