import { startBillingPortal } from '~~/lib/polar'

export default defineEventHandler(async (event) => {
  const { user } = await requireEmployer(event)
  const url = await startBillingPortal(user)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'billing is not configured' })
  return { url }
})
