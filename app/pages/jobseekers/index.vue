<template>
  <section class="wrap">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dashhead">
      <div>
        <h1 class="title">Your dashboard.</h1>
        <p class="sub">
          {{ done }}/{{ checks.length }} profile steps done ·
          {{ profile.visible ? 'visible to employers' : 'hidden from employers' }}
        </p>
      </div>
      <div class="dashhead-actions">
        <NuxtLink to="/jobseekers/profile" class="applybtn">
          {{ done === checks.length ? 'your profile' : 'finish your profile' }}
        </NuxtLink>
        <NuxtLink to="/" class="ghostbtn">search jobs</NuxtLink>
      </div>
    </div>

    <div class="grid">
      <div class="stat"><b>{{ pct }}%</b><span>profile filled</span></div>
      <div class="stat"><b>{{ profile.years }}</b><span>years experience</span></div>
      <div class="stat"><b>{{ profile.experience.length }}</b><span>roles stored</span></div>
      <div class="stat"><b>{{ profile.education.length }}</b><span>qualifications</span></div>
    </div>

    <h2 class="sect"><span>#</span> next steps</h2>
    <ul v-if="todo.length" class="todo">
      <li v-for="t in todo" :key="t">
        <NuxtLink to="/jobseekers/profile">{{ t }}</NuxtLink>
      </li>
    </ul>
    <p v-else class="formnote">
      Profile complete. Employers can only find you once you turn visibility on.
    </p>

    <h2 class="sect"><span>#</span> jobs for you</h2>
    <ul v-if="jobs.length" class="jobcards">
      <li v-for="j in jobs" :key="j.id" class="jobcard">
        <NuxtLink :to="jobPath(j)" class="jobcard-main ilink">
          <div class="jobcard-title">
            <strong>{{ j.title }}</strong>
            <span v-if="j.featured" class="peak">★ featured</span>
            <span v-if="j.matched" class="peak">★ matches you</span>
          </div>
          <div class="jobcard-meta">
            {{ j.company || 'hiring firm' }} · {{ j.location.toLowerCase() }} · {{ j.sector.toLowerCase() }}
          </div>
          <div class="jobcard-status">
            <span v-if="j.closing" class="status">closes {{ j.closing }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="empty">
      <p>No live jobs on tshono yet.</p>
      <NuxtLink to="/" class="applybtn" style="display: inline-block">search jobs</NuxtLink>
    </div>

    <h2 class="sect"><span>#</span> your applications</h2>
    <ul v-if="applications.length" class="jobcards">
      <li v-for="a in applications" :key="a.id" class="jobcard">
        <NuxtLink :to="jobPath({ id: a.jobId, title: a.title })" class="jobcard-main ilink">
          <div class="jobcard-title">
            <strong>{{ a.title }}</strong>
            <span class="status" :class="a.status === 'shortlisted' ? 'live' : a.status === 'rejected' ? 'closed' : ''">
              {{ a.status }}
            </span>
          </div>
          <div class="jobcard-meta">
            {{ a.company || 'hiring firm' }} · applied {{ a.createdAt.slice(0, 10) }}
            <template v-if="a.closing"> · closes {{ a.closing }}</template>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="formnote">No applications yet. Open a job and apply with your profile.</p>
  </section>
</template>

<script setup lang="ts">
import { emptyJobseeker, type JobseekerInput } from '~~/shared/jobseeker'
import { jobPath } from '~~/shared/url'

interface MatchJob {
  id: string
  title: string
  company: string | null
  sector: string
  location: string
  closing: string | null
  matched: boolean
  featured: boolean
}

const { data: matches, error: matchError } = await useFetch<{ jobs: MatchJob[] }>(
  '/api/jobseeker/matches',
)
const { data: profileData, error: profileError } = await useFetch<{ profile: JobseekerInput }>(
  '/api/jobseeker/profile',
)
if (matchError.value || profileError.value) await navigateTo('/login')

const profile = computed<JobseekerInput>(() => profileData.value?.profile ?? emptyJobseeker)
const jobs = computed(() => matches.value?.jobs ?? [])

interface ApplicationRow {
  id: string
  jobId: string
  title: string
  company: string | null
  status: string
  closing: string | null
  createdAt: string
}

const { data: applicationsData } = await useFetch<{ applications: ApplicationRow[] }>(
  '/api/jobseeker/applications',
)
const applications = computed(() => applicationsData.value?.applications ?? [])

// Only the steps that change how the profile matches or who can see it.
const checks = computed(() => [
  { label: 'add a headline', done: Boolean(profile.value.headline) },
  { label: 'pick your occupation group', done: Boolean(profile.value.occupation) },
  { label: 'list your skills', done: Boolean(profile.value.skills) },
  { label: 'add a work history role', done: profile.value.experience.length > 0 },
  { label: 'add a qualification', done: profile.value.education.length > 0 },
  { label: 'add a phone number', done: Boolean(profile.value.phone) },
  { label: 'turn on employer visibility', done: profile.value.visible },
])
const done = computed(() => checks.value.filter((c) => c.done).length)
const pct = computed(() => Math.round((done.value / checks.value.length) * 100))
const todo = computed(() => checks.value.filter((c) => !c.done).map((c) => c.label))

useHead({ title: 'your dashboard · tshono' })
</script>

<style scoped>
.todo { list-style: none; margin: 0; padding: 0; display: grid; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
.todo a {
  display: flex; align-items: center; gap: 10px; padding: 11px 16px;
  border-bottom: 1px solid var(--line); color: var(--text); text-decoration: none; font-size: 13.5px;
}
.todo li:last-child a { border-bottom: none; }
.todo a::before { content: '☐'; color: var(--faint); font-family: var(--mono); font-size: 12px; }
.todo a:hover { background: var(--panel2); color: var(--accent); }
</style>
