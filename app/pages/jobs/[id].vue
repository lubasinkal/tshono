<template>
  <section class="wrap">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>
    <div v-if="job" class="jobgrid">
      <div class="jobmain">
        <h1 class="title">{{ job.title }}</h1>
        <p class="sub"><NuxtLink :to="`/companies/${encodeURIComponent(job.company)}`">{{ job.company }}</NuxtLink> · {{ job.location }}</p>
        <div class="jobbody">
          <template v-if="responsibilities.length">
            <h3>key responsibilities</h3>
            <ul><li v-for="(r, i) in responsibilities" :key="i">{{ r }}</li></ul>
          </template>
          <template v-if="requirements.length">
            <h3>requirements</h3>
            <ul><li v-for="(r, i) in requirements" :key="i">{{ r }}</li></ul>
          </template>
          <template v-for="(b, i) in bodyBlocks" :key="i">
            <h3 v-if="b.kind === 'h'">{{ b.text }}</h3>
            <ul v-else-if="b.kind === 'ul'">
              <li v-for="(it, k) in b.items" :key="k">{{ it }}</li>
            </ul>
            <p v-else>{{ b.text }}</p>
          </template>
        </div>
      </div>
      <aside class="jobside">
        <div class="sidecard">
          <h2 class="sideh">job facts</h2>
          <dl class="facts">
            <div class="fact"><dt>company</dt><dd><NuxtLink :to="`/companies/${encodeURIComponent(job.company)}`">{{ job.company }}</NuxtLink></dd></div>
            <div class="fact"><dt>sector</dt><dd><NuxtLink :to="`/sectors/${encodeURIComponent(job.sector)}`">{{ job.sector.toLowerCase() }}</NuxtLink></dd></div>
            <div class="fact"><dt>place</dt><dd>{{ job.location.toLowerCase() }}<template v-if="job.district"> · {{ job.district.toLowerCase() }} district</template></dd></div>
            <div v-if="job.occupation" class="fact"><dt>occupation</dt><dd>{{ job.occupation.toLowerCase() }}</dd></div>
            <div v-if="job.employmentType" class="fact"><dt>type</dt><dd>{{ pretty(job.employmentType) }}</dd></div>
            <div v-if="job.workMode" class="fact"><dt>work mode</dt><dd>{{ pretty(job.workMode) }}</dd></div>
            <div v-if="job.vacancies && job.vacancies > 1" class="fact"><dt>positions</dt><dd>{{ job.vacancies }}</dd></div>
            <div v-if="job.educationLevel" class="fact"><dt>education</dt><dd>{{ pretty(job.educationLevel) }}</dd></div>
            <div v-if="salaryLabel" class="fact"><dt>salary</dt><dd>{{ salaryLabel }}</dd></div>
            <div class="fact"><dt>experience</dt><dd>{{ job.minYears === 0 ? 'entry level' : job.minYears + ' years plus' }}</dd></div>
            <div class="fact"><dt>posted</dt><dd>{{ postedLabel }}</dd></div>
            <div class="fact"><dt>closes</dt><dd>{{ job.closing || 'not stated' }}</dd></div>
          </dl>
          <a class="applybtn" :href="job.url" target="_blank" rel="noopener">apply at source ↗</a>
        </div>
        <div class="sidecard">
          <h2 class="sideh">similar roles</h2>
          <ul class="sidelist">
            <li v-for="s in similar" :key="s.id">
              <NuxtLink :to="`/jobs/${s.id}`">
                <strong>{{ s.title }}</strong>
                <span>{{ s.company }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </aside>
    </div>
    <p v-else>role not found. <NuxtLink to="/">back to search</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import type { SampleJob } from '~/data/sampleJobs'
import { remoteGet, liveRaw, toJobHit, type JobHit } from '~/composables/useJobSearch'

const route = useRoute()
const id = String(route.params.id)

const { data: remoteJob } = await useAsyncData(`job-${id}`, async () => remoteGet(id))

const job = computed<SampleJob | JobHit | null | undefined>(() => remoteJob.value)
const reqUrl = useRequestURL()
const ogImage = computed(() => {
  const j = job.value
  if (!j) return `${reqUrl.origin}/og.jpg`
  const p = new URLSearchParams({
    title: j.title,
    company: j.company,
    sector: j.sector,
    location: j.location,
    blurb: j.blurb || '',
  })
  return `${reqUrl.origin}/og/job?${p.toString()}`
})
const pretty = (v: string) => v.replace(/_/g, ' ')
const salaryLabel = computed(() => {
  const j = job.value
  if (!j || (j.salaryMin === undefined && j.salaryMax === undefined)) return ''
  const fmt = (n: number) => n.toLocaleString('en-BW')
  const range = j.salaryMin !== undefined && j.salaryMax !== undefined
    ? `${fmt(j.salaryMin)}–${fmt(j.salaryMax)}`
    : fmt((j.salaryMin ?? j.salaryMax)!)
  const per = j.salaryPeriod ? { annual: 'year', monthly: 'month', hourly: 'hour' }[j.salaryPeriod] ?? j.salaryPeriod : ''
  return `BWP ${range}${per ? ` / ${per}` : ''}`
})
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
const responsibilities = computed(() =>
  (job.value as (SampleJob & { responsibilities?: string }) | null | undefined)
    ?.responsibilities?.split('\n').map((s) => s.trim()).filter(Boolean) ?? [],
)
const requirements = computed(() =>
  (job.value as (SampleJob & { requirements?: string }) | null | undefined)
    ?.requirements?.split('\n').map((s) => s.trim()).filter(Boolean) ?? [],
)

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
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => (job.value ? `${job.value.title} · tshono` : 'tshono. find work. fast.'),
  twitterDescription: () => (job.value ? `${job.value.company} · ${job.value.location} · ${job.value.sector}` : 'Every opportunity in Botswana in one instant search.'),
  twitterImage: () => ogImage.value,
})
</script>
