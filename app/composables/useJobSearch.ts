import { sampleJobs, type SampleJob } from '~/data/sampleJobs'

export interface JobHit extends SampleJob {}

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
): Promise<JobHit[]> {
  const { base, key } = remoteBase()
  const filters: string[] = []
  if (sector) filters.push(`sector:=${sector}`)
  if (location) filters.push(`location:=${location}`)
  if (maxYears !== null) filters.push(`min_years:<=${maxYears}`)
  const params: Record<string, string> = {
    q: query.trim() || '*',
    query_by: 'title,company,sector,location,blurb',
    sort_by: 'posted:desc',
    per_page: '50',
  }
  if (filters.length) params.filter_by = filters.join(' && ')
  const res = await $fetch<{ hits?: Array<{ document: JobHit }> }>(`${base}/search`, {
    params,
    headers: { 'X-TYPESENSE-API-KEY': key },
  })
  return (res.hits ?? []).map((h) => h.document)
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
