// Copies every scraped job from the Typesense index into Postgres.
// Idempotent: re-running updates the same rows by (source, external_id).
// Run: set -a; . ./.env.production; set +a; bun run scripts/backfill-from-typesense.ts
import { pool } from '../lib/db'

const host = (process.env.TYPESENSE_URL || process.env.NUXT_PUBLIC_SEARCH_HOST || 'ts.lubasiverse.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '')
const key = process.env.TYPESENSE_ADMIN_KEY || process.env.TYPESENSE_API_KEY || ''

if (!key) {
  console.error('no Typesense admin key in env')
  process.exit(1)
}

type Doc = Record<string, any>

const res = await fetch(`https://${host}/collections/jobs/documents/export`, {
  headers: { 'X-TYPESENSE-API-KEY': key },
})
if (!res.ok) {
  console.error('export failed', res.status, (await res.text()).slice(0, 200))
  process.exit(1)
}

const docs: Doc[] = (await res.text())
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((d) => typeof d.id === 'string' && d.id.startsWith('bwinfo-'))

const dateOnly = (v: unknown): string | null => {
  const s = String(v ?? '').slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}
const intOrNull = (v: unknown) => (typeof v === 'number' && v > 0 ? Math.round(v) : null)
const strOrNull = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

let written = 0
for (const d of docs) {
  const closing = dateOnly(d.closing)
  const title = String(d.title ?? 'Untitled role').slice(0, 120)
  const company = String(d.company ?? '').slice(0, 120)
  const dedupe = `${company.toLowerCase()}|${title.toLowerCase()}|${closing ?? ''}`

  await pool.query(
    `insert into jobs (source, external_id, organization_id, company, title, sector, location,
       occupation, employment_type, vacancies, work_mode, education_level, min_years,
       salary_min, salary_max, salary_period, contract_months, district,
       closing, apply_url, blurb, content, status, posted_at, dedupe_key, indexed_at)
     values ('scraper',$1,null,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'live',
       to_timestamp($21),$22,now())
     on conflict (source, external_id) where external_id is not null do update set
       company = excluded.company, title = excluded.title, sector = excluded.sector,
       location = excluded.location, occupation = excluded.occupation,
       employment_type = excluded.employment_type, vacancies = excluded.vacancies,
       work_mode = excluded.work_mode, education_level = excluded.education_level,
       min_years = excluded.min_years, salary_min = excluded.salary_min,
       salary_max = excluded.salary_max, salary_period = excluded.salary_period,
       contract_months = excluded.contract_months, district = excluded.district,
       closing = excluded.closing, apply_url = excluded.apply_url, blurb = excluded.blurb,
       content = excluded.content, posted_at = excluded.posted_at,
       dedupe_key = excluded.dedupe_key, updated_at = now()`,
    [
      d.id, company, title, String(d.sector ?? 'General'), String(d.location ?? 'Botswana'),
      strOrNull(d.occupation), strOrNull(d.employment_type), intOrNull(d.vacancies) ?? 1,
      strOrNull(d.work_mode), strOrNull(d.education_level), Number(d.min_years) || 0,
      intOrNull(d.salary_min), intOrNull(d.salary_max), strOrNull(d.salary_period),
      intOrNull(d.contract_months), strOrNull(d.district), closing,
      String(d.url ?? ''), String(d.blurb ?? ''), String(d.content ?? ''),
      Number(d.posted) || Math.floor(Date.now() / 1000), dedupe,
    ],
  )
  written++
}

// Employer rows written before `company` existed: fill it from the organization.
const filled = await pool.query(
  `update jobs j set company = o.name
     from organization o
    where j.organization_id = o.id and (j.company is null or j.company = '')`,
)

const total = await pool.query(`select source, count(*)::int as n from jobs group by source order by source`)
console.log(`scraped docs written: ${written}`)
console.log(`employer rows given a company: ${filled.rowCount}`)
for (const r of total.rows) console.log(`  ${r.source}: ${r.n}`)
await pool.end()
