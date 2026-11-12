import { pool } from '~~/lib/db'
import { districtFor, validateJob, type JobInput } from '~~/shared/job'
import { indexJob, unindexJob } from './typesense'

export interface JobRow {
  id: string
  organization_id: string
  title: string
  sector: string
  location: string
  occupation: string | null
  employment_type: string | null
  vacancies: number
  work_mode: string | null
  education_level: string | null
  salary_min: number | null
  salary_max: number | null
  salary_period: string | null
  contract_months: number | null
  district: string | null
  min_years: number
  closing: string | null
  apply_url: string
  blurb: string
  content: string
  status: 'live' | 'closed'
  posted_at: Date
  indexed_at: Date | null
  closed_at: Date | null
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const num = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v)

export function readJobInput(body: any): JobInput {
  return {
    title: str(body?.title, 120),
    sector: str(body?.sector, 40),
    location: str(body?.location, 40),
    occupation: str(body?.occupation, 60),
    employmentType: str(body?.employmentType, 20),
    vacancies: Number(body?.vacancies ?? 1),
    workMode: str(body?.workMode, 20),
    educationLevel: str(body?.educationLevel, 20),
    minYears: Number(body?.minYears ?? 0),
    salaryMin: num(body?.salaryMin),
    salaryMax: num(body?.salaryMax),
    salaryPeriod: str(body?.salaryPeriod, 20),
    contractMonths: num(body?.contractMonths),
    closing: str(body?.closing, 10),
    applyUrl: str(body?.applyUrl, 500),
    blurb: str(body?.blurb, 400),
    content: str(body?.content, 8000),
  }
}

export function assertValid(input: JobInput): void {
  const errors = validateJob(input)
  if (Object.keys(errors).length) {
    throw createError({ statusCode: 422, statusMessage: 'check the job form', data: { errors } })
  }
}

function columns(input: JobInput) {
  return [
    input.title,
    input.sector,
    input.location,
    input.occupation,
    input.employmentType,
    input.vacancies,
    input.workMode,
    input.educationLevel || null,
    input.minYears,
    input.salaryMin,
    input.salaryMax,
    input.salaryPeriod || null,
    input.contractMonths,
    districtFor(input.location),
    input.closing || null,
    input.applyUrl,
    input.blurb,
    input.content,
  ]
}

async function tryIndex(job: JobRow, company: string): Promise<boolean> {
  try {
    const indexed = await indexJob({ ...job, company })
    if (indexed) await pool.query('update jobs set indexed_at = now() where id = $1', [job.id])
    return indexed
  } catch (e) {
    // Job is saved either way; the dashboard shows it as not yet indexed.
    console.error('typesense index failed', (e as Error).message)
    return false
  }
}

export async function createJob(orgId: string, company: string, input: JobInput) {
  const { rows: live } = await pool.query<{ n: number }>(
    `select count(*)::int as n from jobs where organization_id = $1 and status = 'live'`,
    [orgId],
  )
  if (live[0]!.n >= 5) {
    throw createError({ statusCode: 422, statusMessage: 'free accounts can have 5 live jobs; close one first' })
  }
  const { rows } = await pool.query<JobRow>(
    `insert into jobs (organization_id, title, sector, location, occupation, employment_type,
       vacancies, work_mode, education_level, min_years, salary_min, salary_max, salary_period,
       contract_months, district, closing, apply_url, blurb, content)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     returning *`,
    [orgId, ...columns(input)],
  )
  const job = rows[0]!
  return { job, indexed: await tryIndex(job, company) }
}

export async function updateJob(id: string, orgId: string, company: string, input: JobInput) {
  const c = columns(input)
  const { rows } = await pool.query<JobRow>(
    `update jobs set title=$3, sector=$4, location=$5, occupation=$6, employment_type=$7,
       vacancies=$8, work_mode=$9, education_level=$10, min_years=$11, salary_min=$12,
       salary_max=$13, salary_period=$14, contract_months=$15, district=$16, closing=$17,
       apply_url=$18, blurb=$19, content=$20, updated_at=now()
     where id=$1 and organization_id=$2 returning *`,
    [id, orgId, ...c],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found' })
  const job = rows[0]!
  return { job, indexed: await tryIndex(job, company) }
}

export async function closeJob(id: string, orgId: string) {
  const { rows } = await pool.query<{ id: string }>(
    `update jobs set status='closed', closed_at=now(), updated_at=now()
      where id=$1 and organization_id=$2 returning id`,
    [id, orgId],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found' })
  try {
    await unindexJob(rows[0]!.id)
  } catch (e) {
    console.error('typesense unindex failed', (e as Error).message)
  }
}

export async function listJobs(orgId: string) {
  const { rows } = await pool.query<JobRow>(
    `select * from jobs where organization_id = $1 order by created_at desc`,
    [orgId],
  )
  return rows
}
