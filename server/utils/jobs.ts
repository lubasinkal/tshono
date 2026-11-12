import { pool } from '~~/lib/db'
import { districtFor, validateJob, type JobInput } from '~~/shared/job'
import { indexJob, unindexJob } from './typesense'

export interface JobRow {
  id: string
  organization_id: string | null
  source: 'employer' | 'scraper'
  external_id: string | null
  company: string | null
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
  featured_until: Date | null
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

function columns(company: string, input: JobInput) {
  return [
    company,
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

export async function refreshIndex(job: JobRow): Promise<boolean> {
  return tryIndex(job)
}

async function tryIndex(job: JobRow): Promise<boolean> {
  try {
    const indexed = await indexJob(job)
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
    `insert into jobs (organization_id, source, company, title, sector, location, occupation, employment_type,
       vacancies, work_mode, education_level, min_years, salary_min, salary_max, salary_period,
       contract_months, district, closing, apply_url, blurb, content)
     values ($1,'employer',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     returning *`,
    [orgId, ...columns(company, input)],
  )
  const job = rows[0]!
  return { job, indexed: await tryIndex(job) }
}

export async function updateJob(id: string, orgId: string, company: string, input: JobInput) {
  const c = columns(company, input)
  const { rows } = await pool.query<JobRow>(
    `update jobs set company=$3, title=$4, sector=$5, location=$6, occupation=$7, employment_type=$8,
       vacancies=$9, work_mode=$10, education_level=$11, min_years=$12, salary_min=$13,
       salary_max=$14, salary_period=$15, contract_months=$16, district=$17, closing=$18,
       apply_url=$19, blurb=$20, content=$21, updated_at=now()
     where id=$1 and organization_id=$2 returning *`,
    [id, orgId, ...c],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found' })
  const job = rows[0]!
  return { job, indexed: await tryIndex(job) }
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

// Spends one featured credit on a live job: 30 days at the top of search.
export async function featureJob(id: string, orgId: string) {
  const client = await pool.connect()
  let job: JobRow
  try {
    await client.query('begin')
    const profile = await client.query<{ featured_credits: number }>(
      'select featured_credits from employer_profiles where organization_id = $1 for update',
      [orgId],
    )
    if (!profile.rows[0] || profile.rows[0].featured_credits < 1) {
      await client.query('rollback')
      throw createError({ statusCode: 422, statusMessage: 'no featured credits; buy a pack first' })
    }
    await client.query(
      'update employer_profiles set featured_credits = featured_credits - 1 where organization_id = $1',
      [orgId],
    )
    const updated = await client.query<JobRow>(
      `update jobs
          set featured_until = greatest(now(), coalesce(featured_until, now())) + interval '30 days',
              updated_at = now()
        where id = $1 and organization_id = $2 and status = 'live'
        returning *`,
      [id, orgId],
    )
    if (!updated.rows.length) {
      await client.query('rollback')
      throw createError({ statusCode: 404, statusMessage: 'live job not found' })
    }
    job = updated.rows[0]!
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    throw e
  } finally {
    client.release()
  }
  return { job, indexed: await tryIndex(job) }
}
