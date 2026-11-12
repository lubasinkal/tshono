import { LOCATIONS, SECTORS } from './constants'
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  OCCUPATIONS,
  SALARY_PERIODS,
  WORK_MODES,
} from './job'

// What a jobseeker account stores. Mirrors the job fields used for matching.
export interface JobseekerInput {
  headline: string
  occupation: string
  sector: string
  location: string
  workMode: string
  employmentType: string
  educationLevel: string
  years: number
  salaryMin: number | null
  salaryPeriod: string
  skills: string
  about: string
  phone: string
}

export type JobseekerErrors = Partial<Record<keyof JobseekerInput, string>>

export const emptyJobseeker: JobseekerInput = {
  headline: '',
  occupation: '',
  sector: '',
  location: 'Botswana',
  workMode: '',
  employmentType: '',
  educationLevel: '',
  years: 0,
  salaryMin: null,
  salaryPeriod: '',
  skills: '',
  about: '',
  phone: '',
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const num = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v)

export function readJobseekerInput(body: any): JobseekerInput {
  return {
    headline: str(body?.headline, 120),
    occupation: str(body?.occupation, 60),
    sector: str(body?.sector, 40),
    location: str(body?.location, 40) || 'Botswana',
    workMode: str(body?.workMode, 20),
    employmentType: str(body?.employmentType, 20),
    educationLevel: str(body?.educationLevel, 20),
    years: Number(body?.years ?? 0),
    salaryMin: num(body?.salaryMin),
    salaryPeriod: str(body?.salaryPeriod, 20),
    skills: str(body?.skills, 500),
    about: str(body?.about, 1000),
    phone: str(body?.phone, 40),
  }
}

export function jobseekerFromRow(row: any): JobseekerInput {
  return {
    headline: row.headline ?? '',
    occupation: row.occupation ?? '',
    sector: row.sector ?? '',
    location: row.location || 'Botswana',
    workMode: row.work_mode ?? '',
    employmentType: row.employment_type ?? '',
    educationLevel: row.education_level ?? '',
    years: row.years ?? 0,
    salaryMin: row.salary_min ?? null,
    salaryPeriod: row.salary_period ?? '',
    skills: row.skills ?? '',
    about: row.about ?? '',
    phone: row.phone ?? '',
  }
}

// Shared by the form and the API so the rules cannot drift. Everything is
// optional: a fresh account may save an empty profile and fill it in later.
export function validateJobseeker(input: Partial<JobseekerInput>): JobseekerErrors {
  const e: JobseekerErrors = {}
  const pick = (key: keyof JobseekerInput, list: readonly string[], msg: string) => {
    const v = String(input[key] ?? '')
    if (v && !list.includes(v)) e[key] = msg
  }

  if ((input.headline ?? '').trim().length > 120) e.headline = 'headline max 120 characters'
  pick('occupation', OCCUPATIONS, 'pick an occupation group')
  pick('sector', SECTORS, 'pick a sector')
  pick('location', LOCATIONS, 'pick a place')
  pick('workMode', WORK_MODES, 'pick a work mode')
  pick('employmentType', EMPLOYMENT_TYPES, 'pick an employment type')
  pick('educationLevel', EDUCATION_LEVELS, 'pick an education level')
  pick('salaryPeriod', SALARY_PERIODS, 'pick a salary period')

  const years = input.years ?? 0
  if (!Number.isInteger(years) || years < 0 || years > 50) e.years = 'experience must be 0-50 years'

  const salary = input.salaryMin ?? null
  if (salary !== null && (!Number.isInteger(salary) || salary < 0 || salary > 1_000_000)) {
    e.salaryMin = 'salary must be 0-1,000,000'
  }
  if (salary !== null && !input.salaryPeriod) e.salaryPeriod = 'pick a salary period'

  if ((input.skills ?? '').length > 500) e.skills = 'skills max 500 characters'
  if ((input.about ?? '').length > 1000) e.about = 'about max 1000 characters'

  const phone = (input.phone ?? '').trim()
  if (phone && !/^[+0-9 ()-]{6,40}$/.test(phone)) e.phone = 'phone is not valid'

  return e
}
