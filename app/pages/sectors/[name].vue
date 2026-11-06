<template>
  <section class="wrap">
    <p><NuxtLink to="/insights">← hiring data</NuxtLink></p>

    <div v-if="loadState === 'loading'" class="skel">
      <div class="grid">
        <div v-for="i in 4" :key="i" class="stat pulse"><b>…</b><span>loading</span></div>
      </div>
    </div>

    <div v-else-if="jobs.length">
      <div class="dhead">
        <span class="chip">◉ {{ jobs.length }} roles</span>
        <span class="chip">{{ loadState === 'ready' ? '● live' : '○ loading' }}</span>
        <span class="updated">{{ share }}% of market<template v-if="delta !== null"> · <span :class="delta >= 0 ? 'up' : 'down'">{{ delta >= 0 ? '+' : '' }}{{ delta }}% wk/wk</span></template></span>
      </div>

      <h1 class="title">{{ name }}</h1>
      <p class="sub">{{ topPlaces }} · top employers: {{ topEmployers }}</p>

      <div class="grid">
        <div class="stat"><b>{{ jobs.length }}</b><span>roles posted</span></div>
        <div class="stat"><b>{{ freshCount }}</b><span>fresh this week</span></div>
        <div class="stat"><b>{{ entryShare }}%</b><span>entry level</span></div>
        <div class="stat"><b>{{ companies.length }}</b><span>employers</span></div>
      </div>

      <h2 class="sect"><span>#</span> Demand Trend. Roles posted, last 60 days.</h2>
      <BarTrend :days="trend" />

      <h2 class="sect"><span>#</span> Top Employers.</h2>
      <table class="dtable">
        <thead><tr><th>rank</th><th>company</th><th>roles</th><th>entry</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in companies" :key="r.name">
            <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
            <td><NuxtLink :to="`/companies/${encodeURIComponent(r.name)}`">{{ r.name.toLowerCase() }}</NuxtLink></td>
            <td>{{ r.count }}</td>
            <td>{{ entryByCompany(r.name) }}%</td>
          </tr>
        </tbody>
      </table>

      <h2 class="sect"><span>#</span> Demand by Place.</h2>
      <div v-for="r in places" :key="r.name" class="row">
        <span class="rname">{{ r.name.toLowerCase() }}</span>
        <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
        <b>{{ r.count }}</b>
      </div>

      <h2 class="sect"><span>#</span> Recent Roles.</h2>
      <ul class="list">
        <li v-for="j in recentJobs" :key="j.id" class="card">
          <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
            <strong>{{ j.title }}</strong>
            <span class="co">{{ j.company }} · {{ j.location }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <p v-else class="empty">sector not found. <NuxtLink to="/insights">back to hiring data</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { useJobData } from '~/composables/useJobData'

const route = useRoute()
const name = computed(() => String(route.params.name))
const reqUrl = useRequestURL()
const ogImage = computed(() => {
  const p = new URLSearchParams({ title: name.value, label: 'SECTOR', sub: 'jobs across botswana', blurb: 'Explore top employers, demand by place and recent roles.' })
  return `${reqUrl.origin}/og/job?${p.toString()}`
})

const { allDocs, load, loadState, maxPosted, total, bySector, countBy, dailySeries } = useJobData()
onMounted(() => load())

const jobs = computed(() => allDocs.value.filter((j) => j.sector.toLowerCase() === name.value.toLowerCase()))

const companies = computed(() => countBy(jobs.value, (j) => j.company))
const places = computed(() => countBy(jobs.value, (j) => j.location))
const share = computed(() => {
  const s = bySector.value.find((s) => s.name.toLowerCase() === name.value.toLowerCase())
  return s && total.value ? Math.round((s.count / total.value) * 100) : 0
})
const delta = computed(() => bySector.value.find((s) => s.name.toLowerCase() === name.value.toLowerCase())?.delta ?? null)
const topPlaces = computed(() => places.value.slice(0, 3).map((p) => p.name.toLowerCase()).join(' · ') || 'botswana')
const topEmployers = computed(() => companies.value.slice(0, 3).map((c) => c.name.toLowerCase()).join(' · ') || '—')
const entryShare = computed(() => jobs.value.length ? Math.round((jobs.value.filter((j) => j.minYears === 0).length / jobs.value.length) * 100) : 0)
const freshCount = computed(() => {
  const ws = maxPosted.value - 6 * 86400000
  return jobs.value.filter((j) => new Date(j.posted + 'T00:00:00').getTime() >= ws).length
})
const trend = computed(() => dailySeries(jobs.value, maxPosted.value))
const recentJobs = computed(() => [...jobs.value].sort((a, b) => new Date(b.posted + 'T00:00:00').getTime() - new Date(a.posted + 'T00:00:00').getTime()).slice(0, 12))
function entryByCompany(companyName: string): number {
  const cj = jobs.value.filter((j) => j.company.toLowerCase() === companyName.toLowerCase())
  if (!cj.length) return 0
  return Math.round((cj.filter((j) => j.minYears === 0).length / cj.length) * 100)
}

const max = computed(() => Math.max(...places.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)

useHead({ title: `${name.value} jobs · tshono` })
useSeoMeta({
  ogTitle: () => `${name.value} · tshono`,
  ogDescription: () => (jobs.value.length ? `${jobs.value.length} roles across botswana · ${topEmployers.value}` : 'Jobs across Botswana'),
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${name.value} · tshono`,
  twitterDescription: () => (jobs.value.length ? `${jobs.value.length} roles across botswana · ${topEmployers.value}` : 'Jobs across Botswana'),
  twitterImage: () => ogImage.value,
})
</script>
