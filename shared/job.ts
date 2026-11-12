import { LOCATIONS, SECTORS } from './constants'

export interface JobInput {
  title: string
  sector: string
  location: string
  minYears: number
  closing: string
  applyUrl: string
  blurb: string
  content: string
}

export type JobErrors = Partial<Record<keyof JobInput, string>>

// Shared by the form and the API so the rules cannot drift.
export function validateJob(input: Partial<JobInput>): JobErrors {
  const e: JobErrors = {}
  const title = (input.title ?? '').trim()
  if (title.length < 4 || title.length > 120) e.title = 'title must be 4-120 characters'
  if (!SECTORS.includes((input.sector ?? '') as (typeof SECTORS)[number])) e.sector = 'pick a sector'
  if (!LOCATIONS.includes((input.location ?? '') as (typeof LOCATIONS)[number])) e.location = 'pick a place'

  const years = input.minYears ?? 0
  if (!Number.isInteger(years) || years < 0 || years > 40) e.minYears = 'experience must be 0-40 years'

  const closing = (input.closing ?? '').trim()
  if (closing) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(closing)) e.closing = 'closing must be YYYY-MM-DD'
    else if (closing < new Date().toISOString().slice(0, 10)) e.closing = 'closing date is in the past'
  }

  const url = (input.applyUrl ?? '').trim()
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') e.applyUrl = 'apply link must start with https://'
  } catch {
    e.applyUrl = 'a valid apply link is required'
  }

  if ((input.blurb ?? '').length > 400) e.blurb = 'blurb max 400 characters'
  if ((input.content ?? '').length > 8000) e.content = 'details max 8000 characters'
  return e
}
