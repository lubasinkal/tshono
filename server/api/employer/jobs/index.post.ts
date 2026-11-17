export default defineEventHandler(async (event) => {
  const { org } = await requireEmployer(event)
  const input = readJobInput(await readBody(event))
  assertValid(input)
  const { job, indexed } = await createJob(org.id, org.name, input)
  return { job, indexed }
})
