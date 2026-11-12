export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const jobs = await listJobs(org.id)
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
    },
    jobs,
  }
})
