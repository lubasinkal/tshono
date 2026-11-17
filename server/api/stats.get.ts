import { pool } from '~~/lib/db'

interface Counts {
  jobseekers: number
  employers: number
}

// Public, aggregate counts for the home page. Cached briefly because it is two
// COUNTs on every homepage view and the numbers move slowly.
let cache: { at: number; data: Counts } | null = null
const TTL = 60_000

export default defineEventHandler(async () => {
  if (cache && Date.now() - cache.at < TTL) return cache.data
  const { rows } = await pool.query<Counts>(
    `select (select count(*)::int from jobseeker_profiles) as jobseekers,
            (select count(*)::int from organization) as employers`,
  )
  const data = rows[0] ?? { jobseekers: 0, employers: 0 }
  cache = { at: Date.now(), data }
  return data
})
