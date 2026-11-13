import { pool } from '~~/lib/db'
import {
  educationFromRow,
  experienceFromRow,
  jobseekerFromRow,
} from '~~/shared/jobseeker'

// Full candidate profile for an employer. A profile is readable when it is
// publicly visible, or when this org has an application from that jobseeker —
// applying already shared it with them. Anything else is a 404, so ids cannot
// be probed.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing candidate id' })

  const [profile, user] = await Promise.all([
    pool.query(
      `select * from jobseeker_profiles p
        where p.user_id = $1
          and (p.visible_to_employers
               or exists (select 1 from applications a
                            join jobs j on j.id = a.job_id
                           where a.user_id = p.user_id and j.organization_id = $2))`,
      [id, org.id],
    ),
    pool.query('select name from "user" where id = $1', [id]),
  ])
  // Gate before reading CV sections; the lists have no visibility column.
  if (!profile.rows[0]) throw createError({ statusCode: 404, statusMessage: 'candidate not found' })

  const [experience, education] = await Promise.all([
    pool.query('select * from jobseeker_experience where user_id = $1 order by start_date desc', [id]),
    pool.query('select * from jobseeker_education where user_id = $1 order by year desc nulls last', [id]),
  ])

  return {
    name: user.rows[0]?.name ?? '',
    profile: jobseekerFromRow(
      profile.rows[0],
      experience.rows.map(experienceFromRow),
      education.rows.map(educationFromRow),
    ),
  }
})
