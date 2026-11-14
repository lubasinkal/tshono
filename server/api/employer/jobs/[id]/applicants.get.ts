import { pool } from '~~/lib/db'

// Applicants for one of this org's jobs. The application itself is the
// employer's permission to read the profile, so visibility is not required.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing job id' })

  const job = await pool.query<{ id: string; title: string; status: string }>(
    'select id, title, status from jobs where id = $1 and organization_id = $2',
    [id, org.id],
  )
  if (!job.rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found' })

  const { rows } = await pool.query(
    `select a.id, a.status, a.note, a.created_at as "createdAt", a.user_id as "userId",
            coalesce(u.name, '') as name,
            p.headline, p.occupation, p.location, p.years, p.phone,
            p.available_from as "availableFrom"
       from applications a
       left join "user" u on u.id = a.user_id
       left join jobseeker_profiles p on p.user_id = a.user_id
      where a.job_id = $1
      order by a.created_at desc`,
    [id],
  )
  return { job: job.rows[0], applicants: rows }
})
