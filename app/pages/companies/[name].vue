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
        <span class="updated">{{ base }}</span>
      </div>

      <h1 class="title">{{ name }}</h1>
      <p class="sub">{{ sectorsList }} · hiring in botswana</p>

      <div class="grid">
        <div class="stat"><b>{{ jobs.length }}</b><span>roles posted</span></div>
        <div class="stat"><b>{{ freshCount }}</b><span>fresh this week</span></div>
        <div class="stat"><b>{{ entryShare }}%</b><span>entry level</span></div>
        <div class="stat"><b>{{ locations.length }}</b><span>places</span></div>
      </div>

      <h2 class="sect"><span>#</span> Hiring Trend. Roles posted, last 60 days.</h2>
      <BarTrend :days="trend" />

      <h2 class="sect"><span>#</span> Role Mix. What they hire for.</h2>
      <table class="dtable">
        <thead><tr><th>rank</th><th>role</th><th>posts</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in roleMix" :key="r.name">
            <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
            <td>{{ r.name.toLowerCase() }}</td>
            <td>{{ r.count }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="sect"><span>#</span> Sectors.</h2>
      <div v-for="r in sectorMix" :key="r.name" class="row">
        <span class="rname">{{ r.name.toLowerCase() }}</span>
        <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
        <b>{{ r.count }}</b>
      </div>

      <h2 class="sect"><span>#</span> Open Roles.</h2>
      <ul class="list">
        <li v-for="j in recentJobs" :key="j.id" class="card">
          <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
            <strong>{{ j.title }}</strong>
            <span class="co">{{ j.location }} · {{ j.minYears === 0 ? 'entry' : j.minYears + ' yrs+' }}</span>
          </NuxtLink>
        </li>
      </ul>

      <h2 class="sect"><span>#</span> Similar Companies.</h2>
      <ul class="list">
        <li v-for="c in similar" :key="c.name" class="card">
          <NuxtLink :to="`/companies/${encodeURIComponent(c.name)}`" class="cardlink">
            <strong>{{ c.name.toLowerCase() }}</strong>
            <span class="co">{{ c.count }} roles</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <p v-else class="empty">company not found. <NuxtLink to="/insights">back to hiring data</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { useJobData } from '~/composables/useJobData'

const route = useRoute()
const name = computed(() => String(route.params.name))
const reqUrl = useRequestURL()
const ogImage = computed(() => {
  const p = new URLSearchParams({ title: name.value, label: 'COMPANY', sub: 'hiring in botswana', blurb: 'Explore their roles, hiring trend and more.' })
  return `${reqUrl.origin}/og/job?${p.toString()}`
})

const { allDocs, load, loadState, maxPosted, countBy, dailySeries } = useJobData()
onMounted(() => load())

const jobs = computed(() => allDocs.value.filter((j) => j.company.toLowerCase() === name.value.toLowerCase()))

const sectorMix = computed(() => countBy(jobs.value, (j) => j.sector))
const roleMix = computed(() => countBy(jobs.value, (j) => j.title).slice(0, 12))
const locations = computed(() => countBy(jobs.value, (j) => j.location))
const base = computed(() => locations.value[0]?.name.toLowerCase() ?? 'botswana')
const sectorsList = computed(() => sectorMix.value.slice(0, 3).map((s) => s.name.toLowerCase()).join(' · ') || 'hiring')
const entryShare = computed(() => jobs.value.length ? Math.round((jobs.value.filter((j) => j.minYears === 0).length / jobs.value.length) * 100) : 0)
const trend = computed(() => dailySeries(jobs.value, maxPosted.value))
const freshCount = computed(() => {
  const ws = maxPosted.value - 6 * 86400000
  return jobs.value.filter((j) => new Date(j.posted + 'T00:00:00').getTime() >= ws).length
})
const recentJobs = computed(() => [...jobs.value].sort((a, b) => new Date(b.posted + 'T00:00:00').getTime() - new Date(a.posted + 'T00:00:00').getTime()).slice(0, 12))
const similar = computed(() => {
  const secs = new Set(jobs.value.map((j) => j.sector))
  return countBy(allDocs.value.filter((j) => j.company.toLowerCase() !== name.value.toLowerCase() && secs.has(j.sector)), (j) => j.company).slice(0, 8)
})

const max = computed(() => Math.max(...sectorMix.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)

useHead({ title: `${name.value} · tshono` })
useSeoMeta({
  ogTitle: () => `${name.value} · tshono`,
  ogDescription: () => (jobs.value.length ? `${jobs.value.length} roles · ${sectorsList.value}` : 'Hiring in Botswana'),
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${name.value} · tshono`,
  twitterDescription: () => (jobs.value.length ? `${jobs.value.length} roles · ${sectorsList.value}` : 'Hiring in Botswana'),
  twitterImage: () => ogImage.value,
})
</script>
