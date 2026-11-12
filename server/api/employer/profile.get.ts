import { pool } from '~~/lib/db'

// Returns the employer profile (and org id) so the settings page can pre-fill
// the edit form. Falls back to an empty profile before the first save.
export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const { rows } = await pool.query(
    `select organization_id, website, about, sector, location, contact_name, phone, verified_at, plan
       from employer_profiles where organization_id = $1`,
    [org.id],
  )
  return {
    org: { id: org.id, name: org.name },
    profile: rows[0] ?? {
      organization_id: org.id,
      website: '',
      about: '',
      sector: 'General',
      location: 'Botswana',
      contact_name: '',
      phone: '',
      verified_at: null,
      plan: 'free',
    },
  }
})
