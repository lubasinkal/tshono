import { createAuthClient } from 'better-auth/vue'
import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [organizationClient(), adminClient(), emailOTPClient()],
})

export const { signIn, signUp, signOut, useSession, organization, admin } = authClient
