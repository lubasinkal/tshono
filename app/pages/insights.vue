<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ total }} roles tracked</span>
      <span class="chip">{{ liveDocs ? '● live aggregates' : live ? '○ loading live…' : '○ sample data' }}</span>
      <span class="updated">updated {{ updated }}</span>
    </div>

    <h1 class="title">Hiring Data</h1>
    <p class="sub">See who is hiring in Botswana, where demand sits, and which roles close soon.</p>

    <div class="grid">
      <div class="stat"><b>{{ total }}</b><span>roles tracked</span></div>
      <div class="stat"><b>{{ fresh }}</b><span>fresh this week</span></div>
      <div class="stat"><b>{{ urgent }}</b><span>closing in 7 days</span></div>
      <div class="stat"><b>{{ entryShare }}%</b><span>entry level share</span></div>
    </div>

    <h2 class="sect"><span>#</span> Top Sectors. Share of fresh roles by sector.</h2>
    <div class="weekaxis"><span v-for="d in axis" :key="d">{{ d }}</span></div>
    <div class="stack">
      <div
        v-for="(day, i) in daily"
        :key="i"
        class="stackcol"
        :title="day.label + ': ' + day.total + ' roles'"
      >
        <i
          v-for="s in day.segs"
          :key="s.name"
          :style="{ height: (s.count / maxDay * 100) + '%', background: sectorColor(s.name) }"
        />
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
          <span class="co">{{ j.company }} · closes {{ j.closing || 'soon' }} · {{ daysLeft(j.closing, nowDate) }}d left</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { sampleJobs, type SampleJob } from '~/data/sampleJobs'
import { daysLeft, isRemote, liveRaw } from '~/composables/useJobSearch'

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
const updated = 'Sep 13, live'
const liveDocs = ref<SampleJob[] | null>(null)

onMounted(async () => {
  if (!live) return
  try {
    const r = (await liveRaw({ q: '', query_by: 'title', per_page: '100' })) as {
      hits?: Array<{ document: RawDoc }>
    }
    liveDocs.value =
      (r.hits ?? []).map((h) => ({
        id: h.document.id,
        title: h.document.title || 'Untitled role',
        company: h.document.company || 'Hiring firm',
        sector: h.document.sector || 'General',
        location: h.document.location || 'Botswana',
        blurb: h.document.blurb || '',
        url: h.document.url || '',
        closing: h.document.closing || '',
        posted: new Date((h.document.posted || 0) * 1000).toISOString().slice(0, 10),
        minYears: h.document.min_years ?? 0,
      })) ?? []
  } catch {
    liveDocs.value = null
  }
})

const allDocs = computed<SampleJob[]>(() => liveDocs.value ?? sampleJobs)
const epoch = (iso: string) => new Date(iso + 'T00:00:00').getTime()
const maxPosted = computed(() => Math.max(...allDocs.value.map((j) => epoch(j.posted)), 0))
const weekStart = computed(() => maxPosted.value - 6 * 86400000)
const prevStart = computed(() => maxPosted.value - 13 * 86400000)

const total = computed(() => allDocs.value.length)
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

const closingSoon = computed(() =>
  allDocs.value
    .filter((j) => j.closing)
    .map((j) => ({ j, d: daysLeft(j.closing, nowDate) }))
    .filter((x) => x.d >= 0)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .map((x) => x.j),
)

const palette = ['#4ade80', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185', '#22d3ee']
function sectorColor(name: string): string {
  const i = bySectorRaw.value.findIndex((r) => r.name === name)
  return palette[Math.max(0, i) % palette.length] ?? palette[0] ?? '#4ade80'
}

const daily = computed(() => {
  const days: Array<{ label: string; total: number; segs: Array<{ name: string; count: number }> }> = []
  for (let back = 8; back >= 0; back--) {
    const dayMs = maxPosted.value - back * 86400000
    const key = new Date(dayMs).toISOString().slice(0, 10)
    const inDay = allDocs.value.filter((j) => epoch(j.posted) <= dayMs + 86399999)
    const m = new Map<string, number>()
    for (const j of inDay) m.set(j.sector, (m.get(j.sector) ?? 0) + 1)
    const segs = [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    days.push({ label: key, total: inDay.length, segs })
  }
  return days
})
const axis = computed(() => {
  const labels = daily.value.filter((_, i) => i % 2 === 0).map((d) => {
    const dt = new Date(d.label + 'T00:00:00')
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toLowerCase()
  })
  return labels
})
const maxDay = computed(() => Math.max(...daily.value.map((d) => d.total), 1))
const max = computed(() => Math.max(...bySectorRaw.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)

useHead({ title: 'tshono data. botswana hiring live' })
</script>
