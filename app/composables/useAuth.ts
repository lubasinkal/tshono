import { createAuthClient } from 'better-auth/vue'
import { adminClient, emailOTPClient, organizationClient } from 'better-auth/client/plugins'

// Request-scoped client: forwards the incoming cookie during SSR so server-rendered
// pages see the same session the browser has. Use for useAsyncData/server calls;
// plain client components can use the singleton in lib/auth-client.ts.
export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return createAuthClient({
    baseURL: url.origin,
    plugins: [organizationClient(), adminClient(), emailOTPClient()],
    fetchOptions: { headers },
  })
}
