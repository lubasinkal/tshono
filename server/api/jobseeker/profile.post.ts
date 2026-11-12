import { pool } from '~~/lib/db'
import { readJobseekerInput, validateJobseeker } from '~~/shared/jobseeker'

// Creates or updates the signed-in user's jobseeker profile. Called with an
// empty body right after sign-up; the form fills the rest in later.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const input = readJobseekerInput(await readBody(event))
  const first = Object.values(validateJobseeker(input))[0]
  if (first) throw createError({ statusCode: 422, statusMessage: first })

  const { rows } = await pool.query(
    `insert into jobseeker_profiles
       (user_id, headline, occupation, sector, location, work_mode, employment_type,
        education_level, years, salary_min, salary_period, skills, about, phone)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     on conflict (user_id) do update set
       headline = excluded.headline, occupation = excluded.occupation, sector = excluded.sector,
       location = excluded.location, work_mode = excluded.work_mode,
       employment_type = excluded.employment_type, education_level = excluded.education_level,
       years = excluded.years, salary_min = excluded.salary_min,
       salary_period = excluded.salary_period, skills = excluded.skills,
       about = excluded.about, phone = excluded.phone, updated_at = now()
     returning *`,
    [
      session.user.id,
      input.headline,
      input.occupation,
      input.sector,
      input.location,
      input.workMode,
      input.employmentType,
      input.educationLevel,
      input.years,
      input.salaryMin,
      input.salaryPeriod,
      input.skills,
      input.about,
      input.phone,
    ],
  )
  return { profile: rows[0] }
})
