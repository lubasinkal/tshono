import { pool } from '~~/lib/db'
import { LOCATIONS, SECTORS } from '~~/shared/constants'

// Renames the org, copies the name onto its jobs, then re-indexes them: search
// and job pages read the company from the index, so a stale copy would linger.
async function renameOrganization(orgId: string, name: string) {
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query('update organization set name = $1 where id = $2', [name, orgId])
    await client.query(
      'update jobs set company = $1, updated_at = now() where organization_id = $2',
      [name, orgId],
    )
    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }
  const { rows } = await pool.query(
    `select * from jobs where organization_id = $1 and status = 'live'`,
    [orgId],
  )
  for (const job of rows) await refreshIndex(job)
}

// Creates or updates the employer profile for an organization the user belongs
// to. Called right after organization.create() on the signup page.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const body = await readBody(event)
  const organizationId = String(body?.organizationId ?? '')
  if (!organizationId) throw createError({ statusCode: 400, statusMessage: 'organizationId is required' })

  const member = await pool.query<{ role: string; name: string }>(
    `select m.role, o.name from member m join organization o on o.id = m."organizationId"
      where m."organizationId" = $1 and m."userId" = $2`,
    [organizationId, session.user.id],
  )
  if (!member.rows.length) throw createError({ statusCode: 404, statusMessage: 'organization not found' })

  // The company name lives on the Better Auth organization; renaming is owner/admin
  // only and re-indexes the org's jobs, since the index stores the name per job.
  const name = String(body?.name ?? '').trim().slice(0, 80)
  if (name && name !== member.rows[0]!.name) {
    if (name.length < 2) throw createError({ statusCode: 422, statusMessage: 'company name is too short' })
    if (!['owner', 'admin'].includes(member.rows[0]!.role)) {
      throw createError({ statusCode: 403, statusMessage: 'only owners and admins can rename the company' })
    }
    await renameOrganization(organizationId, name)
  }

  const website = String(body?.website ?? '').trim().slice(0, 300)
  if (website && !/^https:\/\//.test(website)) {
    throw createError({ statusCode: 422, statusMessage: 'website must start with https://' })
  }
  const email = String(body?.email ?? '').trim().slice(0, 200)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'email is not valid' })
  }
  const address = String(body?.address ?? '').trim().slice(0, 300)
  const sector = String(body?.sector ?? 'General')
  const location = String(body?.location ?? 'Botswana')
  if (!SECTORS.includes(sector as (typeof SECTORS)[number])) throw createError({ statusCode: 422, statusMessage: 'unknown sector' })
  if (!LOCATIONS.includes(location as (typeof LOCATIONS)[number])) throw createError({ statusCode: 422, statusMessage: 'unknown location' })

  const { rows } = await pool.query(
    `insert into employer_profiles (organization_id, website, about, sector, location, contact_name, phone, email, address)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     on conflict (organization_id) do update set
       website = excluded.website, about = excluded.about, sector = excluded.sector,
       location = excluded.location, contact_name = excluded.contact_name, phone = excluded.phone,
       email = excluded.email, address = excluded.address
     returning *`,
    [
      organizationId,
      website,
      String(body?.about ?? '').trim().slice(0, 1000),
      sector,
      location,
      String(body?.contactName ?? session.user.name ?? '').trim().slice(0, 120),
      String(body?.phone ?? '').trim().slice(0, 40),
      email,
      address,
    ],
  )
  return { profile: rows[0] }
})
