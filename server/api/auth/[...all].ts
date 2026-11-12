import { auth } from '~~/lib/auth'

// All /api/auth/* requests are handled by Better Auth (signup, login, session,
// organization, admin, and later the Polar plugin endpoints).
export default defineEventHandler((event) => auth.handler(toWebRequest(event)))
