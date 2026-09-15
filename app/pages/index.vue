<template>
  <section :class="{ 'is-compact': isCompact }">
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
          @focus="focused = true"
          @blur="focused = false"
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
      <span :title="remoteTook !== null && ms !== null ? `round trip ${ms}ms` : ''">{{ totalCount }} roles{{ showMs !== null ? ` · search ${showMs}ms` : '' }}{{ pages > 1 ? ` · page ${page} of ${pages}` : '' }}</span>
      <span class="live-dot">● live index</span>
    </p>

    <ul class="list">
      <li v-for="j in results" :key="j.id" class="card">
        <NuxtLink :to="`/jobs/${j.id}`" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · {{ j.location }}</span>
          <span class="tags">
            <em>{{ j.sector }}</em>
            <em>{{ j.minYears === 0 ? 'entry' : j.minYears + ' yrs+' }}</em>
            <em :class="{ hot: j.closing !== '' && left(j) <= 7 }">{{ j.closing === '' ? 'open' : left(j) <= 0 ? 'closed' : left(j) + 'd left' }}</em>
          </span>
          <span class="blurb">{{ j.blurb }}</span>
        </NuxtLink>
      </li>
    </ul>
    <p v-if="!results.length" class="empty">no match. loosen a filter or try one word like nurse.</p>

    <div v-if="pages > 1" class="pager">
      <button :disabled="page <= 1" @click="goPage(page - 1)">← newer</button>
      <span>{{ page }} / {{ pages }}</span>
      <button :disabled="page >= pages" @click="goPage(page + 1)">older →</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SECTORS, LOCATIONS, type SampleJob } from '~/data/sampleJobs'
import { remoteSearch, daysLeft, liveRawCached } from '~/composables/useJobSearch'

const PER_PAGE = 20

const route = useRoute()
const router = useRouter()
const box = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const isCompact = computed(() => focused.value || query.value.trim().length > 0 || sector.value !== '' || location.value !== '' || exp.value !== '')

const query = ref(String(route.query.q ?? ''))
const sector = ref(String(route.query.sector ?? ''))
const location = ref(String(route.query.location ?? ''))
const exp = ref(String(route.query.exp ?? ''))
const page = ref(Number(route.query.page ?? 1) || 1)

const sectors = SECTORS
const locations = LOCATIONS
const remoteHits = ref<SampleJob[]>([])
const remoteFound = ref(0)
const remoteTook = ref<number | null>(null)
const ms = ref<number | null>(null)
const showMs = computed(() => (remoteTook.value ?? ms.value))

const maxYears = computed(() => (exp.value === '' ? null : Number(exp.value)))

const results = computed(() => remoteHits.value)
const totalCount = computed(() => remoteFound.value)
const pages = computed(() => Math.max(1, Math.ceil(totalCount.value / PER_PAGE)))
const left = (j: { closing: string }) => (j.closing ? daysLeft(j.closing) : 9999)

function syncUrl() {
  router.replace({
    query: {
      ...(query.value ? { q: query.value } : {}),
      ...(sector.value ? { sector: sector.value } : {}),
      ...(location.value ? { location: location.value } : {}),
      ...(exp.value ? { exp: exp.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  })
}

function goPage(p: number) {
  page.value = Math.min(Math.max(1, p), pages.value)
  syncUrl()
  queueRemote()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Keep every view shareable through the URL. Filter edits reset to page one.
watch([query, sector, location, exp], () => {
  page.value = 1
  syncUrl()
  queueRemote()
})
watch(page, () => {
  syncUrl()
  queueRemote()
})

// Live fetch against Typesense. First paint fires at once, typing waits 160ms.
let t: ReturnType<typeof setTimeout> | null = null
async function runRemote() {
  const t0 = performance.now()
  // serve stale cache instantly so UI never blanks
  const stale = liveRawCached({ q: query.value.trim() || '', query_by: 'title,company,sector,location,blurb', sort_by: 'posted:desc', page: String(page.value), per_page: String(PER_PAGE), ...(sector.value || location.value || maxYears.value !== null ? { filter_by: [ ...(sector.value ? [`sector:=${sector.value}`] : []), ...(location.value ? [`location:=${location.value}`] : []), ...(maxYears.value !== null ? [`min_years:<=${maxYears.value}`] : []) ].join(' && ') } : {}), include_fields: 'id,title,company,sector,location,blurb,url,closing,posted,min_years' }) as { hits?: Array<{ document: Record<string, unknown> }>; found?: number; search_time_ms?: number } | null
  if (stale?.hits) {
    const { toJobHit } = await import('~/composables/useJobSearch')
    remoteHits.value = stale.hits.map((h) => toJobHit(h.document))
    remoteFound.value = stale.found ?? 0
    remoteTook.value = stale.search_time_ms ?? null
  }
  try {
    const r = await remoteSearch(query.value, sector.value, location.value, maxYears.value, page.value, PER_PAGE)
    remoteHits.value = r.hits
    remoteFound.value = r.found
    remoteTook.value = r.took
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    if (!stale?.hits) { remoteHits.value = []; remoteFound.value = 0; remoteTook.value = null }
  }
  ms.value = Math.round((performance.now() - t0) * 10) / 10
}
function queueRemote(immediate = false) {
  if (t) clearTimeout(t)
  if (immediate) {
    runRemote()
    return
  }
  t = setTimeout(runRemote, 160)
}

onMounted(() => {
  queueRemote(true)
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault()
      box.value?.focus()
    }
  })
})

useHead({ title: 'tshono. fast botswana jobs search' })
useSeoMeta({
  ogTitle: 'tshono. find work. fast.',
  ogDescription: 'Every opportunity in Botswana in one instant search. No accounts, no noise.',
  ogImage: 'https://tshono.pages.dev/og.png',
})
</script>
