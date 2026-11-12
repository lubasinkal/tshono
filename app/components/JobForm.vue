<template>
  <form class="form" @submit.prevent="submit">
    <div class="field">
      <label for="title">job title</label>
      <input id="title" v-model="form.title" maxlength="120" required placeholder="Underground Fitter" />
    </div>

    <div class="rowfields">
      <div class="field">
        <label for="sector">sector</label>
        <select id="sector" v-model="form.sector">
          <option v-for="s in SECTORS" :key="s" :value="s">{{ s.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="location">place</label>
        <select id="location" v-model="form.location">
          <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l.toLowerCase() }}</option>
        </select>
      </div>
      <div class="field">
        <label for="years">years required</label>
        <input id="years" v-model.number="form.minYears" type="number" min="0" max="40" />
      </div>
      <div class="field">
        <label for="closing">closing date</label>
        <input id="closing" v-model="form.closing" type="date" />
      </div>
    </div>

    <div class="field">
      <label for="occupation">occupation group (ISCO-08)</label>
      <select id="occupation" v-model="form.occupation" required>
        <option value="" disabled>pick the closest group</option>
        <option v-for="o in OCCUPATIONS" :key="o" :value="o">{{ o.toLowerCase() }}</option>
      </select>
    </div>

    <div class="rowfields">
      <div class="field">
        <label for="employmentType">employment type</label>
        <select id="employmentType" v-model="form.employmentType">
          <option v-for="t in EMPLOYMENT_TYPES" :key="t" :value="t">{{ label(t) }}</option>
        </select>
      </div>
      <div class="field">
        <label for="workMode">work mode</label>
        <select id="workMode" v-model="form.workMode">
          <option v-for="m in WORK_MODES" :key="m" :value="m">{{ label(m) }}</option>
        </select>
      </div>
      <div class="field">
        <label for="vacancies">positions</label>
        <input id="vacancies" v-model.number="form.vacancies" type="number" min="1" max="1000" />
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
        <label for="salaryMin">salary min (BWP)</label>
        <input id="salaryMin" v-model.number="form.salaryMin" type="number" min="0" placeholder="optional" />
      </div>
      <div class="field">
        <label for="salaryMax">salary max (BWP)</label>
        <input id="salaryMax" v-model.number="form.salaryMax" type="number" min="0" placeholder="optional" />
      </div>
      <div class="field">
        <label for="salaryPeriod">salary period</label>
        <select id="salaryPeriod" v-model="form.salaryPeriod">
          <option value="">not stated</option>
          <option v-for="p in SALARY_PERIODS" :key="p" :value="p">{{ label(p) }}</option>
        </select>
      </div>
      <div class="field">
        <label for="contractMonths">contract months</label>
        <input id="contractMonths" v-model.number="form.contractMonths" type="number" min="0" max="120" placeholder="optional" />
      </div>
    </div>

    <div class="field">
      <label for="apply">apply link (https)</label>
      <input id="apply" v-model="form.applyUrl" type="url" required placeholder="https://yourcompany.co.bw/careers/role" />
    </div>

    <div class="field">
      <label for="blurb">one-line summary</label>
      <input id="blurb" v-model="form.blurb" maxlength="400" placeholder="What the job is, in one sentence." />
    </div>

    <div class="field">
      <label for="content">full advert</label>
      <textarea id="content" v-model="form.content" rows="12" placeholder="Requirements, duties, how to apply." />
    </div>

    <div class="field">
      <label for="responsibilities">key responsibilities</label>
      <textarea id="responsibilities" v-model="form.responsibilities" rows="6" placeholder="One per line, e.g. Maintain underground equipment…" />
    </div>

    <div class="field">
      <label for="requirements">requirements</label>
      <textarea id="requirements" v-model="form.requirements" rows="6" placeholder="One per line, e.g. 3+ years experience…" />
    </div>

    <p v-if="localError || error" class="formerr">{{ localError || error }}</p>
    <button class="applybtn" type="submit" :disabled="saving">{{ saving ? 'saving…' : submitLabel }}</button>
  </form>
</template>

<script setup lang="ts">
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  OCCUPATIONS,
  SALARY_PERIODS,
  WORK_MODES,
  validateJob,
  type JobInput,
} from '~~/shared/job'
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const props = withDefaults(
  defineProps<{ initial?: Partial<JobInput>; submitLabel?: string; saving?: boolean; error?: string }>(),
  { submitLabel: 'publish job', saving: false, error: '' },
)
const emit = defineEmits<{ submit: [JobInput] }>()

const label = (v: string) => v.replace(/_/g, ' ')
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))

const form = reactive<JobInput>({
  title: '',
  sector: 'General',
  location: 'Gaborone',
  occupation: '',
  employmentType: 'full_time',
  vacancies: 1,
  workMode: 'on_site',
  educationLevel: '',
  minYears: 0,
  salaryMin: null,
  salaryMax: null,
  salaryPeriod: '',
  contractMonths: null,
  closing: '',
  applyUrl: '',
  blurb: '',
  content: '',
  responsibilities: '',
  requirements: '',
  ...props.initial,
})
const localError = ref('')

function submit() {
  const payload: JobInput = {
    ...form,
    vacancies: Number(form.vacancies) || 1,
    salaryMin: num(form.salaryMin),
    salaryMax: num(form.salaryMax),
    contractMonths: num(form.contractMonths),
  }
  const errors = validateJob(payload)
  const first = Object.values(errors)[0]
  if (first) {
    localError.value = first
    return
  }
  localError.value = ''
  emit('submit', payload)
}
</script>
