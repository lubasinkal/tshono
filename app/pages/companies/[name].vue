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

      <div v-if="company" class="sidecard">
        <h2 class="sideh">about {{ name.toLowerCase() }}</h2>
        <p v-if="company.about" class="jobbody">{{ company.about }}</p>
        <dl class="facts">
          <div v-if="company.website" class="fact"><dt>website</dt><dd><a :href="company.website" target="_blank" rel="noopener">{{ company.website.replace(/^https?:\/\//, '') }}</a></dd></div>
          <div v-if="company.sector" class="fact"><dt>sector</dt><dd>{{ company.sector.toLowerCase() }}</dd></div>
          <div v-if="company.location" class="fact"><dt>location</dt><dd>{{ company.location.toLowerCase() }}</dd></div>
          <div v-if="company.contact_name" class="fact"><dt>contact</dt><dd>{{ company.contact_name }}</dd></div>
          <div v-if="company.phone" class="fact"><dt>phone</dt><dd>{{ company.phone }}</dd></div>
        </dl>
      </div>

      <h2 class="sect"><span>#</span> company facts</h2>
      <div class="sidecard">
        <dl class="facts">
          <div class="fact"><dt>based in</dt><dd>{{ locationsList }}</dd></div>
          <div class="fact"><dt>sectors</dt><dd>{{ sectorsFull }}</dd></div>
          <div class="fact"><dt>active since</dt><dd>{{ activeSince }}</dd></div>
          <div v-if="salaryRange" class="fact"><dt>typical salary</dt><dd>{{ salaryRange }}</dd></div>
          <div v-if="employmentTypes" class="fact"><dt>employment</dt><dd>{{ employmentTypes }}</dd></div>
          <div v-if="workModes" class="fact"><dt>work mode</dt><dd>{{ workModes }}</dd></div>
          <div v-if="topRoles" class="fact"><dt>top roles</dt><dd>{{ topRoles }}</dd></div>
        </dl>
      </div>

      <h2 class="sect"><span>#</span> Hiring Trend. Roles posted, last 60 days.</h2>
      <BarTrend :days="trend" />

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

interface CompanyProfile {
  website: string
  about: string
  sector: string
  location: string
  contact_name: string
  phone: string
}

const route = useRoute()
const name = computed(() => String(route.params.name))
const reqUrl = useRequestURL()
const ogImage = computed(() => {
  const p = new URLSearchParams({ title: name.value, label: 'COMPANY', sub: 'hiring in botswana', blurb: 'Explore their roles, hiring trend and more.' })
  return `${reqUrl.origin}/og/job?${p.toString()}`
})

const { allDocs, load, loadState, maxPosted, countBy, dailySeries } = useJobData()
onMounted(() => load())

const { data: companyData } = await useFetch<{ company: CompanyProfile | null }>(
  () => `/api/companies/${encodeURIComponent(name.value)}`,
)
const company = computed(() => companyData.value?.company ?? null)

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

const locationsList = computed(() => locations.value.map((l) => l.name.toLowerCase()).join(', '))
const sectorsFull = computed(() => sectorMix.value.map((s) => s.name.toLowerCase()).join(', '))
const activeSince = computed(() => jobs.value.map((j) => j.posted.slice(0, 4)).sort()[0] ?? '')
const topRoles = computed(() => roleMix.value.slice(0, 5).map((r) => r.name.toLowerCase()).join(', '))
const salaryRange = computed(() => {
  const withSal = jobs.value.filter((j) => (j.salaryMin ?? 0) > 0 || (j.salaryMax ?? 0) > 0)
  if (!withSal.length) return ''
  const lo = Math.min(...withSal.map((j) => (j.salaryMin ?? j.salaryMax)!))
  const hi = Math.max(...withSal.map((j) => (j.salaryMax ?? j.salaryMin)!))
  const fmt = (n: number) => `BWP ${n.toLocaleString('en-BW')}`
  return lo === hi ? fmt(lo) : `${fmt(lo)} – ${fmt(hi)}`
})
const employmentTypes = computed(() =>
  [...new Set(jobs.value.map((j) => j.employmentType).filter(Boolean))].map((t) => t!.replace(/_/g, ' ')).join(', '),
)
const workModes = computed(() =>
  [...new Set(jobs.value.map((j) => j.workMode).filter(Boolean))].map((t) => t!.replace(/_/g, ' ')).join(', '),
)

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
