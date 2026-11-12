import { startFeaturedCheckout } from '~~/lib/polar'

export default defineEventHandler(async (event) => {
  const { user } = await requireEmployer(event)
  const body = await readBody(event)
  const slug = String(body?.slug ?? '')
  const origin = process.env.BETTER_AUTH_URL ?? ''
  const successUrl = String(body?.successUrl ?? `${origin}/employers/dashboard?purchased=1`)
  // Keep post-payment redirects on our own origin.
  if (origin && !successUrl.startsWith(`${origin}/`)) {
    throw createError({ statusCode: 422, statusMessage: 'successUrl must stay on this site' })
  }
  const url = await startFeaturedCheckout(user, slug, successUrl)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'billing is not configured' })
  return { url }
})
