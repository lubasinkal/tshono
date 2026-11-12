import { pool } from '~~/lib/db'
import { emptyJobseeker, jobseekerFromRow } from '~~/shared/jobseeker'

// Returns the signed-in jobseeker's profile so the page can pre-fill the form.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const { rows } = await pool.query('select * from jobseeker_profiles where user_id = $1', [
    session.user.id,
  ])
  return { profile: rows[0] ? jobseekerFromRow(rows[0]) : emptyJobseeker }
})
