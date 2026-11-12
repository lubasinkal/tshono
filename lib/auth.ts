import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'
import { pool } from './db'

// Postgres pool is shared with the app's own queries (see lib/db.ts).
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
