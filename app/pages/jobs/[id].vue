<template>
  <section class="wrap">
    <p><NuxtLink to="/">← Back to search</NuxtLink></p>
    <div v-if="job">
      <h1 class="title">{{ job.title }}</h1>
      <p class="sub">{{ job.company }} · {{ job.location }} · {{ job.sector }}</p>
      <p class="meta">
        Posted {{ job.posted }} · Closes {{ job.closing }} ·
        {{ job.minYears === 0 ? 'Entry level' : job.minYears + ' years plus' }}
      </p>
      <p>{{ job.blurb }}</p>
      <p>
        <a :href="job.url" target="_blank" rel="noopener">Apply at source ↗</a>
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
    <p v-else>Role not found. <NuxtLink to="/">Back to search</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { sampleJobs } from '~/data/sampleJobs'

const route = useRoute()
const id = String(route.params.id)
const job = computed(() => sampleJobs.find((j) => j.id === id))
const similar = computed(() =>
  sampleJobs.filter((j) => job.value && j.id !== job.value.id && (j.sector === job.value.sector || j.location === job.value.location)).slice(0, 5),
)

useHead({ title: job.value ? `${job.value.title} · Tshono` : 'Role · Tshono' })
</script>
