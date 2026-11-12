<template>
  <section class="wrap">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dashhead">
      <div>
        <h1 class="title">{{ data?.org.name || 'Your dashboard' }}</h1>
        <p class="sub">{{ planLabel }}<template v-if="data?.org"> · {{ data.org.verified ? 'verified' : 'unverified' }}</template></p>
      </div>
      <div class="dashhead-actions">
        <NuxtLink to="/employers/jobs/new" class="applybtn">+ post a job</NuxtLink>
        <NuxtLink to="/employers/settings" class="ghostbtn">company</NuxtLink>
        <NuxtLink to="/employers/billing" class="ghostbtn">billing</NuxtLink>
        <button class="ghostbtn" type="button" @click="logout">sign out</button>
      </div>
    </div>

    <div class="grid">
      <div class="stat"><b>{{ jobs.length }}</b><span>jobs</span></div>
      <div class="stat"><b>{{ liveCount }}</b><span>live</span></div>
      <div class="stat"><b>{{ data?.org.featuredCredits ?? 0 }}</b><span>featured credits</span></div>
      <div class="stat"><b>{{ featuredCount }}</b><span>featured now</span></div>
    </div>

    <p v-if="message" class="formnote">{{ message }}</p>

    <h2 class="sect"><span>#</span> jobs</h2>

    <ul v-if="jobs.length" class="jobcards">
      <li v-for="j in jobs" :key="j.id" class="jobcard" :class="{ featured: featured(j) }">
        <div class="jobcard-main">
          <div class="jobcard-title">
            <strong>{{ j.title.toLowerCase() }}</strong>
            <span v-if="featured(j)" class="peak">★ featured</span>
          </div>
          <div class="jobcard-meta">
            {{ j.location.toLowerCase() }} · {{ j.sector.toLowerCase() }} · posted {{ j.posted_at.slice(0, 10) }}
          </div>
          <div class="jobcard-status">
            <span class="status" :class="j.status">{{ j.status }}</span>
            <span v-if="j.status === 'live' && !j.indexed_at" class="status warn">not in search</span>
          </div>
        </div>

        <div class="jobcard-actions">
          <template v-if="j.status === 'live'">
            <button
              class="switch"
              :class="{ on: featured(j) }"
              :disabled="!featured(j) && (data?.org.featuredCredits ?? 0) < 1"
              :aria-pressed="featured(j)"
              :title="switchTitle(j)"
              type="button"
              @click="toggleFeature(j)"
            ><span class="knob"></span></button>
            <span class="switchlabel">{{ featured(j) ? 'featured' : 'feature' }}</span>
          </template>
          <NuxtLink :to="`/employers/jobs/${j.id}/edit`" class="ilink">edit</NuxtLink>
          <button v-if="j.status === 'live'" class="ghostbtn" type="button" @click="close(j.id)">close</button>
          <button v-else class="ghostbtn" type="button" @click="reopen(j.id)">reopen</button>
        </div>
      </li>
    </ul>
    <div v-else class="empty">
      <p>No jobs yet.</p>
      <NuxtLink to="/employers/jobs/new" class="applybtn" style="display: inline-block">post your first job</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Job {
  id: string
  title: string
  sector: string
  location: string
  status: string
  posted_at: string
  indexed_at: string | null
  featured_until: string | null
}
interface Payload {
  org: { name: string; plan: string; planUntil: string | null; verified: boolean; featuredCredits: number }
  jobs: Job[]
}

const auth = useAuth()
const route = useRoute()
const toast = useToast()
const { data, error, refresh } = await useFetch<Payload>('/api/employer/jobs')
if (error.value) await navigateTo('/login')

const jobs = computed(() => data.value?.jobs ?? [])
const liveCount = computed(() => jobs.value.filter((j) => j.status === 'live').length)
const featuredCount = computed(() => jobs.value.filter((j) => featured(j)).length)

const message = ref(route.query.purchased ? 'Payment received. Credits appear once Polar confirms the order (a few seconds).' : '')

const planLabel = computed(() => {
  const o = data.value?.org
  if (!o) return ''
  if (o.planUntil && new Date(o.planUntil) > new Date()) return `${o.plan} plan · until ${o.planUntil.slice(0, 10)}`
  return 'free plan · 5 live jobs'
})

const featured = (j: Job) => Boolean(j.featured_until && new Date(j.featured_until) > new Date())
const switchTitle = (j: Job) =>
  featured(j)
    ? 'featured — click to remove'
    : (data.value?.org.featuredCredits ?? 0) > 0
      ? 'feature this job (uses 1 credit)'
      : 'no featured credits'

async function toggleFeature(j: Job) {
  const on = featured(j)
  try {
    await $fetch(`/api/employer/jobs/${j.id}/${on ? 'unfeature' : 'feature'}`, { method: 'POST' })
    toast.success(on ? 'feature removed' : 'job featured')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'could not update feature')
  }
}

async function close(id: string) {
  try {
    await $fetch(`/api/employer/jobs/${id}`, { method: 'DELETE' })
    toast.success('job closed')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'could not close job')
  }
}

async function reopen(id: string) {
  try {
    await $fetch(`/api/employer/jobs/${id}/reopen`, { method: 'POST' })
    toast.success('job reopened')
    await refresh()
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'could not reopen job')
  }
}

async function logout() {
  await auth.signOut()
  window.location.href = '/login'
}

useHead({ title: 'your jobs · tshono' })
</script>
