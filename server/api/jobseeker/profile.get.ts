import { pool } from '~~/lib/db'
import {
  educationFromRow,
  emptyJobseeker,
  experienceFromRow,
  jobseekerFromRow,
} from '~~/shared/jobseeker'

// Returns the signed-in jobseeker's profile and CV sections so the page can
// pre-fill the form.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const userId = session.user.id
  const [profile, experience, education] = await Promise.all([
    pool.query('select * from jobseeker_profiles where user_id = $1', [userId]),
    pool.query('select * from jobseeker_experience where user_id = $1 order by start_date desc', [userId]),
    pool.query('select * from jobseeker_education where user_id = $1 order by year desc nulls last', [userId]),
  ])
  if (!profile.rows[0]) return { profile: emptyJobseeker }
  return {
    profile: jobseekerFromRow(
      profile.rows[0],
      experience.rows.map(experienceFromRow),
      education.rows.map(educationFromRow),
    ),
  }
})
