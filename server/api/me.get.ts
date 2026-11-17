import { pool } from '~~/lib/db'

// Which dashboard this account belongs on: an employer org wins if the user
// has one, otherwise a jobseeker profile, otherwise they still need to sign up.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const { rows } = await pool.query(
    `select exists (select 1 from member where "userId" = $1) as employer,
            exists (select 1 from jobseeker_profiles where user_id = $1) as jobseeker`,
    [session.user.id],
  )
  const { employer, jobseeker } = rows[0]
  return { role: employer ? 'employer' : jobseeker ? 'jobseeker' : 'none' }
})
