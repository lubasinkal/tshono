import { pool } from '~~/lib/db'

export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const jobs = await listJobs(org.id)
  const credits = await pool.query<{ featured_credits: number }>(
    'select featured_credits from employer_profiles where organization_id = $1',
    [org.id],
  )
  return {
    org: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      website: org.website,
      sector: org.sector,
      location: org.location,
      plan: org.plan,
      verified: Boolean(org.verified_at),
      featuredCredits: credits.rows[0]?.featured_credits ?? 0,
    },
    jobs,
  }
})
