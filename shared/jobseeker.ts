import { z } from 'zod'
import { LOCATIONS, SECTORS } from './constants'
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  OCCUPATIONS,
  SALARY_PERIODS,
  WORK_MODES,
} from './job'

// One schema is the source of truth: it produces the input type, the defaults,
// the normalisation (trim, blank rows) and the error messages shared by the
// form and the API.
const MAX_ROLES = 20
const MAX_SCHOOLS = 10
const THIS_YEAR = new Date().getFullYear()

const text = (max: number, msg: string) => z.string().trim().max(max, msg).default('')

// Empty means "not stated"; anything else must be one of the known options.
const choice = (list: readonly string[], msg: string) =>
  z
    .string()
    .trim()
    .default('')
    .refine((v) => !v || list.includes(v), msg)

const isoDate = (msg: string) =>
  z
    .string()
    .trim()
    .default('')
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), msg)

const optionalInt = (min: number, max: number, msg: string) =>
  z
    .preprocess((v) => (v === '' || v == null ? null : Number(v)), z.number().nullable())
    .refine((v) => v === null || (Number.isInteger(v) && v >= min && v <= max), msg)

const experienceEntry = z.object({
  title: text(120, 'job title max 120 characters'),
  company: text(120, 'company max 120 characters'),
  startDate: isoDate('start date must be YYYY-MM-DD'),
  endDate: isoDate('end date must be YYYY-MM-DD'),
  current: z.boolean().default(false),
  description: text(1000, 'role detail max 1000 characters'),
})

const educationEntry = z.object({
  institution: text(120, 'institution max 120 characters'),
  qualification: text(120, 'qualification max 120 characters'),
  field: text(120, 'field max 120 characters'),
  year: optionalInt(1950, THIS_YEAR + 10, 'qualification year is not valid'),
})

export const emptyExperience: ExperienceEntry = experienceEntry.parse({})
export const emptyEducation: EducationEntry = educationEntry.parse({})

const nonEmptyRole = (r: ExperienceEntry) =>
  Boolean(r.title || r.company || r.startDate || r.endDate || r.description)
const nonEmptySchool = (r: EducationEntry) =>
  Boolean(r.institution || r.qualification || r.field || r.year)

export const jobseekerSchema = z
  .object({
    headline: text(120, 'headline max 120 characters'),
    occupation: choice(OCCUPATIONS, 'pick an occupation group'),
    sector: choice(SECTORS, 'pick a sector'),
    location: z
      .string()
      .trim()
      .default('Botswana')
      .refine((v) => (LOCATIONS as readonly string[]).includes(v), 'pick a place'),
    workMode: choice(WORK_MODES, 'pick a work mode'),
    employmentType: choice(EMPLOYMENT_TYPES, 'pick an employment type'),
    educationLevel: choice(EDUCATION_LEVELS, 'pick an education level'),
    years: z
      .preprocess((v) => Number(v ?? 0), z.number())
      .refine((v) => Number.isInteger(v) && v >= 0 && v <= 50, 'experience must be 0-50 years'),
    salaryMin: optionalInt(0, 1_000_000, 'salary must be 0-1,000,000'),
    salaryPeriod: choice(SALARY_PERIODS, 'pick a salary period'),
    skills: text(500, 'skills max 500 characters'),
    about: text(1000, 'about max 1000 characters'),
    phone: text(40, 'phone max 40 characters').refine(
      (v) => !v || /^[+0-9 ()-]{6,40}$/.test(v),
      'phone is not valid',
    ),
    visible: z.boolean().default(false),
    relocate: z.boolean().default(false),
    availableFrom: isoDate('availability must be YYYY-MM-DD'),
    languages: text(300, 'languages max 300 characters'),
    certifications: text(500, 'certifications max 500 characters'),
    experience: z
      .array(experienceEntry)
      .max(MAX_ROLES, `at most ${MAX_ROLES} roles`)
      .default([])
      .transform((rows) => rows.filter(nonEmptyRole)),
    education: z
      .array(educationEntry)
      .max(MAX_SCHOOLS, `at most ${MAX_SCHOOLS} qualifications`)
      .default([])
      .transform((rows) => rows.filter(nonEmptySchool)),
  })
  .superRefine((v, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: 'custom', path: ['experience'], message })

    if (v.salaryMin !== null && !v.salaryPeriod) {
      ctx.addIssue({ code: 'custom', path: ['salaryPeriod'], message: 'pick a salary period' })
    }

    for (const r of v.experience) {
      if (!r.title) return fail('every role needs a job title')
      if (!r.company) return fail('every role needs a company')
      if (!r.startDate) return fail('every role needs a start date')
      if (r.current && r.endDate) return fail('a current role cannot have an end date')
      if (!r.current && !r.endDate) return fail('every past role needs an end date')
      if (!r.current && r.endDate < r.startDate) return fail('a role cannot end before it starts')
    }

    for (const r of v.education) {
      if (!r.institution) {
        return ctx.addIssue({ code: 'custom', path: ['education'], message: 'every qualification needs an institution' })
      }
      if (!r.qualification) {
        return ctx.addIssue({ code: 'custom', path: ['education'], message: 'every qualification needs a name' })
      }
    }
  })

export type ExperienceEntry = z.infer<typeof experienceEntry>
export type EducationEntry = z.infer<typeof educationEntry>
export type JobseekerInput = z.infer<typeof jobseekerSchema>
export type JobseekerErrors = Partial<Record<keyof JobseekerInput, string>>

export const emptyJobseeker: JobseekerInput = jobseekerSchema.parse({})

// The form and the API both call this, so one rejection message reaches the user.
export function parseJobseeker(body: unknown): { data: JobseekerInput } | { error: string } {
  const result = jobseekerSchema.safeParse(body ?? {})
  if (result.success) return { data: result.data }
  return { error: result.error.issues[0]?.message ?? 'invalid profile' }
}

// DB rows are snake_case and may hold nulls; typed here so the page stays camel.
export function jobseekerFromRow(
  row: any,
  experience: ExperienceEntry[],
  education: EducationEntry[],
): JobseekerInput {
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
    visible: Boolean(row.visible_to_employers),
    relocate: Boolean(row.relocate),
    availableFrom: row.available_from ?? '',
    languages: row.languages ?? '',
    certifications: row.certifications ?? '',
    experience,
    education,
  }
}

export function experienceFromRow(row: any): ExperienceEntry {
  return {
    title: row.title ?? '',
    company: row.company ?? '',
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? '',
    current: Boolean(row.current),
    description: row.description ?? '',
  }
}

export function educationFromRow(row: any): EducationEntry {
  return {
    institution: row.institution ?? '',
    qualification: row.qualification ?? '',
    field: row.field ?? '',
    year: row.year ?? null,
  }
}
