<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/jobseekers">← your dashboard</NuxtLink></p>

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

      <label class="check">
        <input v-model="form.visible" type="checkbox" />
        <span>visible to employers — they can find this profile, including your phone, when they search candidates</span>
      </label>

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

      <div class="rowfields">
        <div class="field">
          <label for="availableFrom">available from</label>
          <input id="availableFrom" v-model="form.availableFrom" type="date" />
        </div>
        <div class="field">
          <label>relocation</label>
          <label class="check"><input v-model="form.relocate" type="checkbox" /><span>willing to relocate</span></label>
        </div>
      </div>

      <div class="field">
        <label for="languages">languages</label>
        <input id="languages" v-model="form.languages" maxlength="300" placeholder="e.g. Setswana, English" />
      </div>

      <div class="field">
        <label for="certifications">certifications &licences</label>
        <textarea
          id="certifications"
          v-model="form.certifications"
          rows="3"
          maxlength="500"
          placeholder="One per line, e.g. Code 10 driver's licence, First aid level 2"
        ></textarea>
      </div>

      <div class="field">
        <label for="phone">phone</label>
        <input id="phone" v-model="form.phone" autocomplete="tel" />
      </div>

      <h2 class="sect"><span>#</span> work history</h2>

      <div v-for="(r, i) in form.experience" :key="`exp-${i}`" class="cvrow">
        <div class="rowfields">
          <div class="field">
            <label :for="`exp-title-${i}`">job title</label>
            <input :id="`exp-title-${i}`" v-model="r.title" maxlength="120" />
          </div>
          <div class="field">
            <label :for="`exp-company-${i}`">company</label>
            <input :id="`exp-company-${i}`" v-model="r.company" maxlength="120" />
          </div>
          <div class="field">
            <label :for="`exp-start-${i}`">started</label>
            <input :id="`exp-start-${i}`" v-model="r.startDate" type="date" />
          </div>
          <div class="field">
            <label :for="`exp-end-${i}`">ended</label>
            <input :id="`exp-end-${i}`" v-model="r.endDate" type="date" :disabled="r.current" />
          </div>
        </div>
        <label class="check"><input v-model="r.current" type="checkbox" /><span>still there</span></label>
        <div class="field">
          <label :for="`exp-desc-${i}`">what you did</label>
          <textarea :id="`exp-desc-${i}`" v-model="r.description" rows="3" maxlength="1000" />
        </div>
        <div class="cvrow-actions">
          <button class="ghostbtn" type="button" @click="form.experience.splice(i, 1)">remove</button>
        </div>
      </div>

      <button class="ghostbtn" type="button" @click="form.experience.push({ ...emptyExperience })">
        + add a role
      </button>

      <h2 class="sect"><span>#</span> education</h2>

      <div v-for="(r, i) in form.education" :key="`edu-${i}`" class="cvrow">
        <div class="rowfields">
          <div class="field">
            <label :for="`edu-inst-${i}`">institution</label>
            <input :id="`edu-inst-${i}`" v-model="r.institution" maxlength="120" />
          </div>
          <div class="field">
            <label :for="`edu-qual-${i}`">qualification</label>
            <input :id="`edu-qual-${i}`" v-model="r.qualification" maxlength="120" />
          </div>
          <div class="field">
            <label :for="`edu-field-${i}`">field</label>
            <input :id="`edu-field-${i}`" v-model="r.field" maxlength="120" placeholder="optional" />
          </div>
          <div class="field">
            <label :for="`edu-year-${i}`">year</label>
            <input :id="`edu-year-${i}`" v-model.number="r.year" type="number" min="1950" max="2100" placeholder="optional" />
          </div>
        </div>
        <div class="cvrow-actions">
          <button class="ghostbtn" type="button" @click="form.education.splice(i, 1)">remove</button>
        </div>
      </div>

      <button class="ghostbtn" type="button" @click="form.education.push({ ...emptyEducation })">
        + add a qualification
      </button>

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
import {
  emptyEducation,
  emptyExperience,
  emptyJobseeker,
  parseJobseeker,
  type JobseekerInput,
} from '~~/shared/jobseeker'
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const { data, error: loadError } = await useFetch<{ profile: JobseekerInput }>(
  '/api/jobseeker/profile',
)
if (loadError.value) await navigateTo('/login')

const label = (v: string) => v.replace(/_/g, ' ')
const form = reactive<JobseekerInput>({
  ...emptyJobseeker,
  ...(data.value?.profile ?? {}),
  // Copy the lists so editing never mutates the shared defaults.
  experience: (data.value?.profile.experience ?? []).map((r) => ({ ...r })),
  education: (data.value?.profile.education ?? []).map((r) => ({ ...r })),
})
const error = ref('')
const saved = ref(false)
const busy = ref(false)

async function save() {
  busy.value = true
  error.value = ''
  saved.value = false
  try {
    const parsed = parseJobseeker(form)
    if ('error' in parsed) throw new Error(parsed.error)
    await $fetch('/api/jobseeker/profile', { method: 'POST', body: parsed.data })
    saved.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'could not save'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'your profile · tshono' })
</script>

<style scoped>
.cvrow {
  display: grid;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 14px;
}
.cvrow-actions { display: flex; justify-content: flex-end; }
</style>
