export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing job id' })
  await closeJob(id, org.id)
  return { ok: true }
})
