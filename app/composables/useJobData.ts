import type { SampleJob } from '~/data/sampleJobs'
import { daysLeft, liveRaw, toJobHit } from '~/composables/useJobSearch'

interface RawDoc {
  id: string
  title: string
  company: string
  sector: string
  location: string
  blurb: string
  url: string
  closing: string
  posted: number
  min_years: number
  salary_min?: number
  salary_max?: number
  salary_period?: string
  employment_type?: string
  work_mode?: string
}

export interface Seg { name: string; count: number; share: number }
export interface Day { label: string; total: number; segs: Seg[] }

const LS_KEY = 'tshono:insights:v1'
const CACHE_MS = 5 * 60_000

// One muted family at a consistent lightness, so the chart reads as part of the
// page instead of a rainbow. Hues stay far enough apart to tell sectors apart.
const PALETTE = [
  'oklch(72% 0.12 230)', 'oklch(74% 0.10 195)', 'oklch(76% 0.11 150)', 'oklch(78% 0.11 118)',
  'oklch(80% 0.11 92)', 'oklch(78% 0.12 66)', 'oklch(74% 0.12 45)', 'oklch(72% 0.13 25)',
  'oklch(70% 0.12 352)', 'oklch(68% 0.11 318)', 'oklch(66% 0.10 288)', 'oklch(70% 0.11 255)',
] as const
const SECTOR_COLOR = new Map<string, string>()

// Single source of truth for the full job set + derived aggregates. Shared via
// useState so insights, company and sector pages all reuse one fetch + cache.
export function useJobData() {
  const liveDocs = useState<SampleJob[] | null>('tshono:all-docs', () => null)
  const loadState = useState<'loading' | 'ready' | 'error'>('tshono:load-state', () => 'loading')
  const loaded = useState<boolean>('tshono:loaded', () => false)

  const nowDate = new Date()

  async function load(force = false) {
    if (!import.meta.client) return
    if (loaded.value && !force) return
    loaded.value = true
    // hydrate from localStorage instantly — perceived 0ms
    try {
      const cached = localStorage.getItem(LS_KEY)
      if (cached) {
        const { at, docs } = JSON.parse(cached) as { at: number; docs: SampleJob[] }
        if (Date.now() - at < CACHE_MS && Array.isArray(docs) && docs.length) {
          liveDocs.value = docs
          loadState.value = 'ready'
        }
      }
    } catch {}
    try {
      const fields = 'id,title,company,sector,location,url,closing,posted,min_years,salary_min,salary_max,salary_period,employment_type,work_mode'
      const perPage = 250
      const first = (await liveRaw({ q: '', query_by: 'title', per_page: String(perPage), page: '1', include_fields: fields })) as { hits?: Array<{ document: RawDoc }>; found?: number }
      const hits0 = first.hits ?? []
      const found = first.found ?? hits0.length
      const docs: SampleJob[] = hits0.map((h) => toJobHit(h.document as unknown as Record<string, unknown>))
      if (!liveDocs.value && docs.length) { liveDocs.value = [...docs]; loadState.value = 'ready' }
      const pages = Math.ceil(found / perPage)
      if (pages > 1) {
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            liveRaw({ q: '', query_by: 'title', per_page: String(perPage), page: String(i + 2), include_fields: fields }) as Promise<{ hits?: Array<{ document: RawDoc }> }>,
          ),
        )
        for (const r of rest) for (const h of (r.hits ?? [])) docs.push(toJobHit(h.document as unknown as Record<string, unknown>))
      }
      liveDocs.value = docs
      loadState.value = 'ready'
      try { localStorage.setItem(LS_KEY, JSON.stringify({ at: Date.now(), docs })) } catch {}
    } catch {
      if (!liveDocs.value) loadState.value = 'error'
    }
  }

  const allDocs = computed<SampleJob[]>(() => liveDocs.value ?? [])
  const epoch = (iso: string) => new Date(iso + 'T00:00:00').getTime()
  const maxPosted = computed(() => Math.max(...allDocs.value.map((j) => epoch(j.posted)), 0))

  // Single-pass derived aggregates — O(N) instead of O(S*N + 60*N).
  const derived = computed(() => {
    const docs = allDocs.value
    const total = docs.length
    const maxP = maxPosted.value
    const wStart = maxP - 6 * 86400000
    const pStart = maxP - 13 * 86400000
    let fresh = 0
    let urgent = 0
    let entryCnt = 0
    const sec = new Map<string, number>()
    const loc = new Map<string, number>()
    const comp = new Map<string, { count: number; loc: string }>()
    const secWeek = new Map<string, number>()
    const secPrev = new Map<string, number>()
    const entry = new Map<string, { count: number; example: string; exampleId: string }>()
    const dayMap = new Map<string, Map<string, number>>()
    for (const j of docs) {
      const ep = epoch(j.posted)
      if (ep >= wStart) fresh++
      if (j.minYears === 0) entryCnt++
      if (j.closing) { const d = daysLeft(j.closing, nowDate); if (d >= 0 && d <= 7) urgent++ }
      sec.set(j.sector, (sec.get(j.sector) ?? 0) + 1)
      loc.set(j.location, (loc.get(j.location) ?? 0) + 1)
      const ce = comp.get(j.company)
      if (!ce) comp.set(j.company, { count: 1, loc: j.location })
      else ce.count++
      if (ep >= wStart) secWeek.set(j.sector, (secWeek.get(j.sector) ?? 0) + 1)
      else if (ep >= pStart) secPrev.set(j.sector, (secPrev.get(j.sector) ?? 0) + 1)
      if (j.minYears === 0) {
        const e = entry.get(j.sector)
        if (!e) entry.set(j.sector, { count: 1, example: j.title, exampleId: j.id })
        else e.count++
      }
      let dm = dayMap.get(j.posted)
      if (!dm) { dm = new Map(); dayMap.set(j.posted, dm) }
      dm.set(j.sector, (dm.get(j.sector) ?? 0) + 1)
    }
    const toSorted = (m: Map<string, number>) => [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    const bySectorRaw = toSorted(sec)
    const bySector = bySectorRaw.map((r) => {
      const thisW = secWeek.get(r.name) ?? 0
      const prevW = secPrev.get(r.name) ?? 0
      return { ...r, delta: prevW === 0 ? null : Math.round(((thisW - prevW) / prevW) * 100) as number | null }
    })
    return { total, fresh, urgent, entryCnt, bySectorRaw, bySector, byPlace: toSorted(loc), topCompanies: [...comp.entries()].map(([name, v]) => ({ name, count: v.count, loc: v.loc })).sort((a, b) => b.count - a.count).slice(0, 10), entryBySector: [...entry.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count).slice(0, 8), dayMap }
  })

  const total = computed(() => derived.value.total)
  const fresh = computed(() => derived.value.fresh)
  const urgent = computed(() => derived.value.urgent)
  const entryShare = computed(() => derived.value.total ? Math.round((derived.value.entryCnt / derived.value.total) * 100) : 0)
  const bySectorRaw = computed(() => derived.value.bySectorRaw)
  const byPlace = computed(() => derived.value.byPlace)
  const topCompanies = computed(() => derived.value.topCompanies)
  const bySector = computed(() => derived.value.bySector)
  const entryBySector = computed(() => derived.value.entryBySector)

  const updated = computed(() => {
    const d = new Date(maxPosted.value || nowDate.getTime())
    const s = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
    return `${s}, live`
  })

  function companyBase(name: string): string {
    return (derived.value.topCompanies.find((x) => x.name === name)?.loc ?? '').toLowerCase()
  }

  const closingSoon = computed(() => {
    const dated = allDocs.value
      .filter((j) => j.closing)
      .map((j) => ({ j, d: daysLeft(j.closing, nowDate) }))
      .filter((x) => x.d >= 0)
      .sort((a, b) => a.d - b.d)
      .map((x) => x.j)
    if (dated.length >= 6) return dated.slice(0, 6)
    const seen = new Set(dated.map((j) => j.id))
    const freshTop = [...allDocs.value]
      .sort((a, b) => epoch(b.posted) - epoch(a.posted))
      .filter((j) => !seen.has(j.id))
      .slice(0, 6 - dated.length)
    return [...dated, ...freshTop]
  })

  function sectorColor(name: string): string {
    const cached = SECTOR_COLOR.get(name)
    if (cached) return cached
    // assign next palette slot by global frequency rank so #1..#N never collide
    const rank = bySectorRaw.value.findIndex((r) => r.name === name)
    let c: string
    if (rank !== -1 && rank < PALETTE.length) c = PALETTE[rank]!
    else {
      // overflow beyond palette: hash -> golden angle with distinct S/L tiers
      let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
      const tier = h % 3
      const sat = [78, 68, 88][tier]!
      const lig = [60, 65, 55][tier]!
      c = `hsl(${((h * 137.5) % 360).toFixed(1)} ${sat}% ${lig}%)`
    }
    SECTOR_COLOR.set(name, c)
    return c
  }

  const daily = computed(() => {
    const dm = derived.value.dayMap
    // global frequency order — #1 most frequent at bottom
    const rank = new Map(derived.value.bySectorRaw.map((r, i) => [r.name, i]))
    const days: Day[] = []
    for (let back = 59; back >= 0; back--) {
      const key = new Date(maxPosted.value - back * 86400000).toISOString().slice(0, 10)
      const m = dm.get(key)
      if (!m) { days.push({ label: key, total: 0, segs: [] }); continue }
      let tot = 0; for (const c of m.values()) tot += c
      const segs = [...m.entries()]
        .map(([name, count]) => ({ name, count, share: tot ? (count / tot) * 100 : 0 }))
        .sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999))
        .slice(0, 8)
      days.push({ label: key, total: tot, segs })
    }
    return days
  })
  const maxTotal = computed(() => Math.max(...daily.value.map((d) => d.total), 1))

  // Generic helpers for per-entity pages.
  function countBy(docs: SampleJob[], key: (j: SampleJob) => string): Array<{ name: string; count: number }> {
    const m = new Map<string, number>()
    for (const j of docs) m.set(key(j), (m.get(key(j)) ?? 0) + 1)
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }

  function dailySeries(docs: SampleJob[], maxP: number): Array<{ label: string; total: number }> {
    const map = new Map<string, number>()
    for (const j of docs) map.set(j.posted, (map.get(j.posted) ?? 0) + 1)
    const days: Array<{ label: string; total: number }> = []
    for (let back = 59; back >= 0; back--) {
      const key = new Date(maxP - back * 86400000).toISOString().slice(0, 10)
      days.push({ label: key, total: map.get(key) ?? 0 })
    }
    return days
  }

  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  function fmtDay(iso: string): string {
    const dt = new Date(iso + 'T00:00:00')
    return `${MON[dt.getMonth()] ?? ''} ${dt.getDate()}`
  }

  return {
    liveDocs, loadState, load, allDocs, nowDate, maxPosted,
    total, fresh, urgent, entryShare, updated,
    bySectorRaw, byPlace, topCompanies, bySector, entryBySector,
    closingSoon, daily, maxTotal, companyBase, sectorColor, fmtDay,
    countBy, dailySeries,
  }
}
