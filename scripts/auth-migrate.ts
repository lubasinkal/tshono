// Apply Better Auth's own tables (user, session, account, verification,
// organization, member, invitation) using the library API, so the schema always
// matches the installed better-auth version.
// Run: bun run scripts/auth-migrate.ts
import { getMigrations } from 'better-auth/db/migration'
import { auth } from '../lib/auth'

console.log(`branch: ${process.env.NEON_BRANCH ?? 'unknown'}`)

const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options)
const create = toBeCreated.map((t) => t.table)
const alter = toBeAdded.map((t) => t.table)

if (!create.length && !alter.length) {
  console.log('auth schema up to date')
  process.exit(0)
}

console.log(`creating: ${create.join(', ') || 'none'}`)
console.log(`altering: ${alter.join(', ') || 'none'}`)
await runMigrations()
console.log('auth schema applied')
