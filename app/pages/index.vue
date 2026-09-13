<template>
  <section class="wrap">
    <h1 class="title">Every opportunity in Botswana in one fast search.</h1>
    <p class="sub">Instant results as you type. Filter by sector, place and experience. Share any view with a link.</p>

    <div class="bar">
      <input
        ref="box"
        v-model="query"
        type="search"
        placeholder="Try nurse, driver, analyst, remote…  (press / to focus)"
        aria-label="Search jobs"
      />
      <select v-model="sector" aria-label="Sector">
        <option value="">All sectors</option>
        <option v-for="s in sectors" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-model="location" aria-label="Location">
        <option value="">All places</option>
        <option v-for="l in locations" :key="l" :value="l">{{ l }}</option>
      </select>
      <select v-model="exp" aria-label="Experience">
        <option value="">Any experience</option>
        <option value="0">Entry (0 yrs)</option>
        <option value="2">Up to 2 yrs</option>
        <option value="5">Up to 5 yrs</option>
      </select>
    </div>

    <p class="meta">{{ results.length }} roles found · updated 13 Sep 2026</p>

    <ul class="list">
      <li v-for="j in results" :key="j.id" class="card">
        <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · {{ j.location }}</span>
          <span class="tags">
            <em>{{ j.sector }}</em>
            <em>{{ j.minYears === 0 ? 'Entry' : j.minYears + ' yrs+' }}</em>
            <em :class="{ hot: left(j) <= 7 }">{{ left(j) <= 0 ? 'Closed' : left(j) + ' days left' }}</em>
          </span>
          <span class="blurb">{{ j.blurb }}</span>
        </NuxtLink>
      </li>
    </ul>
    <p v-if="!results.length" class="empty">No roles match. Loosen a filter or try one word like nurse.</p>
  </section>
</template>

<script setup lang="ts">
import { SECTORS, LOCATIONS } from '~/data/sampleJobs'
import { searchJobsLocal, daysLeft } from '~/composables/useJobSearch'

const route = useRoute()
const router = useRouter()
const box = ref<HTMLInputElement | null>(null)

const query = ref(String(route.query.q ?? ''))
const sector = ref(String(route.query.sector ?? ''))
const location = ref(String(route.query.location ?? ''))
const exp = ref(String(route.query.exp ?? ''))

const sectors = SECTORS
const locations = LOCATIONS

const results = computed(() =>
  searchJobsLocal(query.value, sector.value, location.value, exp.value === '' ? null : Number(exp.value)),
)
const left = (j: { closing: string }) => daysLeft(j.closing)

// Keep every view shareable through the URL.
watch([query, sector, location, exp], () => {
  router.replace({
    query: {
      ...(query.value ? { q: query.value } : {}),
      ...(sector.value ? { sector: sector.value } : {}),
      ...(location.value ? { location: location.value } : {}),
      ...(exp.value ? { exp: exp.value } : {}),
    },
  })
})

// Debounce URL churn while typing fast.
let t: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (t) clearTimeout(t)
  t = setTimeout(() => {}, 120)
})

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault()
      box.value?.focus()
    }
  })
})

useHead({ title: 'Tshono. Fast Botswana jobs search' })
</script>
