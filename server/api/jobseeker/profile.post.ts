import { pool } from '~~/lib/db'
import { parseJobseeker } from '~~/shared/jobseeker'

// Creates or updates the signed-in user's jobseeker profile and CV sections in
// one transaction: the lists are replaced as a set, so a failed save leaves the
// previous CV intact. Called with an empty body right after sign-up; the form
// fills the rest in later.
export default defineEventHandler(async (event) => {
  const session = await requireJobseeker(event)
  const userId = session.user.id
  const parsed = parseJobseeker(await readBody(event))
  if ('error' in parsed) throw createError({ statusCode: 422, statusMessage: parsed.error })
  const input = parsed.data

  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query(
      `insert into jobseeker_profiles
         (user_id, headline, occupation, sector, location, work_mode, employment_type,
          education_level, years, salary_min, salary_period, skills, about, phone,
          visible_to_employers, relocate, available_from, languages, certifications)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       on conflict (user_id) do update set
         headline = excluded.headline, occupation = excluded.occupation, sector = excluded.sector,
         location = excluded.location, work_mode = excluded.work_mode,
         employment_type = excluded.employment_type, education_level = excluded.education_level,
         years = excluded.years, salary_min = excluded.salary_min,
         salary_period = excluded.salary_period, skills = excluded.skills,
         about = excluded.about, phone = excluded.phone,
         visible_to_employers = excluded.visible_to_employers, relocate = excluded.relocate,
         available_from = excluded.available_from, languages = excluded.languages,
         certifications = excluded.certifications, updated_at = now()`,
      [
        userId,
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
        input.visible,
        input.relocate,
        input.availableFrom || null,
        input.languages,
        input.certifications,
      ],
    )

    await client.query('delete from jobseeker_experience where user_id = $1', [userId])
    for (const r of input.experience) {
      await client.query(
        `insert into jobseeker_experience (user_id, title, company, start_date, end_date, current, description)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, r.title, r.company, r.startDate, r.current ? null : r.endDate, r.current, r.description],
      )
    }

    await client.query('delete from jobseeker_education where user_id = $1', [userId])
    for (const r of input.education) {
      await client.query(
        `insert into jobseeker_education (user_id, institution, qualification, field, year)
         values ($1,$2,$3,$4,$5)`,
        [userId, r.institution, r.qualification, r.field, r.year],
      )
    }

    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
  return { ok: true }
})
