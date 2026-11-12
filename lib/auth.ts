import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'
import { Pool } from 'pg'

// One pool per server process. Better Auth runs its own Kysely dialect over it.
// DATABASE_URL points at the Neon branch in .env.local (dev) or the host env (prod).
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    // Employers are gated by manual moderation, so email verification stays off
    // until a transactional mail provider exists.
    requireEmailVerification: false,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
  // organization = employer account (owner/admin/member + invitations)
  // admin = staff moderation queue
  plugins: [organization(), admin()],
})

export type Auth = typeof auth
