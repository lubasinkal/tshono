import { auth } from '~~/lib/auth'
import { pool } from '~~/lib/db'

// Deletes the signed-in account and everything that hangs off it. Profile, CV,
// applications and sessions all cascade from "user". A company only goes with
// them when they were its last member: a shared company outlives the account
// and is handed to its longest-standing other member instead of being orphaned.
export default defineEventHandler(async (event) => {
  const session = await sessionUser(event)
  const userId = session.user.id

  const { rows: memberships } = await pool.query<{ id: string; role: string; members: number }>(
    `select m."organizationId" as id, m.role,
            (select count(*)::int from member m2 where m2."organizationId" = m."organizationId") as members
       from member m
      where m."userId" = $1`,
    [userId],
  )
  const soloOrgs = memberships.filter((m) => m.members <= 1).map((m) => m.id)
  const owned = memberships.filter((m) => m.members > 1 && m.role === 'owner')

  // Search is a separate index: dropping the rows leaves the jobs findable
  // until they are removed from Typesense too.
  const { rows: indexed } = soloOrgs.length
    ? await pool.query<{ id: string }>('select id from jobs where organization_id = any($1)', [soloOrgs])
    : { rows: [] as { id: string }[] }

  const client = await pool.connect()
  try {
    await client.query('begin')
    for (const org of owned) {
      await client.query(
        `update member set role = 'owner'
          where "organizationId" = $1
            and "userId" = (select "userId" from member
                             where "organizationId" = $1 and "userId" <> $2
                             order by "createdAt" limit 1)`,
        [org.id, userId],
      )
    }
    if (soloOrgs.length) await client.query('delete from organization where id = any($1)', [soloOrgs])
    await client.query('delete from "user" where id = $1', [userId])
    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }

  for (const job of indexed) {
    try {
      await unindexJob(job.id)
    } catch (e) {
      console.error('typesense unindex failed', (e as Error).message)
    }
  }

  // Better Auth's own sign-out clears every session cookie it set (token, cache,
  // dont_remember) with the right names and flags. cookieCache would otherwise
  // keep a deleted account looking signed in for up to five minutes.
  const signedOut = await auth.api.signOut({ headers: event.headers, returnHeaders: true })
  for (const cookie of signedOut.headers.getSetCookie()) appendHeader(event, 'set-cookie', cookie)

  return { ok: true }
})
