import { LOCATIONS, SECTORS } from './constants'

// ISCO-08 major groups — the classification labour statistics use.
export const OCCUPATIONS = [
  'Managers',
  'Professionals',
  'Technicians and associate professionals',
  'Clerical support workers',
  'Services and sales workers',
  'Agriculture and forestry workers',
  'Craft and related trades workers',
  'Plant and machine operators',
  'Elementary occupations',
  'Armed forces',
] as const

export const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'temporary', 'internship'] as const
export const WORK_MODES = ['on_site', 'hybrid', 'remote'] as const
export const EDUCATION_LEVELS = ['none', 'certificate', 'diploma', 'degree', 'postgraduate'] as const
export const SALARY_PERIODS = ['monthly', 'annual', 'hourly'] as const

// Districts matter for national coverage; derived from the place so employers
// are not asked the same thing twice.
export const LOCATION_DISTRICT: Record<string, string> = {
  Gaborone: 'South East',
  Francistown: 'North East',
  Maun: 'North West',
  Jwaneng: 'Southern',
  Letlhakane: 'Central',
  Palapye: 'Central',
  Kasane: 'Chobe',
  Serowe: 'Central',
  Ramotswa: 'South East',
  Ghanzi: 'Ghanzi',
  Molepolole: 'Kweneng',
  Mogoditshane: 'Kweneng',
  Tonota: 'Central',
  Mochudi: 'Kgatleng',
  Mahalapye: 'Central',
}

export function districtFor(location: string): string | null {
  return LOCATION_DISTRICT[location] ?? null
}

export interface JobInput {
  title: string
  sector: string
  location: string
  occupation: string
  employmentType: string
  vacancies: number
  workMode: string
  educationLevel: string
  minYears: number
  salaryMin: number | null
  salaryMax: number | null
  salaryPeriod: string
  contractMonths: number | null
  closing: string
  applyUrl: string
  blurb: string
  content: string
  responsibilities: string
  requirements: string
}

export type JobErrors = Partial<Record<keyof JobInput, string>>

const inList = (list: readonly string[], v: string) => list.includes(v)
const intOrNull = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v))

// Shared by the form and the API so the rules cannot drift.
export function validateJob(input: Partial<JobInput>): JobErrors {
  const e: JobErrors = {}
  const title = (input.title ?? '').trim()
  if (title.length < 4 || title.length > 120) e.title = 'title must be 4-120 characters'
  if (!inList(SECTORS, input.sector ?? '')) e.sector = 'pick a sector'
  if (!inList(LOCATIONS, input.location ?? '')) e.location = 'pick a place'
  if (!inList(OCCUPATIONS, input.occupation ?? '')) e.occupation = 'pick an occupation group'
  if (!inList(EMPLOYMENT_TYPES, input.employmentType ?? '')) e.employmentType = 'pick an employment type'
  if (!inList(WORK_MODES, input.workMode ?? '')) e.workMode = 'pick a work mode'
  if (input.educationLevel && !inList(EDUCATION_LEVELS, input.educationLevel)) e.educationLevel = 'pick an education level'

  const vacancies = input.vacancies ?? 1
  if (!Number.isInteger(vacancies) || vacancies < 1 || vacancies > 1000) e.vacancies = 'vacancies must be 1-1000'

  const years = input.minYears ?? 0
  if (!Number.isInteger(years) || years < 0 || years > 40) e.minYears = 'experience must be 0-40 years'

  const min = intOrNull(input.salaryMin)
  const max = intOrNull(input.salaryMax)
  if (min !== null && (!Number.isInteger(min) || min < 0 || min > 1_000_000)) e.salaryMin = 'salary must be 0-1,000,000'
  if (max !== null && (!Number.isInteger(max) || max < 0 || max > 1_000_000)) e.salaryMax = 'salary must be 0-1,000,000'
  if (min !== null && max !== null && min > max) e.salaryMax = 'max must be at least min'
  if ((min !== null || max !== null) && !inList(SALARY_PERIODS, input.salaryPeriod ?? '')) e.salaryPeriod = 'pick a salary period'

  const months = intOrNull(input.contractMonths)
  if (months !== null && (!Number.isInteger(months) || months < 0 || months > 120)) e.contractMonths = 'contract must be 0-120 months'

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
  if ((input.responsibilities ?? '').length > 4000) e.responsibilities = 'responsibilities max 4000 characters'
  if ((input.requirements ?? '').length > 4000) e.requirements = 'requirements max 4000 characters'
  return e
}
