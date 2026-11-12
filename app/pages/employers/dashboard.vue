<template>
  <section class="wrap">
    <p><NuxtLink to="/">← search</NuxtLink></p>
    <div class="dhead">
      <span class="chip">◉ {{ data?.org.name || 'employer' }}</span>
      <span class="chip">{{ data?.org.verified ? '● verified' : '○ unverified' }}</span>
      <span class="chip">{{ data?.org.planUntil && new Date(data.org.planUntil) > new Date() ? `${data.org.plan} until ${data.org.planUntil.slice(0, 10)}` : 'free plan' }}</span>
      <span class="chip">{{ data?.org.featuredCredits ?? 0 }} featured credits</span>
      <span class="updated">{{ data?.jobs.length || 0 }} jobs</span>
    </div>

    <h1 class="title">Your jobs.</h1>
    <p class="sub">Live jobs appear in search immediately. Free plan: five live jobs; paid plans are unlimited.</p>

    <p>
      <NuxtLink to="/employers/jobs/new" class="applybtn" style="display: inline-block; padding: 9px 16px">+ post a job</NuxtLink>
      <NuxtLink to="/employers/billing" class="ghostbtn" style="margin-left: 10px; display: inline-block">billing</NuxtLink>
      <button class="ghostbtn" type="button" style="margin-left: 10px" @click="logout">sign out</button>
    </p>

    <p v-if="message" class="formnote">{{ message }}</p>

    <table v-if="data?.jobs.length" class="dtable">
      <thead>
        <tr><th>role</th><th>place</th><th>status</th><th>posted</th><th>search</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="j in data.jobs" :key="j.id">
          <td>{{ j.title.toLowerCase() }}</td>
          <td>{{ j.location.toLowerCase() }}</td>
          <td>{{ j.status }}</td>
          <td>{{ j.posted_at.slice(0, 10) }}</td>
          <td>{{ j.indexed_at ? 'indexed' : 'not indexed' }}</td>
          <td style="white-space: nowrap">
            <button
              v-if="j.status === 'live'"
              class="switch"
              :class="{ on: featured(j) }"
              :disabled="!featured(j) && (data?.org.featuredCredits ?? 0) < 1"
              :aria-pressed="featured(j)"
              :title="switchTitle(j)"
              type="button"
              @click="toggleFeature(j)"
            ><span class="knob"></span></button>
            <span class="switchlabel">{{ featured(j) ? 'featured' : 'feature' }}</span>
            <NuxtLink :to="`/employers/jobs/${j.id}/edit`" class="ilink" style="margin-left: 8px">edit</NuxtLink>
            <button v-if="j.status === 'live'" class="ghostbtn" type="button" style="margin-left: 8px" @click="close(j.id)">close</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">No jobs yet. <NuxtLink to="/employers/jobs/new">Post the first one</NuxtLink>.</p>
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
const { data, error, refresh } = await useFetch<Payload>('/api/employer/jobs')
if (error.value) await navigateTo('/login')

const message = ref(route.query.purchased ? 'Payment received. Credits appear once Polar confirms the order (a few seconds).' : '')

const featured = (j: Job) => Boolean(j.featured_until && new Date(j.featured_until) > new Date())
const switchTitle = (j: Job) =>
  featured(j)
    ? 'featured — click to remove'
    : (data.value?.org.featuredCredits ?? 0) > 0
      ? 'feature this job (uses 1 credit)'
      : 'no featured credits'

async function toggleFeature(j: Job) {
  const on = featured(j)
  await $fetch(`/api/employer/jobs/${j.id}/${on ? 'unfeature' : 'feature'}`, { method: 'POST' })
  await refresh()
}

async function close(id: string) {
  await $fetch(`/api/employer/jobs/${id}`, { method: 'DELETE' })
  await refresh()
}

async function logout() {
  await auth.signOut()
  window.location.href = '/login'
}

useHead({ title: 'your jobs · tshono' })
</script>
