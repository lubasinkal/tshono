<template>
  <section class="wrap">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>

    <div class="dashhead">
      <div>
        <h1 class="title">Candidates.</h1>
        <p class="sub">
          {{ candidates.length }} jobseeker{{ candidates.length === 1 ? '' : 's' }} visible · newest first
        </p>
      </div>
      <div class="dashhead-actions">
        <NuxtLink to="/employers/jobs/new" class="ghostbtn">post a job</NuxtLink>
      </div>
    </div>

    <div class="rowfields">
      <div class="field">
        <label for="occupation">occupation group</label>
        <select id="occupation" v-model="filters.occupation">
          <option value="">any</option>
          <option v-for="o in OCCUPATIONS" :key="o" :value="o">{{ o.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="sector">sector</label>
        <select id="sector" v-model="filters.sector">
          <option value="">any</option>
          <option v-for="s in SECTORS" :key="s" :value="s">{{ s.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="location">place</label>
        <select id="location" v-model="filters.location">
          <option value="">any</option>
          <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="minYears">at least (years)</label>
        <input id="minYears" v-model.number="filters.minYears" type="number" min="0" max="50" placeholder="any" />
      </div>
    </div>

    <ul v-if="candidates.length" class="jobcards">
      <li v-for="c in candidates" :key="c.id" class="jobcard">
        <NuxtLink :to="`/employers/candidates/${c.id}`" class="jobcard-main ilink">
          <div class="jobcard-title">
            <strong>{{ c.headline || c.name || 'jobseeker' }}</strong>
          </div>
          <div class="jobcard-meta">
            {{ [c.name, c.occupation, c.location].filter(Boolean).join(' · ') }}
          </div>
          <div v-if="preview(c.skills)" class="jobcard-meta">{{ preview(c.skills) }}</div>
          <div class="jobcard-status">
            <span class="status">{{ c.years }} yrs</span>
            <span v-if="c.relocate" class="status">will relocate</span>
            <span v-if="c.availableFrom" class="status">available {{ c.availableFrom }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="empty">
      <p>No candidates match those filters.</p>
      <p>Only jobseekers who turn visibility on appear here.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { OCCUPATIONS } from '~~/shared/job'
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

interface CandidateCard {
  id: string
  name: string
  headline: string
  occupation: string
  location: string
  years: number
  relocate: boolean
  availableFrom: string | null
  skills: string
}

const filters = reactive({ occupation: '', sector: '', location: '', minYears: '' as number | '' })

// The fetcher watches the reactive filters, so the list narrows as you pick.
const { data, error } = await useFetch<{ candidates: CandidateCard[] }>(
  '/api/employer/candidates',
  { query: filters },
)
if (error.value) await navigateTo('/login')

const candidates = computed(() => data.value?.candidates ?? [])
const preview = (s: string) => s.split('\n').map((v) => v.trim()).filter(Boolean).join(', ').slice(0, 90)

useHead({ title: 'candidates · tshono' })
</script>
