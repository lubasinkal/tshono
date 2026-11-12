import { pool } from '~~/lib/db'
import { validateJob, type JobInput } from '~~/shared/job'
import { indexJob, unindexJob } from './typesense'

export interface JobRow {
  id: string
  organization_id: string
  title: string
  sector: string
  location: string
  min_years: number
  closing: string | null
  apply_url: string
  blurb: string
  content: string
  status: 'live' | 'closed'
  posted_at: Date
  indexed_at: Date | null
}

export function readJobInput(body: any): JobInput {
  const s = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
  return {
    title: s(body?.title, 120),
    sector: s(body?.sector, 40),
    location: s(body?.location, 40),
    minYears: Number(body?.minYears ?? 0),
    closing: s(body?.closing, 10),
    applyUrl: s(body?.applyUrl, 500),
    blurb: s(body?.blurb, 400),
    content: s(body?.content, 8000),
  }
}

export function assertValid(input: JobInput): void {
  const errors = validateJob(input)
  if (Object.keys(errors).length) {
    throw createError({ statusCode: 422, statusMessage: 'check the job form', data: { errors } })
  }
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
    `insert into jobs (organization_id, title, sector, location, min_years, closing, apply_url, blurb, content)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
    [orgId, input.title, input.sector, input.location, input.minYears, input.closing || null, input.applyUrl, input.blurb, input.content],
  )
  const job = rows[0]!
  return { job, indexed: await tryIndex(job, company) }
}

export async function updateJob(id: string, orgId: string, company: string, input: JobInput) {
  const { rows } = await pool.query<JobRow>(
    `update jobs set title=$3, sector=$4, location=$5, min_years=$6, closing=$7,
            apply_url=$8, blurb=$9, content=$10, updated_at=now()
      where id=$1 and organization_id=$2 returning *`,
    [id, orgId, input.title, input.sector, input.location, input.minYears, input.closing || null, input.applyUrl, input.blurb, input.content],
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'job not found' })
  const job = rows[0]!
  return { job, indexed: await tryIndex(job, company) }
}

export async function closeJob(id: string, orgId: string) {
  const { rows } = await pool.query<{ id: string }>(
    `update jobs set status='closed', updated_at=now() where id=$1 and organization_id=$2 returning id`,
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
