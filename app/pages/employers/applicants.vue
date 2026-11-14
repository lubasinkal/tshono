<template>
  <section class="wrap">
    <p><NuxtLink to="/employers">← your jobs</NuxtLink></p>

    <div class="dashhead">
      <div>
        <h1 class="title">Applicants.</h1>
        <p class="sub">
          {{ applicants.length }} application{{ applicants.length === 1 ? '' : 's' }} across your jobs
        </p>
      </div>
      <div class="dashhead-actions">
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
          <NuxtLink :to="`/employers/candidates/${a.userId}`" class="ilink">profile</NuxtLink>
          <a v-if="a.phone" :href="`tel:${a.phone}`" class="ilink">call</a>
          <NuxtLink :to="`/employers/jobs/${a.jobId}/applicants`" class="ilink">job</NuxtLink>
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
const filters = reactive({ jobId: '', status: '' })

// The fetcher watches the filters, so the list narrows as you pick.
const { data, error } = await useFetch<Payload>('/api/employer/applicants', { query: filters })
if (error.value) await navigateTo('/login')

const applicants = computed(() => data.value?.applicants ?? [])
const jobs = computed(() => data.value?.jobs ?? [])

// Same rows, same filters, spreadsheet instead of page.
const exportUrl = computed(() => {
  const p = new URLSearchParams({ format: 'csv' })
  if (filters.jobId) p.set('jobId', filters.jobId)
  if (filters.status) p.set('status', filters.status)
  return `/api/employer/applicants?${p}`
})

const statusClass = (s: string) => (s === 'shortlisted' ? 'live' : s === 'rejected' ? 'closed' : '')

useHead({ title: 'applicants · tshono' })
</script>
