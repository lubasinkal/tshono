<template>
  <section class="wrap">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>
    <div v-if="job">
      <h1 class="title">{{ job.title }}</h1>
      <p class="sub">{{ job.company }} · {{ job.location }}</p>
      <div class="jobmeta">
        <span><b>sector</b> {{ job.sector.toLowerCase() }}</span>
        <span><b>place</b> {{ job.location.toLowerCase() }}</span>
        <span><b>experience</b> {{ job.minYears === 0 ? 'entry level' : job.minYears + ' years plus' }}</span>
        <span><b>posted</b> {{ postedLabel }}</span>
        <span><b>closes</b> {{ job.closing || 'not stated' }}</span>
      </div>
      <p class="jobbody">{{ bodyText }}</p>
      <p class="applyrow">
        <a :href="job.url" target="_blank" rel="noopener">apply at source ↗</a>
      </p>
      <h2>Similar roles</h2>
      <ul class="list">
        <li v-for="s in similar" :key="s.id" class="card">
          <NuxtLink :to="`/jobs/${s.id}`" class="cardlink">
            <strong>{{ s.title }}</strong>
            <span class="co">{{ s.company }} · {{ s.location }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <p v-else>role not found. <NuxtLink to="/">back to search</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { sampleJobs, type SampleJob } from '~/data/sampleJobs'
import { remoteGet, isRemote, liveRaw, toJobHit, type JobHit } from '~/composables/useJobSearch'

const route = useRoute()
const id = String(route.params.id)
const live = isRemote()

const { data: remoteJob } = await useAsyncData(`job-${id}`, async () => {
  if (!live) return null
  return remoteGet(id)
}, { server: false })

const job = computed<SampleJob | JobHit | null | undefined>(
  () => remoteJob.value ?? sampleJobs.find((j) => j.id === id),
)
const postedLabel = computed(() => {
  const j = job.value
  if (!j) return ''
  const p = (j as unknown as Record<string, unknown>).posted
  if (typeof p === 'number') return new Date(p * 1000).toISOString().slice(0, 10)
  return String(p ?? '')
})
const bodyText = computed(() => {
  const j = job.value as (SampleJob & { content?: string }) | null | undefined
  if (!j) return ''
  return j.content || j.blurb || 'No further detail captured. Open the source link to read the full advert.'
})
const similar = ref<SampleJob[]>([])
watch(
  job,
  async (j) => {
    if (!j) {
      similar.value = []
      return
    }
    if (live) {
      try {
        const r = (await liveRaw({
          q: '',
          query_by: 'title',
          filter_by: `sector:=${j.sector}`,
          per_page: '6',
        })) as { hits?: Array<{ document: Record<string, unknown> }> }
        similar.value = (r.hits ?? [])
          .map((h) => toJobHit(h.document))
          .filter((d) => d.id !== j.id)
          .slice(0, 5)
        if (similar.value.length) return
      } catch {
        // fall through to sample list below
      }
    }
    similar.value = sampleJobs
      .filter((s) => s.id !== j.id && (s.sector === j.sector || s.location === j.location))
      .slice(0, 5)
  },
  { immediate: true },
)

useHead({ title: job.value ? `${job.value.title} · tshono` : 'role · tshono' })
useSeoMeta({
  ogTitle: () => (job.value ? `${job.value.title} · tshono` : 'tshono. find work. fast.'),
  ogDescription: () => (job.value ? `${job.value.company} · ${job.value.location} · ${job.value.sector}` : 'Every opportunity in Botswana in one instant search.'),
  ogImage: 'https://tshono.pages.dev/og.png',
})
</script>
