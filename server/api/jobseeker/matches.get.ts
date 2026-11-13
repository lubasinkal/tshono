import { pool } from '~~/lib/db'
import { publicJobId } from '~~/shared/job'

// Live jobs ordered by fit against the signed-in jobseeker's profile. Not a
// ranking engine: profile matches first, then featured, then recency. The
// profile fields are compared as-is because jobs use the same vocabulary.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const { rows: profile } = await pool.query(
    'select occupation, sector, location from jobseeker_profiles where user_id = $1',
    [session.user.id],
  )
  const p = profile[0] ?? { occupation: '', sector: '', location: '' }
  const { rows } = await pool.query(
    `select j.id, j.source, j.external_id, j.title, coalesce(j.company, o.name) as company,
            j.sector, j.location, j.closing,
            (j.featured_until > now()) as featured,
            (coalesce(j.occupation = nullif($1, ''), false)
             or coalesce(j.sector = nullif($2, ''), false)
             or coalesce(j.location = nullif($3, ''), false)) as matched
       from jobs j
       left join organization o on o.id = j.organization_id
      where j.status = 'live' and (j.closing is null or j.closing >= current_date)
      order by (coalesce(j.occupation = nullif($1, ''), false)
                or coalesce(j.sector = nullif($2, ''), false)
                or coalesce(j.location = nullif($3, ''), false)) desc,
               (j.featured_until > now()) desc,
               j.posted_at desc
      limit 6`,
    [p.occupation ?? '', p.sector ?? '', p.location ?? ''],
  )
  // The page links to /jobs/[id], which resolves the Typesense document id.
  const jobs = rows.map(({ source, external_id, ...row }) => ({
    ...row,
    id: publicJobId({ id: row.id, source, external_id }),
  }))
  return { jobs }
})
