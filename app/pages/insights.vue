<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ loadState === 'loading' ? '…' : total }} roles tracked</span>
      <span class="chip">{{ loadState === 'ready' ? '● live aggregates' : '○ loading live…' }}</span>
      <span class="updated">updated {{ updated }}</span>
    </div>

    <h1 class="title">Hiring Data</h1>
    <p class="sub">See who is hiring in Botswana, where demand sits, and which roles close soon.</p>

    <div v-if="loadState === 'loading'" class="skel">
      <div class="grid">
        <div v-for="i in 4" :key="i" class="stat pulse"><b>…</b><span>loading live index</span></div>
      </div>
      <div v-for="i in 6" :key="'r' + i" class="row pulse-row"><span></span></div>
    </div>

    <div v-else-if="liveDocs && liveDocs.length">

    <div class="grid">
      <div class="stat"><b>{{ total }}</b><span>roles tracked</span></div>
      <div class="stat"><b>{{ fresh }}</b><span>fresh this week</span></div>
      <div class="stat"><b>{{ urgent }}</b><span>closing in 7 days</span></div>
      <div class="stat"><b>{{ entryShare }}%</b><span>entry level share</span></div>
    </div>

    <h2 class="sect"><span>#</span> Top Sectors. Daily postings by sector, last 60 days. <span class="peak">peak {{ maxTotal }}/day</span></h2>
    <div ref="chartEl" class="chartscroll">
    <div class="weekaxis"><span v-for="(day, i) in daily" :key="day.label"><b v-if="isTick(i)" :class="i % 14 === 3 ? 'tick' : 'tick tick--minor'">{{ fmtDay(day.label) }}</b></span></div>
    <div class="stack" @mouseleave="hoverDay = null">
      <div class="yline" />
      <div class="ymax">{{ maxTotal }}</div>
      <div class="ymid">{{ Math.round(maxTotal / 2) }}</div>
      <div
        v-for="(day, i) in daily"
        :key="day.label"
        class="stackcol"
        :class="{ hot: hoverDay === i }"
        @mouseenter="hoverDay = i"
        @click="hoverDay = hoverDay === i ? null : i"
      >
        <div class="stackbar" :style="{ height: barPct(day) + '%' }">
          <i
            v-for="s in day.segs"
            :key="s.name"
            :style="{ height: s.share + '%', background: sectorColor(s.name) }"
          />
        </div>
        <div v-if="hoverDay === i" class="tip" :class="tipAlign(i)">
          <div class="tipdate">{{ fmtDay(day.label) }}</div>
          <div class="tiptotal">{{ day.total }} total</div>
          <div v-for="s in day.segs" :key="s.name" class="tiprow">
            <i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}<b>{{ s.count }}</b>
          </div>
        </div>
      </div>
    </div>
    </div>
    <div v-if="hovered" class="sheet">
      <div class="sheetcard">
        <button class="sheetx" @click="hoverDay = null" aria-label="Close">✕</button>
        <div class="tipdate">{{ fmtDay(hovered.label) }}</div>
        <div class="tiptotal">{{ hovered.total }} total</div>
        <div v-for="s in hovered.segs" :key="s.name" class="tiprow">
          <i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}<b>{{ s.count }}</b>
        </div>
      </div>
    </div>
    <div class="legend"><span v-for="s in bySector.slice(0, 8)" :key="s.name"><i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}</span></div>

    <table class="dtable">
      <thead><tr><th>rank</th><th>sector</th><th>roles</th><th>share</th><th>wk/wk</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in bySector" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td>{{ r.name.toLowerCase() }}</td>
          <td>{{ r.count }}</td>
          <td>{{ total ? Math.round((r.count / total) * 100) : 0 }}%</td>
          <td :class="r.delta === null ? 'flat' : r.delta >= 0 ? 'up' : 'down'">
            {{ r.delta === null ? 'new' : (r.delta >= 0 ? '+' : '') + r.delta + '%' }}
          </td>
        </tr>
      </tbody>
    </table>

    <h2 class="sect"><span>#</span> Top Companies. Who is hiring the most.</h2>
    <table class="dtable">
      <thead><tr><th>rank</th><th>company</th><th>roles</th><th>base</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in topCompanies" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td>{{ r.name.toLowerCase() }}</td>
          <td>{{ r.count }}</td>
          <td>{{ companyBase(r.name) }}</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sect"><span>#</span> Entry Access. Where beginners get in.</h2>
    <p class="sub">Roles needing zero years, ranked by sector with a live example.</p>
    <table class="dtable">
      <thead><tr><th>rank</th><th>sector</th><th>entry roles</th><th>example</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in entryBySector" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td>{{ r.name.toLowerCase() }}</td>
          <td>{{ r.count }}</td>
          <td><NuxtLink :to="`/jobs/${r.exampleId}`">{{ r.example.toLowerCase().slice(0, 42) }}</NuxtLink></td>
        </tr>
      </tbody>
    </table>

    <h2 class="sect"><span>#</span> Demand by Place. Where the roles sit.</h2>
    <div v-for="r in byPlace" :key="r.name" class="row">
      <span class="rname">{{ r.name.toLowerCase() }}</span>
      <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
      <b>{{ r.count }}</b>
    </div>

    <h2 class="sect"><span>#</span> Closing Soon. Apply before they vanish.</h2>
    <ul class="list">
      <li v-for="j in closingSoon" :key="j.id" class="card">
        <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · {{ j.closing ? `closes ${j.closing} · ${daysLeft(j.closing, nowDate)}d left` : 'fresh this week' }}</span>
        </NuxtLink>
      </li>
    </ul>
    </div>
    <p v-else-if="loadState === 'error'" class="empty">couldn't load live data. try again.</p>
  </section>
</template>

<script setup lang="ts">
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
}

const nowDate = new Date()
const liveDocs = ref<SampleJob[] | null>(null)
const loadState = ref<'loading' | 'ready' | 'error'>('loading')

const LS_KEY = 'tshono:insights:v1'
onMounted(async () => {
  // hydrate from localStorage instantly — perceived 0ms
  try {
    const cached = localStorage.getItem(LS_KEY)
    if (cached) {
      const { at, docs } = JSON.parse(cached) as { at: number; docs: SampleJob[] }
      if (Date.now() - at < 5 * 60_000 && Array.isArray(docs) && docs.length) {
        liveDocs.value = docs
        loadState.value = 'ready'
      }
    }
  } catch {}
  try {
    const fields = 'id,title,company,sector,location,url,closing,posted,min_years'
    const perPage = 250
    const first = (await liveRaw({ q: '', query_by: 'title', per_page: String(perPage), page: '1', include_fields: fields })) as { hits?: Array<{ document: RawDoc }>; found?: number }
    const hits0 = first.hits ?? []
    const found = first.found ?? hits0.length
    const docs: SampleJob[] = hits0.map((h) => toJobHit(h.document as unknown as Record<string, unknown>))
    // show first page immediately if no cache
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
})

const allDocs = computed<SampleJob[]>(() => liveDocs.value ?? [])
const epoch = (iso: string) => new Date(iso + 'T00:00:00').getTime()
const maxPosted = computed(() => Math.max(...allDocs.value.map((j) => epoch(j.posted)), 0))
const weekStart = computed(() => maxPosted.value - 6 * 86400000)
const prevStart = computed(() => maxPosted.value - 13 * 86400000)

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
const updated = computed(() => {
  const d = new Date(maxPosted.value || nowDate.getTime())
  const s = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  return `${s}, live`
})
const fresh = computed(() => derived.value.fresh)
const urgent = computed(() => derived.value.urgent)
const entryShare = computed(() => derived.value.total ? Math.round((derived.value.entryCnt / derived.value.total) * 100) : 0)
const bySectorRaw = computed(() => derived.value.bySectorRaw)
const byPlace = computed(() => derived.value.byPlace)
const topCompanies = computed(() => derived.value.topCompanies)
const bySector = computed(() => derived.value.bySector)
const entryBySector = computed(() => derived.value.entryBySector)

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

const PALETTE = [
  '#4ade80', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#22d3ee', '#fb7185', '#34d399',
  '#f97316', '#e879f9', '#2dd4bf', '#facc15', '#818cf8', '#fb923c', '#4adeff', '#c084fc',
  '#f43f5e', '#a3e635', '#eab308', '#5eead4', '#ff6b6b', '#51cf66', '#fcc419', '#9775fa',
] as const
const SECTOR_COLOR = new Map<string, string>()
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

const hoverDay = ref<number | null>(null)
const hovered = computed(() => (hoverDay.value === null ? null : daily.value[hoverDay.value] ?? null))
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function fmtDay(iso: string): string {
  const dt = new Date(iso + 'T00:00:00')
  return `${MON[dt.getMonth()] ?? ''} ${dt.getDate()}`
}
function isTick(i: number): boolean {
  return i % 7 === 3
}
function tipAlign(i: number): string {
  if (i < 5) return 'tip--l'
  if (i > daily.value.length - 6) return 'tip--r'
  return ''
}
const maxTotal = computed(() => Math.max(...daily.value.map((d) => d.total), 1))
const chartEl = ref<HTMLElement | null>(null)
function scrollChartEnd() {
  if (typeof window === 'undefined' || window.innerWidth > 720) return
  const el = chartEl.value
  if (el) el.scrollLeft = el.scrollWidth
}
function barPct(day: { total: number }): number {
  return day.total ? (day.total / maxTotal.value) * 100 : 0
}
const daily = computed(() => {
  const dm = derived.value.dayMap
  // opencode.ai/data style: global frequency order — #1 most frequent at bottom
  const rank = new Map(derived.value.bySectorRaw.map((r, i) => [r.name, i]))
  const days: Array<{ label: string; total: number; segs: Array<{ name: string; count: number; share: number }> }> = []
  for (let back = 59; back >= 0; back--) {
    const key = new Date(maxPosted.value - back * 86400000).toISOString().slice(0, 10)
    const m = dm.get(key)
    if (!m) { days.push({ label: key, total: 0, segs: [] }); continue }
    let tot = 0; for (const c of m.values()) tot += c
    const segs = [...m.entries()]
      .map(([name, count]) => ({ name, count, share: tot ? (count / tot) * 100 : 0 }))
      .sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999))
      .slice(0, 8)
    // slice(-8) keeps globally top-relevant sectors, still rendered bottom=#1 with column-reverse
    days.push({ label: key, total: tot, segs })
  }
  return days
})
const max = computed(() => Math.max(...bySectorRaw.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)
watch(daily, () => { nextTick(scrollChartEnd) })
onMounted(() => { nextTick(scrollChartEnd) })

useHead({ title: 'tshono data. botswana hiring live' })
useSeoMeta({
  ogTitle: 'tshono data. botswana hiring live',
  ogDescription: 'Explore jobs data across Botswana. Sectors, companies, places and closing soon.',
  ogImage: 'https://tshono.pages.dev/og-insights.png',
})
</script>
