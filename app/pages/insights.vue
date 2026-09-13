<template>
  <section class="wrap">
    <h1 class="title">Labour market, live.</h1>
    <p class="sub">What Tshono sees across Botswana right now. Same honesty as an open data page. Updated {{ updated }}.</p>

    <div class="grid">
      <div class="stat"><b>{{ total }}</b><span>roles tracked</span></div>
      <div class="stat"><b>{{ fresh }}</b><span>fresh this week</span></div>
      <div class="stat"><b>{{ urgent }}</b><span>closing in 7 days</span></div>
      <div class="stat"><b>{{ sectors }}</b><span>sectors covered</span></div>
    </div>

    <h2>Hiring by sector</h2>
    <div v-for="r in bySector" :key="r.name" class="row">
      <span class="rname">{{ r.name }}</span>
      <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
      <b>{{ r.count }}</b>
    </div>

    <h2>Demand by place</h2>
    <div v-for="r in byPlace" :key="r.name" class="row">
      <span class="rname">{{ r.name }}</span>
      <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
      <b>{{ r.count }}</b>
    </div>

    <h2>Top hiring companies</h2>
    <ol>
      <li v-for="r in topCompanies" :key="r.name">{{ r.name }} ({{ r.count }})</li>
    </ol>

    <h2>Closing soon</h2>
    <ul class="list">
      <li v-for="j in closingSoon" :key="j.id" class="card">
        <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · closes {{ j.closing }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { sampleJobs } from '~/data/sampleJobs'
import { daysLeft } from '~/composables/useJobSearch'

const updated = '13 Sep 2026'
const total = sampleJobs.length
const fresh = sampleJobs.filter((j) => daysLeft(j.posted, new Date('2026-09-06')) >= 0).length
const urgent = sampleJobs.filter((j) => { const d = daysLeft(j.closing, new Date('2026-09-13')); return d >= 0 && d <= 7 }).length
const sectors = new Set(sampleJobs.map((j) => j.sector)).size

function countBy(key: 'sector' | 'location' | 'company') {
  const m = new Map<string, number>()
  for (const j of sampleJobs) m.set(j[key], (m.get(j[key]) ?? 0) + 1)
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

const bySector = countBy('sector')
const byPlace = countBy('location')
const topCompanies = countBy('company').slice(0, 8)
const closingSoon = [...sampleJobs]
  .map((j) => ({ j, d: daysLeft(j.closing, new Date('2026-09-13')) }))
  .filter((x) => x.d >= 0)
  .sort((a, b) => a.d - b.d)
  .slice(0, 6)
  .map((x) => x.j)

const max = Math.max(...bySector.map((r) => r.count))
const pct = (n: number) => Math.round((n / max) * 100)

useHead({ title: 'Tshono Insights. Botswana hiring live' })
</script>
