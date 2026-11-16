// Public pages must not wait on a session read they cannot use. The session
// cookie is HttpOnly, so only the server can see it; on the client we already
// have the SSR payload, and `true` keeps manual refetches working.
export function useHasSession(): boolean {
  if (!import.meta.server) return true
  return /better-auth\.session/.test(useRequestHeaders(['cookie']).cookie ?? '')
}
