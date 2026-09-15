import { sampleJobs, type SampleJob } from '~/data/sampleJobs'

export interface JobHit extends SampleJob {
  content?: string
}

// Typesense stores snake_case. UI reads camelCase. Normalize every live doc here.
export function toJobHit(d: Record<string, unknown>): JobHit {
  return {
    id: String(d.id ?? ''),
    title: String(d.title ?? 'Untitled role'),
    company: String(d.company ?? 'Hiring firm'),
    sector: String(d.sector ?? 'General'),
    location: String(d.location ?? 'Botswana'),
    blurb: String(d.blurb ?? ''),
    url: String(d.url ?? ''),
    closing: String(d.closing ?? ''),
    posted: typeof d.posted === 'number' ? new Date(d.posted * 1000).toISOString().slice(0, 10) : String(d.posted ?? ''),
    minYears: typeof d.min_years === 'number' ? d.min_years : 0,
    content: typeof d.content === 'string' ? d.content : undefined,
  }
}

// Single swap point. Remote Typesense when a search key is configured,
// otherwise the local sample file. UI code never talks to Typesense directly.
export function isRemote(): boolean {
  try {
    return Boolean(useRuntimeConfig().public.searchKey)
  } catch {
    return false
  }
}

function remoteBase(): { base: string; key: string; collection: string } {
  const c = useRuntimeConfig().public as Record<string, string>
  return {
    base: `${c.searchProtocol || 'https'}://${c.searchHost}/collections/${c.searchCollection || 'jobs'}/documents`,
    key: c.searchKey ?? '',
    collection: c.searchCollection || 'jobs',
  }
}

export async function remoteSearch(
  query: string,
  sector: string,
  location: string,
  maxYears: number | null,
  page = 1,
  perPage = 20,
): Promise<{ hits: JobHit[]; found: number; took: number }> {
  const res = await liveRaw({
    q: query.trim() || '',
    query_by: 'title,company,sector,location,blurb',
    sort_by: 'posted:desc',
    page: String(page),
    per_page: String(perPage),
    include_fields: 'id,title,company,sector,location,blurb,url,closing,posted,min_years',
    ...(sector || location || maxYears !== null
      ? {
          filter_by: [
            ...(sector ? [`sector:=${sector}`] : []),
            ...(location ? [`location:=${location}`] : []),
            ...(maxYears !== null ? [`min_years:<=${maxYears}`] : []),
          ].join(' && '),
        }
      : {}),
  })
  const r = res as { hits?: Array<{ document: Record<string, unknown> }>; found?: number; search_time_ms?: number }
  return { hits: (r.hits ?? []).map((h) => toJobHit(h.document)), found: r.found ?? 0, took: r.search_time_ms ?? 0 }
}

let abort: AbortController | null = null
const Q_CACHE = new Map<string, { at: number; data: unknown }>()
const Q_TTL = 30_000
function cacheKey(params: Record<string, string>): string {
  return Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&')
}
export async function liveRaw(params: Record<string, string>): Promise<unknown> {
  const { base, key } = remoteBase()
  const ck = cacheKey(params)
  const hit = Q_CACHE.get(ck)
  if (hit && Date.now() - hit.at < Q_TTL) return hit.data
  if (abort) abort.abort()
  abort = new AbortController()
  const data = await $fetch(`${base}/search`, {
    params,
    headers: { 'X-TYPESENSE-API-KEY': key },
    signal: abort.signal as unknown as AbortSignal,
  })
  Q_CACHE.set(ck, { at: Date.now(), data })
  return data
}
export function liveRawCached(params: Record<string, string>): unknown | null {
  const hit = Q_CACHE.get(cacheKey(params))
  return hit && Date.now() - hit.at < Q_TTL ? hit.data : null
}

export async function remoteGet(id: string): Promise<JobHit | null> {
  try {
    // Scoped browser keys allow search only, so look up by id filter.
    const res = (await liveRaw({
      q: '',
      query_by: 'title',
      filter_by: `id:=${id}`,
      per_page: '1',
    })) as { hits?: Array<{ document: Record<string, unknown> }> }
    return res.hits?.[0]?.document ? toJobHit(res.hits[0].document) : null
  } catch {
    return null
  }
}

export function searchJobsLocal(query: string, sector: string, location: string, maxYears: number | null) {
  const q = query.trim().toLowerCase()
  return sampleJobs.filter((j) => {
    if (sector && j.sector !== sector) return false
    if (location && j.location !== location) return false
    if (maxYears !== null && j.minYears > maxYears) return false
    if (!q) return true
    const hay = `${j.title} ${j.company} ${j.sector} ${j.location} ${j.blurb}`.toLowerCase()
    return q.split(/\s+/).every((w) => hay.includes(w))
  })
}

export function daysLeft(closing: string, now = new Date()): number {
  const ms = new Date(closing + 'T23:59:59').getTime() - now.getTime()
  return Math.ceil(ms / 86400000)
}
