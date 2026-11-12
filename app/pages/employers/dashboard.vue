<template>
  <section class="wrap">
    <p><NuxtLink to="/">← search</NuxtLink></p>
    <div class="dhead">
      <span class="chip">◉ {{ data?.org.name || 'employer' }}</span>
      <span class="chip">{{ data?.org.verified ? '● verified' : '○ unverified' }}</span>
      <span class="chip">{{ data?.org.plan || 'free' }} plan</span>
      <span class="updated">{{ data?.jobs.length || 0 }} jobs</span>
    </div>

    <h1 class="title">Your jobs.</h1>
    <p class="sub">Live jobs appear in search immediately. Free plan: five live jobs.</p>

    <p>
      <NuxtLink to="/employers/jobs/new" class="applybtn" style="display: inline-block; padding: 9px 16px">+ post a job</NuxtLink>
      <button class="ghostbtn" type="button" style="margin-left: 10px" @click="logout">sign out</button>
    </p>

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
            <NuxtLink :to="`/employers/jobs/${j.id}/edit`" class="ilink">edit</NuxtLink>
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
}
interface Payload {
  org: { name: string; plan: string; verified: boolean }
  jobs: Job[]
}

const auth = useAuth()
const { data, error, refresh } = await useFetch<Payload>('/api/employer/jobs')
if (error.value) await navigateTo('/employers')

async function close(id: string) {
  await $fetch(`/api/employer/jobs/${id}`, { method: 'DELETE' })
  await refresh()
}

async function logout() {
  await auth.signOut()
  await navigateTo('/employers')
}

useHead({ title: 'your jobs · tshono' })
</script>
