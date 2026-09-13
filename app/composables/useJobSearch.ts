import { sampleJobs } from '~/data/sampleJobs'

// Single swap point. Today this filters the local sample file.
// Tomorrow it calls Typesense with the same signature and the UI stays untouched.
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
