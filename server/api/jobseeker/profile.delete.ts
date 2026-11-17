import { pool } from '~~/lib/db'

// Removes the jobseeker's profile, CV sections and applications. The account
// stays, and POST /api/jobseeker/profile recreates the profile on the next save.
export default defineEventHandler(async (event) => {
  const session = await requireJobseeker(event)
  const userId = session.user.id

  const client = await pool.connect()
  try {
    await client.query('begin')
    // Applications go with it: an employer should keep no copy of a candidate
    // who deleted their profile.
    await client.query('delete from applications where user_id = $1', [userId])
    await client.query('delete from jobseeker_experience where user_id = $1', [userId])
    await client.query('delete from jobseeker_education where user_id = $1', [userId])
    await client.query('delete from jobseeker_profiles where user_id = $1', [userId])
    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
  return { ok: true }
})
