export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing job id' })
  const { job, indexed } = await unfeatureJob(id, org.id)
  return { job, indexed }
})
