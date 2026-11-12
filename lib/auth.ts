import { betterAuth } from 'better-auth'
import { admin, organization } from 'better-auth/plugins'
import { polar, webhooks } from '@polar-sh/better-auth'
import { pool } from './db'
import { grantFeaturedOrder, polarClient } from './polar'

// The plugin is only needed for webhook verification; checkout and the customer
// portal call Polar directly from server/api/employer/*.
const polarPlugin =
  polarClient && process.env.POLAR_WEBHOOK_SECRET
    ? polar({
        client: polarClient,
        use: [
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET,
            onOrderPaid: async (payload) => grantFeaturedOrder(payload as any),
          }),
        ],
      })
    : null

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
  plugins: [
    organization(),
    admin(),
    ...(polarPlugin ? [polarPlugin] : []),
  ],
})

export type Auth = typeof auth
