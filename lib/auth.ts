import { betterAuth } from 'better-auth'
import { admin, emailOTP, organization } from 'better-auth/plugins'
import { polar, webhooks } from '@polar-sh/better-auth'
import { pool } from './db'
import { grantOrder, polarClient } from './polar'

// The plugin is only needed for webhook verification; checkout and the customer
// portal call Polar directly from server/api/employer/*.
const polarPlugin =
  polarClient && process.env.POLAR_WEBHOOK_SECRET
    ? polar({
        client: polarClient,
        use: [
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET,
            onOrderPaid: async (payload) => grantOrder(payload as any),
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
  // Without this every signed-in request does a session SELECT. Five minutes of
  // staleness is fine: roles are read from the member table, not the session.
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  // organization = employer account (owner/admin/member + invitations)
  // admin = staff moderation queue
  plugins: [
    organization(),
    admin(),
    emailOTP({
      // OTP signs in existing users and resets passwords. It must not create
      // accounts: sign-up needs the organization + employer-profile step.
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const apiKey = process.env.RESEND_API_KEY
        const from = process.env.EMAIL_FROM || 'noreply@tshono.lubasiverse.com'
        const subject: Record<string, string> = {
          'sign-in': 'Sign in to tshono',
          'email-verification': 'Verify your email · tshono',
          'forget-password': 'Reset your password · tshono',
        }
        const html = `<p>Your tshono code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
        if (!apiKey) {
          // Local dev without a mail provider: read the code from server logs.
          console.log(`[auth] ${type} OTP for ${email}: ${otp}`)
          return
        }
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to: [email], subject: subject[type] ?? 'Your tshono code', html }),
          })
          if (!res.ok) console.error('[auth] resend failed', res.status, await res.text())
        } catch (e) {
          console.error('[auth] resend error', e)
        }
      },
    }),
    ...(polarPlugin ? [polarPlugin] : []),
  ],
})

export type Auth = typeof auth
