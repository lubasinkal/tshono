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

    <p v-if="localError || error" class="formerr">{{ localError || error }}</p>
    <button class="applybtn" type="submit" :disabled="saving">{{ saving ? 'saving…' : submitLabel }}</button>
  </form>
</template>

<script setup lang="ts">
import { validateJob, type JobInput } from '~~/shared/job'
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const props = withDefaults(
  defineProps<{ initial?: Partial<JobInput>; submitLabel?: string; saving?: boolean; error?: string }>(),
  { submitLabel: 'publish job', saving: false, error: '' },
)
const emit = defineEmits<{ submit: [JobInput] }>()

const form = reactive<JobInput>({
  title: '',
  sector: 'General',
  location: 'Gaborone',
  minYears: 0,
  closing: '',
  applyUrl: '',
  blurb: '',
  content: '',
  ...props.initial,
})
const localError = ref('')

function submit() {
  const errors = validateJob(form)
  const first = Object.values(errors)[0]
  if (first) {
    localError.value = first
    return
  }
  localError.value = ''
  emit('submit', { ...form })
}
</script>
