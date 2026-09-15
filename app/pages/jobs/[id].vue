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
      <div class="jobbody">
        <template v-for="(b, i) in bodyBlocks" :key="i">
          <h3 v-if="b.kind === 'h'">{{ b.text }}</h3>
          <ul v-else-if="b.kind === 'ul'">
            <li v-for="(it, k) in b.items" :key="k">{{ it }}</li>
          </ul>
          <p v-else>{{ b.text }}</p>
        </template>
      </div>
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
import type { SampleJob } from '~/data/sampleJobs'
import { remoteGet, liveRaw, toJobHit, type JobHit } from '~/composables/useJobSearch'

const route = useRoute()
const id = String(route.params.id)

const { data: remoteJob } = await useAsyncData(`job-${id}`, async () => remoteGet(id), { server: false })

const job = computed<SampleJob | JobHit | null | undefined>(() => remoteJob.value)
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

interface BodyBlock {
  kind: 'h' | 'ul' | 'p'
  text: string
  items: string[]
}

function isHeading(line: string): boolean {
  const t = line.trim()
  if (!t || t.length > 70) return false
  if (/[:：]$/.test(t)) return true
  const letters = t.replace(/[^A-Za-z]/g, '')
  if (letters.length >= 4 && letters === letters.toUpperCase()) return true
  return /^(job summary|key responsibilities|requirements|qualifications|duties|how to apply|remuneration|competencies|experience|education|closing date|duty station|job type)$/i.test(t.replace(/[:：]$/, '').trim())
}

const bodyBlocks = computed<BodyBlock[]>(() => {
  const lines = bodyText.value.split('\n')
  const blocks: BodyBlock[] = []
  let list: string[] = []
  const flush = () => {
    if (list.length) {
      blocks.push({ kind: 'ul', text: '', items: list })
      list = []
    }
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('•')) {
      list.push(line.replace(/^•\s*/, ''))
      continue
    }
    flush()
    blocks.push(isHeading(line) ? { kind: 'h', text: line.replace(/[:：]$/, ''), items: [] } : { kind: 'p', text: line, items: [] })
  }
  flush()
  return blocks.length ? blocks : [{ kind: 'p', text: bodyText.value || 'No detail.', items: [] }]
})
const similar = ref<SampleJob[]>([])
watch(
  job,
  async (j) => {
    if (!j) { similar.value = []; return }
    try {
      const r = (await liveRaw({ q: '', query_by: 'title', filter_by: `sector:=${j.sector}`, per_page: '6' })) as { hits?: Array<{ document: Record<string, unknown> }> }
      similar.value = (r.hits ?? []).map((h) => toJobHit(h.document)).filter((d) => d.id !== j.id).slice(0, 5)
    } catch { similar.value = [] }
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
