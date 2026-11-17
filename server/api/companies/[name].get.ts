import { pool } from '~~/lib/db'

// Company info for a registered employer, matched by the organization name the
// job's `company` field uses. Scraped companies have no profile (null).
export default defineEventHandler(async (event) => {
  const name = String(getRouterParam(event, 'name') ?? '')
  const { rows } = await pool.query(
    `select p.website, p.about, p.sector, p.location, p.contact_name, p.phone, p.email, p.address
       from employer_profiles p
       join organization o on o.id = p.organization_id
      where lower(o.name) = lower($1)
      limit 1`,
    [name],
  )
  return { company: rows[0] ?? null }
})
