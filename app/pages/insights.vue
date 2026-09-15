<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ loadState === 'loading' ? '…' : total }} roles tracked</span>
      <span class="chip">{{ loadState === 'ready' && live ? '● live aggregates' : loadState === 'fallback' ? '○ sample data' : live ? '○ loading live…' : '○ sample data' }}</span>
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

    <div v-else>
    <div class="grid">
      <div class="stat"><b>{{ total }}</b><span>roles tracked</span></div>
      <div class="stat"><b>{{ fresh }}</b><span>fresh this week</span></div>
      <div class="stat"><b>{{ urgent }}</b><span>closing in 7 days</span></div>
      <div class="stat"><b>{{ entryShare }}%</b><span>entry level share</span></div>
    </div>

    <h2 class="sect"><span>#</span> Top Sectors. Daily postings by sector, last 60 days.</h2>
    <div class="weekaxis"><span v-for="(day, i) in daily" :key="day.label">{{ isTick(i) ? fmtDay(day.label) : '' }}</span></div>
    <div class="stack" @mouseleave="hoverDay = null">
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
  </section>
</template>

<script setup lang="ts">
import { sampleJobs, type SampleJob } from '~/data/sampleJobs'
import { daysLeft, isRemote, liveRaw, toJobHit } from '~/composables/useJobSearch'

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

const live = isRemote()
const nowDate = new Date()
const liveDocs = ref<SampleJob[] | null>(null)
const loadState = ref<'loading' | 'ready' | 'fallback'>('loading')

onMounted(async () => {
  if (!live) {
    loadState.value = 'ready'
    return
  }
  try {
    const fields = 'id,title,company,sector,location,url,closing,posted,min_years'
    const perPage = 250
    let page = 1
    let found = Number.POSITIVE_INFINITY
    const docs: SampleJob[] = []
    while (docs.length < found) {
      const r = (await liveRaw({
        q: '',
        query_by: 'title',
        per_page: String(perPage),
        page: String(page),
        include_fields: fields,
      })) as {
        hits?: Array<{ document: RawDoc }>
        found?: number
      }
      const hits = r.hits ?? []
      found = r.found ?? hits.length
      docs.push(...hits.map((h) => toJobHit(h.document as unknown as Record<string, unknown>)))
      if (hits.length < perPage) break
      page += 1
    }
    liveDocs.value = docs
    loadState.value = 'ready'
  } catch {
    liveDocs.value = null
    loadState.value = 'fallback'
  }
})

const allDocs = computed<SampleJob[]>(() => liveDocs.value ?? sampleJobs)
const epoch = (iso: string) => new Date(iso + 'T00:00:00').getTime()
const maxPosted = computed(() => Math.max(...allDocs.value.map((j) => epoch(j.posted)), 0))
const weekStart = computed(() => maxPosted.value - 6 * 86400000)
const prevStart = computed(() => maxPosted.value - 13 * 86400000)

const total = computed(() => allDocs.value.length)
const updated = computed(() => {
  const d = new Date(maxPosted.value || nowDate.getTime())
  const s = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  return live && loadState.value !== 'fallback' ? `${s}, live` : `${s}, sample`
})
const fresh = computed(() => allDocs.value.filter((j) => epoch(j.posted) >= weekStart.value).length)
const urgent = computed(
  () =>
    allDocs.value.filter((j) => {
      if (!j.closing) return false
      const d = daysLeft(j.closing, nowDate)
      return d >= 0 && d <= 7
    }).length,
)
const entryShare = computed(() =>
  total.value ? Math.round((allDocs.value.filter((j) => j.minYears === 0).length / total.value) * 100) : 0,
)

function countBy(key: 'sector' | 'location' | 'company') {
  const m = new Map<string, number>()
  for (const j of allDocs.value) m.set(j[key], (m.get(j[key]) ?? 0) + 1)
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

const bySectorRaw = computed(() => countBy('sector'))
const byPlace = computed(() => countBy('location'))
const topCompanies = computed(() => countBy('company').slice(0, 10))

const bySector = computed(() =>
  bySectorRaw.value.map((r) => {
    const thisW = allDocs.value.filter((j) => j.sector === r.name && epoch(j.posted) >= weekStart.value).length
    const prevW = allDocs.value.filter(
      (j) => j.sector === r.name && epoch(j.posted) >= prevStart.value && epoch(j.posted) < weekStart.value,
    ).length
    const delta = prevW === 0 ? null : Math.round(((thisW - prevW) / prevW) * 100)
    return { ...r, delta }
  }),
)

const entryBySector = computed(() => {
  const m = new Map<string, { count: number; example: string; exampleId: string }>()
  for (const j of allDocs.value) {
    if (j.minYears !== 0) continue
    const e = m.get(j.sector) ?? { count: 0, example: j.title, exampleId: j.id }
    e.count += 1
    m.set(j.sector, e)
  }
  return [...m.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

function companyBase(name: string): string {
  const j = allDocs.value.find((x) => x.company === name)
  return (j?.location ?? '').toLowerCase()
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

const palette = ['#4ade80', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185', '#22d3ee']
function sectorColor(name: string): string {
  const i = bySectorRaw.value.findIndex((r) => r.name === name)
  return palette[Math.max(0, i) % palette.length] ?? palette[0] ?? '#4ade80'
}

const hoverDay = ref<number | null>(null)
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
function barPct(day: { total: number }): number {
  return day.total ? (day.total / maxTotal.value) * 100 : 0
}
const daily = computed(() => {
  const days: Array<{ label: string; total: number; segs: Array<{ name: string; count: number; share: number }> }> = []
  for (let back = 59; back >= 0; back--) {
    const dayMs = maxPosted.value - back * 86400000
    const key = new Date(dayMs).toISOString().slice(0, 10)
    const inDay = allDocs.value.filter((j) => j.posted === key)
    const m = new Map<string, number>()
    for (const j of inDay) m.set(j.sector, (m.get(j.sector) ?? 0) + 1)
    const segs = [...m.entries()]
      .map(([name, count]) => ({ name, count, share: inDay.length ? (count / inDay.length) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    days.push({ label: key, total: inDay.length, segs })
  }
  return days
})
const max = computed(() => Math.max(...bySectorRaw.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)

useHead({ title: 'tshono data. botswana hiring live' })
useSeoMeta({
  ogTitle: 'tshono data. botswana hiring live',
  ogDescription: 'See who is hiring in Botswana, where demand sits, and which roles close soon.',
  ogImage: 'https://tshono.pages.dev/og.png',
})
</script>
