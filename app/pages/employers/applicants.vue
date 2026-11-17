<template>
  <section class="wrap">
    <p>
      <NuxtLink to="/employers">← your jobs</NuxtLink>
      <template v-if="filters.jobId">
        · <NuxtLink to="/employers/applicants">all applications</NuxtLink>
      </template>
    </p>

    <div class="dashhead">
      <div>
        <h1 class="title">{{ jobName || 'Applications' }}.</h1>
        <p class="sub">
          {{ applicants.length }} application{{ applicants.length === 1 ? '' : 's' }}
          <template v-if="jobName">to this job</template><template v-else>across your jobs</template>
        </p>
      </div>
      <div class="dashhead-actions">
        <NuxtLink v-if="filters.jobId" :to="`/employers/jobs/${filters.jobId}/edit`" class="ghostbtn">edit job</NuxtLink>
        <a :href="exportUrl" class="ghostbtn">export csv</a>
      </div>
    </div>

    <div class="rowfields">
      <div class="field">
        <label for="job">job</label>
        <select id="job" v-model="filters.jobId">
          <option value="">any</option>
          <option v-for="j in jobs" :key="j.id" :value="j.id">{{ j.title.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="status">status</label>
        <select id="status" v-model="filters.status">
          <option value="">any</option>
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <ul v-if="applicants.length" class="jobcards">
      <li v-for="a in applicants" :key="a.id" class="jobcard">
        <div class="jobcard-main">
          <div class="jobcard-title">
            <strong>{{ a.name || 'jobseeker' }}</strong>
            <span class="status" :class="statusClass(a.status)">{{ a.status }}</span>
          </div>
          <div class="jobcard-meta">
            {{ [a.jobTitle, a.headline, a.location, a.years ? `${a.years} yrs` : ''].filter(Boolean).join(' · ') }}
          </div>
          <div v-if="a.note" class="jobcard-meta">“{{ a.note }}”</div>
          <div class="jobcard-meta">applied {{ String(a.createdAt).slice(0, 10) }}</div>
        </div>

        <div class="jobcard-actions">
          <NuxtLink :to="`/employers/candidates/${a.userId}?from=applications`" class="ilink">profile</NuxtLink>
          <a v-if="a.phone" :href="`tel:${a.phone}`" class="ilink">call</a>
          <NuxtLink :to="`/employers/applicants?job=${a.jobId}`" class="ilink">job</NuxtLink>
          <button
            v-for="s in STATUSES"
            :key="s"
            class="ghostbtn"
            type="button"
            :disabled="busy === a.id || a.status === s"
            @click="setStatus(a.id, s)"
          >{{ s }}</button>
        </div>
      </li>
    </ul>

    <div v-else class="empty">
      <p>No applications match.</p>
      <p>Jobseekers apply from the public job page.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { APPLICATION_STATUSES } from '~~/shared/application'

interface Applicant {
  id: string
  userId: string
  jobId: string
  jobTitle: string
  name: string
  headline: string | null
  location: string | null
  years: number | null
  phone: string | null
  note: string
  status: string
  createdAt: string
}

interface Payload {
  applicants: Applicant[]
  jobs: { id: string; title: string }[]
}

const STATUSES = APPLICATION_STATUSES
const route = useRoute()
const router = useRouter()
// The job filter is the same page either way: the dashboard links here with
// ?job=<id> instead of owning a second, separate applicants route.
const filters = reactive({ jobId: String(route.query.job ?? ''), status: '' })

// The fetcher watches the filters, so the list narrows as you pick.
const { data, error, refresh } = await useFetch<Payload>('/api/employer/applicants', { query: filters })
if (error.value) await navigateTo('/login')

const applicants = computed(() => data.value?.applicants ?? [])
const jobs = computed(() => data.value?.jobs ?? [])
const jobName = computed(() => jobs.value.find((j) => j.id === filters.jobId)?.title ?? '')

// Keep the filter in the URL so a filtered list is linkable and the back button
// undoes it.
watch(() => filters.jobId, (id) => router.replace({ query: id ? { job: id } : {} }))

const busy = ref('')
async function setStatus(id: string, status: string) {
  busy.value = id
  try {
    await $fetch(`/api/employer/applications/${id}`, { method: 'POST', body: { status } })
    await refresh()
  } finally {
    busy.value = ''
  }
}

// Same rows, same filters, spreadsheet instead of page.
const exportUrl = computed(() => {
  const p = new URLSearchParams({ format: 'csv' })
  if (filters.jobId) p.set('jobId', filters.jobId)
  if (filters.status) p.set('status', filters.status)
  return `/api/employer/applicants?${p}`
})

const statusClass = (s: string) => (s === 'shortlisted' ? 'live' : s === 'rejected' ? 'closed' : '')

useHead({ title: 'applications · tshono' })
</script>
