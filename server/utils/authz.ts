import { auth } from '~~/lib/auth'
import { pool } from '~~/lib/db'

export interface EmployerOrg {
  id: string
  name: string
  slug: string
  role: string
  website: string
  sector: string
  location: string
  verified_at: string | null
  plan: string
}

export async function sessionUser(event: any) {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'sign in first' })
  return session
}

// One account can own several organizations; prefer the session's active one.
export async function requireEmployer(event: any): Promise<{ user: any; org: EmployerOrg }> {
  const session = await sessionUser(event)
  const { rows } = await pool.query(
    `select o.id, o.name, o.slug, m.role,
            coalesce(p.website, '') as website,
            coalesce(p.sector, 'General') as sector,
            coalesce(p.location, 'Botswana') as location,
            p.verified_at, coalesce(p.plan, 'free') as plan
       from member m
       join organization o on o.id = m."organizationId"
       left join employer_profiles p on p.organization_id = o.id
      where m."userId" = $1
      order by (m."organizationId" = $2) desc, m."createdAt" asc
      limit 1`,
    [session.user.id, session.session.activeOrganizationId ?? ''],
  )
  if (!rows.length) {
    throw createError({ statusCode: 403, statusMessage: 'this account has no employer profile yet' })
  }
  return { user: session.user, org: rows[0] as EmployerOrg }
}
