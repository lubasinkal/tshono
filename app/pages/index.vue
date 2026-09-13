<template>
  <section>
    <div class="hero">
      <h1>Find work<span class="dot">.</span> Fast<span class="dot">.</span></h1>
      <p>Every opportunity in Botswana in one instant search. No accounts, no noise.</p>
      <div class="cmdbar">
        <input
          ref="box"
          v-model="query"
          type="search"
          placeholder="search roles, companies, places…"
          aria-label="Search jobs"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="kbd"><span>/</span></span>
      </div>
      <div class="filters">
        <select v-model="sector" aria-label="Sector">
          <option value="">all sectors</option>
          <option v-for="s in sectors" :key="s" :value="s">{{ s.toLowerCase() }}</option>
        </select>
        <select v-model="location" aria-label="Location">
          <option value="">all places</option>
          <option v-for="l in locations" :key="l" :value="l">{{ l.toLowerCase() }}</option>
        </select>
        <select v-model="exp" aria-label="Experience">
          <option value="">any experience</option>
          <option value="0">entry · 0 yrs</option>
          <option value="2">up to 2 yrs</option>
          <option value="5">up to 5 yrs</option>
        </select>
      </div>
    </div>

    <p class="stats">
      <span>{{ results.length }} roles{{ ms !== null ? ` in ${ms}ms` : '' }}</span>
      <span class="live-dot">{{ live ? '● live index' : '○ sample data' }}</span>
    </p>

    <ul class="list">
      <li v-for="j in results" :key="j.id" class="card">
        <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · {{ j.location }}</span>
          <span class="tags">
            <em>{{ j.sector }}</em>
            <em>{{ j.minYears === 0 ? 'entry' : j.minYears + ' yrs+' }}</em>
            <em :class="{ hot: left(j) <= 7 }">{{ left(j) <= 0 ? 'closed' : left(j) + 'd left' }}</em>
          </span>
          <span class="blurb">{{ j.blurb }}</span>
        </NuxtLink>
      </li>
    </ul>
    <p v-if="!results.length" class="empty">no match. loosen a filter or try one word like nurse.</p>
  </section>
</template>

<script setup lang="ts">
import { SECTORS, LOCATIONS, type SampleJob } from '~/data/sampleJobs'
import { searchJobsLocal, remoteSearch, isRemote, daysLeft } from '~/composables/useJobSearch'

const route = useRoute()
const router = useRouter()
const box = ref<HTMLInputElement | null>(null)

const query = ref(String(route.query.q ?? ''))
const sector = ref(String(route.query.sector ?? ''))
const location = ref(String(route.query.location ?? ''))
const exp = ref(String(route.query.exp ?? ''))

const sectors = SECTORS
const locations = LOCATIONS
const live = isRemote()
const remoteHits = ref<SampleJob[]>([])
const ms = ref<number | null>(null)

const localResults = computed(() => {
  const t0 = performance.now()
  const r = searchJobsLocal(query.value, sector.value, location.value, exp.value === '' ? null : Number(exp.value))
  if (!live) ms.value = Math.max(1, Math.round(performance.now() - t0))
  return r
})
const results = computed(() => (live ? remoteHits.value : localResults.value))
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
  queueRemote()
})

// Debounced live fetch against Typesense.
let t: ReturnType<typeof setTimeout> | null = null
async function queueRemote() {
  if (!live) return
  if (t) clearTimeout(t)
  t = setTimeout(async () => {
    const t0 = performance.now()
    try {
      remoteHits.value = await remoteSearch(
        query.value,
        sector.value,
        location.value,
        exp.value === '' ? null : Number(exp.value),
      )
    } catch {
      remoteHits.value = []
    }
    ms.value = Math.max(1, Math.round(performance.now() - t0))
  }, 160)
}

onMounted(() => {
  queueRemote()
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault()
      box.value?.focus()
    }
  })
})

useHead({ title: 'tshono. fast botswana jobs search' })
</script>
