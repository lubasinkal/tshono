import { sampleJobs, type SampleJob } from '~/data/sampleJobs'

export interface JobHit extends SampleJob {
  content?: string
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
): Promise<{ hits: JobHit[]; found: number }> {
  const res = await liveRaw({
    q: query.trim() || '',
    query_by: 'title,company,sector,location,blurb',
    sort_by: 'posted:desc',
    page: String(page),
    per_page: String(perPage),
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
  const r = res as { hits?: Array<{ document: JobHit }>; found?: number }
  return { hits: (r.hits ?? []).map((h) => h.document), found: r.found ?? 0 }
}

export async function liveRaw(params: Record<string, string>): Promise<unknown> {
  const { base, key } = remoteBase()
  return $fetch(`${base}/search`, {
    params,
    headers: { 'X-TYPESENSE-API-KEY': key },
  })
}

export async function remoteGet(id: string): Promise<JobHit | null> {
  const { base, key } = remoteBase()
  try {
    return await $fetch<JobHit>(`${base}/${id}`, {
      headers: { 'X-TYPESENSE-API-KEY': key },
    })
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
