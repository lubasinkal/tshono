export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing job id' })
  const input = readJobInput(await readBody(event))
  assertValid(input)
  const { job, indexed } = await updateJob(id, org.id, org.name, input)
  return { job, indexed }
})
