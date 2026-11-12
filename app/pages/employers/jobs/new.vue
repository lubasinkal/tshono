<template>
  <section class="wrap">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>
    <h1 class="title">Post a job.</h1>
    <p class="sub">It goes live in search as soon as you publish.</p>

    <JobForm :saving="saving" :error="error" @submit="publish" />
  </section>
</template>

<script setup lang="ts">
import type { JobInput } from '~~/shared/job'

const saving = ref(false)
const error = ref('')

async function publish(input: JobInput) {
  saving.value = true
  error.value = ''
  try {
    const res = await $fetch<{ indexed: boolean }>('/api/employer/jobs', { method: 'POST', body: input })
    if (!res.indexed) error.value = 'saved, but the search index rejected it. Check TYPESENSE_ADMIN_KEY on the server.'
    else await navigateTo('/employers/dashboard')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'could not publish the job'
  } finally {
    saving.value = false
  }
}

useHead({ title: 'post a job · tshono' })
</script>
