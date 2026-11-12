import { createAuthClient } from 'better-auth/vue'
import { adminClient, organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [organizationClient(), adminClient()],
})

export const { signIn, signUp, signOut, useSession, organization, admin } = authClient
