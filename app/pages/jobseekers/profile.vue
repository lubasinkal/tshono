<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ jobseeker profile</span>
      <span class="updated">not shown publicly</span>
    </div>

    <h1 class="title">What you're looking for.</h1>
    <p class="sub">We use this to show you jobs that fit, and to let employers find you.</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label for="headline">headline</label>
        <input
          id="headline"
          v-model="form.headline"
          maxlength="120"
          required
          placeholder="Underground fitter with 6 years in mining"
        />
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="occupation">occupation group (ISCO-08)</label>
          <select id="occupation" v-model="form.occupation" required>
            <option value="" disabled>pick the closest group</option>
            <option v-for="o in OCCUPATIONS" :key="o" :value="o">{{ o.toLowerCase() }}</option>
          </select>
        </div>
        <div class="field">
          <label for="sector">sector</label>
          <select id="sector" v-model="form.sector">
            <option value="">any sector</option>
            <option v-for="s in SECTORS" :key="s" :value="s">{{ s.toLowerCase() }}</option>
          </select>
        </div>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="location">place</label>
          <select id="location" v-model="form.location">
            <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l.toLowerCase() }}</option>
          </select>
        </div>
        <div class="field">
          <label for="workMode">work mode</label>
          <select id="workMode" v-model="form.workMode">
            <option value="">open to anything</option>
            <option v-for="m in WORK_MODES" :key="m" :value="m">{{ label(m) }}</option>
          </select>
        </div>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="employmentType">employment type</label>
          <select id="employmentType" v-model="form.employmentType">
            <option value="">open to anything</option>
            <option v-for="t in EMPLOYMENT_TYPES" :key="t" :value="t">{{ label(t) }}</option>
          </select>
        </div>
        <div class="field">
          <label for="educationLevel">education</label>
          <select id="educationLevel" v-model="form.educationLevel">
            <option value="">not stated</option>
            <option v-for="l in EDUCATION_LEVELS" :key="l" :value="l">{{ label(l) }}</option>
          </select>
        </div>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="years">years of experience</label>
          <input id="years" v-model.number="form.years" type="number" min="0" max="50" />
        </div>
        <div class="field">
          <label for="salaryMin">minimum salary (BWP)</label>
          <input id="salaryMin" v-model.number="form.salaryMin" type="number" min="0" placeholder="optional" />
        </div>
        <div class="field">
          <label for="salaryPeriod">salary period</label>
          <select id="salaryPeriod" v-model="form.salaryPeriod">
            <option value="">not stated</option>
            <option v-for="p in SALARY_PERIODS" :key="p" :value="p">{{ label(p) }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="skills">skills</label>
        <textarea
          id="skills"
          v-model="form.skills"
          rows="4"
          maxlength="500"
          placeholder="One per line, e.g. diesel engines, hydraulic systems, site safety"
        ></textarea>
      </div>

      <div class="field">
        <label for="about">about you</label>
        <textarea
          id="about"
          v-model="form.about"
          rows="6"
          maxlength="1000"
          placeholder="Short summary of your work history and what you want next."
        ></textarea>
      </div>

      <div class="field">
        <label for="phone">phone</label>
        <input id="phone" v-model="form.phone" autocomplete="tel" />
      </div>

      <p v-if="error" class="formerr">{{ error }}</p>
      <p v-if="saved" class="formnote">saved.</p>
      <button class="applybtn" type="submit" :disabled="busy">{{ busy ? 'saving…' : 'save profile' }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  OCCUPATIONS,
  SALARY_PERIODS,
  WORK_MODES,
} from '~~/shared/job'
import { emptyJobseeker, validateJobseeker, type JobseekerInput } from '~~/shared/jobseeker'
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const { data } = await useFetch<{ profile: JobseekerInput }>('/api/jobseeker/profile')

const label = (v: string) => v.replace(/_/g, ' ')
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))
const form = reactive<JobseekerInput>({ ...emptyJobseeker, ...(data.value?.profile ?? {}) })
const error = ref('')
const saved = ref(false)
const busy = ref(false)

async function save() {
  busy.value = true
  error.value = ''
  saved.value = false
  try {
    const payload: JobseekerInput = {
      ...form,
      years: Number(form.years) || 0,
      salaryMin: num(form.salaryMin),
    }
    const first = Object.values(validateJobseeker(payload))[0]
    if (first) throw new Error(first)
    await $fetch('/api/jobseeker/profile', { method: 'POST', body: payload })
    saved.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'could not save'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'your profile · tshono' })
</script>
