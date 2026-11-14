import { pool } from '~~/lib/db'
import { LOCATIONS, SECTORS } from '~~/shared/constants'
import { OCCUPATIONS } from '~~/shared/job'

// Candidate search for employers. Only profiles where the jobseeker turned
// visibility on are readable here — that flag is the whole privacy contract.
export default defineEventHandler(async (event) => {
  await requireEmployer(event)
  const q = getQuery(event)

  // Hand-edited URLs should narrow, not break: unknown values fall back to "any".
  const pick = (v: unknown, list: readonly string[]) =>
    typeof v === 'string' && list.includes(v) ? v : ''
  const occupation = pick(q.occupation, OCCUPATIONS)
  const sector = pick(q.sector, SECTORS)
  const location = pick(q.location, LOCATIONS)
  const yearsRaw = Number(q.minYears ?? 0)
  const minYears = Number.isInteger(yearsRaw) && yearsRaw > 0 && yearsRaw <= 50 ? yearsRaw : 0

  const { rows } = await pool.query(
    `select p.user_id as id,
            coalesce(u.name, '') as name,
            p.headline, p.occupation, p.sector, p.location, p.years,
            p.work_mode as "workMode", p.employment_type as "employmentType",
            p.education_level as "educationLevel", p.relocate,
            p.available_from as "availableFrom",
            p.skills, p.updated_at as "updatedAt"
       from jobseeker_profiles p
       join "user" u on u.id = p.user_id
      where p.visible_to_employers = true
        and ($1 = '' or p.occupation = $1)
        and ($2 = '' or p.sector = $2)
        and ($3 = '' or p.location = $3)
        and p.years >= $4
      order by p.updated_at desc
      limit 20`,
    [occupation, sector, location, minYears],
  )
  return { candidates: rows }
})
