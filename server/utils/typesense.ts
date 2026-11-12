// Server-side writer for the public search index. The admin key never leaves the
// server: the browser keeps using the scoped search-only key.

function host(): string {
  const raw = process.env.TYPESENSE_URL || process.env.NUXT_PUBLIC_SEARCH_HOST || 'ts.lubasiverse.com'
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function key(): string {
  return process.env.TYPESENSE_ADMIN_KEY || process.env.TYPESENSE_API_KEY || ''
}

export interface IndexableJob {
  id: string
  title: string
  company: string
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
  blurb: string
  content: string
  apply_url: string
  posted_at: Date | string
}

export function toJobDoc(job: IndexableJob) {
  const posted = new Date(job.posted_at).getTime() / 1000
  return {
    id: `emp-${job.id}`,
    title: job.title,
    company: job.company,
    sector: job.sector,
    location: job.location,
    occupation: job.occupation ?? '',
    employment_type: job.employment_type ?? '',
    vacancies: job.vacancies,
    work_mode: job.work_mode ?? '',
    education_level: job.education_level ?? '',
    salary_min: job.salary_min ?? 0,
    salary_max: job.salary_max ?? 0,
    salary_period: job.salary_period ?? '',
    contract_months: job.contract_months ?? 0,
    district: job.district ?? '',
    blurb: job.blurb.slice(0, 300),
    content: job.content,
    url: job.apply_url,
    closing: job.closing ?? '',
    posted: Math.floor(posted),
    min_years: job.min_years,
  }
}

export async function indexJob(job: IndexableJob): Promise<boolean> {
  if (!key()) return false
  const res = await fetch(`https://${host()}/collections/jobs/documents?action=upsert`, {
    method: 'POST',
    headers: { 'X-TYPESENSE-API-KEY': key(), 'content-type': 'application/json' },
    body: JSON.stringify(toJobDoc(job)),
  })
  if (!res.ok) throw new Error(`typesense upsert ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return true
}

export async function unindexJob(id: string): Promise<void> {
  if (!key()) return
  const res = await fetch(`https://${host()}/collections/jobs/documents/emp-${id}`, {
    method: 'DELETE',
    headers: { 'X-TYPESENSE-API-KEY': key() },
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`typesense delete ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
}
