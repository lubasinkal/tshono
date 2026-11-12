<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>
    <template v-if="job">
      <h1 class="title">Edit job.</h1>
      <p class="sub">Changes re-index the job in search.</p>
      <JobForm
        :initial="{
          title: job.title,
          sector: job.sector,
          location: job.location,
          occupation: job.occupation || '',
          employmentType: job.employment_type || 'full_time',
          vacancies: job.vacancies ?? 1,
          workMode: job.work_mode || 'on_site',
          educationLevel: job.education_level || '',
          salaryMin: job.salary_min,
          salaryMax: job.salary_max,
          salaryPeriod: job.salary_period || '',
          contractMonths: job.contract_months,
          minYears: job.min_years,
          closing: job.closing || '',
          applyUrl: job.apply_url,
          blurb: job.blurb,
          content: job.content,
        }"
        submit-label="save changes"
        :saving="saving"
        :error="error"
        @submit="save"
      />
    </template>
    <p v-else class="empty">job not found. <NuxtLink to="/employers/dashboard">back to your jobs</NuxtLink>.</p>
  </section>
</template>

<script setup lang="ts">
import type { JobInput } from '~~/shared/job'

interface Job {
  id: string
  title: string
  sector: string
  location: string
  occupation: string | null
  employment_type: string | null
  vacancies: number
  work_mode: string | null
  education_level: string | null
  salary_min: number | null
  salary_max: number | null
  salary_period: string | null
  contract_months: number | null
  min_years: number
  closing: string | null
  apply_url: string
  blurb: string
  content: string
}

const route = useRoute()
const { data, error: loadError } = await useFetch<{ jobs: Job[] }>('/api/employer/jobs')
if (loadError.value) await navigateTo('/login')
const job = computed(() => data.value?.jobs.find((j) => j.id === String(route.params.id)))

const saving = ref(false)
const error = ref('')

async function save(input: JobInput) {
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/employer/jobs/${route.params.id}`, { method: 'PATCH', body: input })
    await navigateTo('/employers/dashboard')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'could not save'
  } finally {
    saving.value = false
  }
}

useHead({ title: 'edit job · tshono' })
</script>
