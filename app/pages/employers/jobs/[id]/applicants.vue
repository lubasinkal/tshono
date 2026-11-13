<template>
  <section class="wrap">
    <p><NuxtLink to="/employers">← your jobs</NuxtLink></p>

    <div class="dashhead">
      <div>
        <h1 class="title">{{ job?.title || 'Applicants' }}</h1>
        <p class="sub">
          {{ applicants.length }} application{{ applicants.length === 1 ? '' : 's' }}
          <template v-if="job"> · {{ job.status }}</template>
        </p>
      </div>
      <div class="dashhead-actions">
        <NuxtLink v-if="job" :to="`/employers/jobs/${route.params.id}/edit`" class="ghostbtn">edit job</NuxtLink>
      </div>
    </div>

    <ul v-if="applicants.length" class="jobcards">
      <li v-for="a in applicants" :key="a.id" class="jobcard">
        <div class="jobcard-main">
          <div class="jobcard-title">
            <strong>{{ a.name || 'jobseeker' }}</strong>
            <span class="status" :class="a.status === 'shortlisted' ? 'live' : a.status === 'rejected' ? 'closed' : ''">
              {{ a.status }}
            </span>
          </div>
          <div class="jobcard-meta">
            {{ [a.headline, a.occupation, a.location, a.years ? `${a.years} yrs` : ''].filter(Boolean).join(' · ') }}
          </div>
          <div v-if="a.note" class="jobcard-meta">“{{ a.note }}”</div>
          <div class="jobcard-meta">applied {{ String(a.createdAt).slice(0, 10) }}</div>
        </div>

        <div class="jobcard-actions">
          <NuxtLink :to="`/employers/candidates/${a.userId}`" class="ilink">profile</NuxtLink>
          <a v-if="a.phone" :href="`tel:${a.phone}`" class="ilink">call</a>
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
      <p>No applications yet.</p>
      <p>Jobseekers apply from the public job page.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { APPLICATION_STATUSES } from '~~/shared/application'

interface Applicant {
  id: string
  userId: string
  name: string
  headline: string | null
  occupation: string | null
  location: string | null
  years: number | null
  phone: string | null
  note: string
  status: string
  createdAt: string
}

interface Payload {
  job: { id: string; title: string; status: string }
  applicants: Applicant[]
}

const route = useRoute()
const STATUSES = APPLICATION_STATUSES

const { data, error, refresh } = await useFetch<Payload>(
  () => `/api/employer/jobs/${route.params.id}/applicants`,
)
if (error.value) await navigateTo(error.value.statusCode === 404 ? '/employers' : '/login')

const job = computed(() => data.value?.job ?? null)
const applicants = computed(() => data.value?.applicants ?? [])

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

useHead({ title: 'applicants · tshono' })
</script>
