import { z } from 'zod'

export const APPLICATION_STATUSES = ['new', 'shortlisted', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// One schema for the apply form and the API, like the jobseeker profile.
export const applySchema = z.object({
  jobId: z.string().trim().min(1, 'missing job'),
  note: z.string().trim().max(1000, 'note max 1000 characters').default(''),
})

export type ApplyInput = z.infer<typeof applySchema>

export function parseApply(body: unknown): { data: ApplyInput } | { error: string } {
  const result = applySchema.safeParse(body ?? {})
  if (result.success) return { data: result.data }
  return { error: result.error.issues[0]?.message ?? 'invalid application' }
}
