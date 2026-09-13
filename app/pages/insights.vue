<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ total }} roles tracked</span>
      <span class="chip">{{ live ? '● live index' : '○ sample data' }}</span>
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
          <td>{{ Math.round((r.count / total) * 100) }}%</td>
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
          <span class="co">{{ j.company }} · closes {{ j.closing }} · {{ daysLeft(j.closing, nowDate) }}d left</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { sampleJobs } from '~/data/sampleJobs'
import { daysLeft, isRemote } from '~/composables/useJobSearch'

const live = isRemote()
const nowDate = new Date('2026-09-13')
const updated = 'Sep 13, 08:28 PM CAT'
const total = sampleJobs.length
const weekAgo = new Date('2026-09-06')

const fresh = sampleJobs.filter((j) => new Date(j.posted) >= weekAgo).length
const urgent = sampleJobs.filter((j) => {
  const d = daysLeft(j.closing, nowDate)
  return d >= 0 && d <= 7
}).length
const entryShare = Math.round((sampleJobs.filter((j) => j.minYears === 0).length / total) * 100)

function countBy(key: 'sector' | 'location' | 'company') {
  const m = new Map<string, number>()
  for (const j of sampleJobs) m.set(j[key], (m.get(j[key]) ?? 0) + 1)
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

const bySectorRaw = countBy('sector')
const byPlace = countBy('location')
const topCompanies = countBy('company').slice(0, 10)

// Week over week change per sector: this week (Sep 7+) vs prior sample window.
const bySector = bySectorRaw.map((r) => {
  const thisW = sampleJobs.filter((j) => j.sector === r.name && new Date(j.posted) >= new Date('2026-09-07')).length
  const prevW = r.count - thisW
  const delta = prevW === 0 ? null : Math.round(((thisW - prevW) / prevW) * 100)
  return { ...r, delta }
})

const closingSoon = [...sampleJobs]
  .map((j) => ({ j, d: daysLeft(j.closing, nowDate) }))
  .filter((x) => x.d >= 0)
  .sort((a, b) => a.d - b.d)
  .slice(0, 6)
  .map((x) => x.j)

function companyBase(name: string): string {
  const j = sampleJobs.find((x) => x.company === name)
  return (j?.location ?? '').toLowerCase()
}

// Daily stacked flow for the last 9 days, opencode chart feel in pure CSS.
const axis = ['sep 4', 'sep 6', 'sep 8', 'sep 10', 'sep 12']
const palette = ['#4ade80', '#38bdf8', '#f472b6', '#fbbf24', '#a78bfa', '#34d399', '#fb7185', '#22d3ee']
function sectorColor(name: string): string {
  const i = bySectorRaw.findIndex((r) => r.name === name)
  return palette[Math.max(0, i) % palette.length] ?? palette[0] ?? '#4ade80'
}
const daily = (() => {
  const days: Array<{ label: string; total: number; segs: Array<{ name: string; count: number }> }> = []
  for (let d = 4; d <= 12; d++) {
    const key = `2026-09-${String(d).padStart(2, '0')}`
    const inDay = sampleJobs.filter((j) => j.posted <= key)
    const m = new Map<string, number>()
    for (const j of inDay) m.set(j.sector, (m.get(j.sector) ?? 0) + 1)
    const segs = [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    days.push({ label: key, total: inDay.length, segs })
  }
  return days
})()
const maxDay = Math.max(...daily.map((d) => d.total), 1)
const max = Math.max(...bySectorRaw.map((r) => r.count))
const pct = (n: number) => Math.round((n / max) * 100)

useHead({ title: 'tshono data. botswana hiring live' })
</script>
