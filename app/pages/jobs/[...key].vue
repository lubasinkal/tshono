<template>
  <section class="wrap">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>
    <div v-if="job" class="jobgrid">
      <div class="jobmain">
        <div v-if="isFeatured(job)" class="dhead"><span class="chip accent">★ featured</span></div>
        <h1 class="title">{{ job.title }}</h1>
        <p class="sub"><NuxtLink :to="companyPath(job.company)">{{ job.company }}</NuxtLink> · {{ job.location }}</p>

        <p v-if="summary" class="jobsummary">{{ summary }}</p>

        <div v-if="bodyBlocks.length" class="jobbody">
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

        <div v-if="canApply" class="applybox">
          <h2 class="applybox-title">apply through tshono</h2>
          <template v-if="applied">
            <p>Applied · {{ applied.status }}. {{ job.company }} can see your profile.</p>
          </template>
          <template v-else-if="role === 'jobseeker'">
            <div class="field">
              <label for="note">note (optional)</label>
              <textarea id="note" v-model="note" rows="3" maxlength="1000" placeholder="Why you fit, in a line or two." />
            </div>
            <p v-if="applyError" class="formerr">{{ applyError }}</p>
            <button class="applybtn" type="button" :disabled="applying" @click="apply">
              {{ applying ? 'sending…' : 'apply with your profile' }}
            </button>
            <p>Your profile, work history and phone number go to {{ job.company }}.</p>
          </template>
          <template v-else>
            <p>Sign in as a jobseeker to apply with your profile.</p>
            <NuxtLink class="applybtn" to="/login">sign in to apply</NuxtLink>
          </template>
        </div>

        <div class="applybox">
          <h2 class="applybox-title">how to apply</h2>
          <p>{{ job.applyInstructions || `Applications are handled by ${job.company} on their own site. Click below to open the application form.` }}</p>
          <a class="applybtn" :href="job.url" target="_blank" rel="noopener" @click="track('apply_click', { job: id, source: 'external' })">apply now ↗</a>
        </div>
      </div>
      <aside class="jobside">
        <div class="sidecard">
          <h2 class="sideh">job facts</h2>
          <dl class="facts">
            <div class="fact"><dt>company</dt><dd><NuxtLink :to="companyPath(job.company)">{{ job.company }}</NuxtLink></dd></div>
            <div class="fact"><dt>sector</dt><dd><NuxtLink :to="sectorPath(job.sector)">{{ job.sector.toLowerCase() }}</NuxtLink></dd></div>
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
          <a class="applybtn" :href="job.url" target="_blank" rel="noopener" @click="track('apply_click', { job: id, source: 'external' })">apply at source ↗</a>
        </div>
        <div class="sidecard">
          <h2 class="sideh">similar roles</h2>
          <ul class="sidelist">
            <li v-for="s in similar" :key="s.id">
              <NuxtLink :to="jobPath(s)">
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
import { companyPath, jobPath, sectorPath, slugify } from '~~/shared/url'
import { isFeatured } from '~~/shared/job'

const route = useRoute()
// /jobs/<id>/<title-slug>: the id is the key, the slug is for humans.
const keyParts = computed(() =>
  (Array.isArray(route.params.key) ? route.params.key : [route.params.key]).map(String).filter(Boolean),
)
const id = computed(() => keyParts.value[0] ?? '')

const { data: remoteJob } = await useAsyncData(`job-${id.value}`, async () => remoteGet(id.value))

// Applications exist only for employer posts; scraped roles send you to source.
const { data: me } = await useFetch<{ role: string }>('/api/me')
const role = computed(() => me.value?.role ?? '')
const canApply = computed(() => id.value.startsWith('emp-'))

const { data: myApplications, refresh: refreshApplications } = await useFetch<{
  applications: Array<{ jobId: string; status: string }>
}>('/api/jobseeker/applications', { immediate: role.value === 'jobseeker' })
const applied = computed(
  () => myApplications.value?.applications.find((a) => a.jobId === id.value) ?? null,
)

const note = ref('')
const applying = ref(false)
const applyError = ref('')
async function apply() {
  applying.value = true
  applyError.value = ''
  try {
    await $fetch('/api/jobseeker/apply', {
      method: 'POST',
      body: { jobId: id.value, note: note.value },
    })
    note.value = ''
    track('application_sent', { job: id.value })
    await refreshApplications()
  } catch (e: any) {
    applyError.value = e?.data?.statusMessage || e?.message || 'could not apply'
  } finally {
    applying.value = false
  }
}

// Canonicalise the slug once the job is known, so old id-only links and stale
// slugs settle on the readable URL without a reload.
watch(
  [remoteJob, () => route.fullPath],
  () => {
    const j = remoteJob.value
    if (!import.meta.client || !j) return
    if (keyParts.value[1] === slugify(j.title)) return
    navigateTo(jobPath(j), { replace: true })
  },
  { immediate: true },
)

const job = computed<SampleJob | JobHit | null | undefined>(() => remoteJob.value)

// One view event per job visit, tagged so featured traffic can be compared.
watch(
  job,
  (j) => {
    if (j) track('job_view', { job: j.id, featured: isFeatured(j) ? 'yes' : 'no' })
  },
  { immediate: true },
)
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
const summary = computed(() => (job.value?.blurb ?? '').trim())
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
  return (j?.content ?? '').trim()
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
  if (!bodyText.value) return []
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
  return blocks
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
