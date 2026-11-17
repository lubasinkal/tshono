import { pool } from '~~/lib/db'
import { APPLICATION_STATUSES, type ApplicationStatus } from '~~/shared/application'
import { toCsv } from '~~/shared/csv'

// Every application to this org's jobs in one list, optionally narrowed by job
// or status. `?format=csv` returns the same rows for spreadsheet screening.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const q = getQuery(event)

  const jobId = typeof q.jobId === 'string' ? q.jobId : ''
  const status = APPLICATION_STATUSES.includes(q.status as ApplicationStatus)
    ? String(q.status)
    : ''

  const { rows } = await pool.query(
    `select a.id, a.status, a.note, a.created_at as "createdAt", a.user_id as "userId",
            coalesce(u.name, '') as name, coalesce(u.email, '') as email,
            p.headline, p.occupation, p.location, p.years, p.phone, p.skills,
            j.id as "jobId", j.title as "jobTitle"
       from applications a
       join jobs j on j.id = a.job_id
       left join "user" u on u.id = a.user_id
       left join jobseeker_profiles p on p.user_id = a.user_id
      where j.organization_id = $1
        and ($2 = '' or a.job_id::text = $2)
        and ($3 = '' or a.status = $3)
      order by a.created_at desc`,
    [org.id, jobId, status],
  )

  if (q.format !== 'csv') {
    const jobs = await pool.query('select id, title from jobs where organization_id = $1 order by posted_at desc', [
      org.id,
    ])
    return { applicants: rows, jobs: jobs.rows }
  }

  const csv = toCsv([
    ['name', 'email', 'phone', 'job', 'status', 'applied', 'location', 'occupation', 'years', 'headline', 'skills', 'note'],
    ...rows.map((r: any) => [
      r.name, r.email, r.phone, r.jobTitle, r.status, String(r.createdAt).slice(0, 10),
      r.location, r.occupation, r.years, r.headline, r.skills, r.note,
    ]),
  ])
  setResponseHeaders(event, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="tshono-applicants-${new Date().toISOString().slice(0, 10)}.csv"`,
  })
  return '\uFEFF' + csv
})
