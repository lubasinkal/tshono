<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>
    <h1 class="title">Billing.</h1>
    <p class="sub">Posting stays free. Pay only to put a job at the top of search for 30 days.</p>

    <div class="dhead">
      <span class="chip">◉ {{ data?.org.featuredCredits ?? 0 }} featured credits</span>
      <span class="chip">{{ data?.org.plan || 'free' }} plan</span>
    </div>

    <div class="grid">
      <div class="stat">
        <b>BWP 99</b>
        <span>1 featured job · 30 days</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('featured')">buy one</button>
      </div>
      <div class="stat">
        <b>BWP 499</b>
        <span>10 featured jobs · save P490</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('featured-10')">buy ten</button>
      </div>
    </div>

    <p class="formnote">
      Prices in Pula; USD is charged outside Botswana. Payments and invoices are handled by Polar.
      <button class="ghostbtn" type="button" style="margin-left: 8px" @click="portal">manage billing</button>
    </p>
    <p v-if="error" class="formerr">{{ error }}</p>
    <p v-if="busy" class="formnote">opening checkout…</p>
  </section>
</template>

<script setup lang="ts">
interface Payload {
  org: { plan: string; featuredCredits: number }
}
const { data } = await useFetch<Payload>('/api/employer/jobs')
const error = ref('')
const busy = ref(false)

async function buy(slug: string) {
  busy.value = true
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/employer/checkout', {
      method: 'POST',
      body: { slug, successUrl: `${window.location.origin}/employers/dashboard?purchased=1` },
    })
    if (res?.url) window.location.href = res.url
    else throw new Error('no checkout url')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'could not open checkout'
  } finally {
    busy.value = false
  }
}

async function portal() {
  error.value = ''
  try {
    const res = await $fetch<{ url: string }>('/api/employer/portal', { method: 'POST' })
    if (res?.url) window.location.href = res.url
    else error.value = 'no billing portal available yet'
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'could not open billing portal'
  }
}

useHead({ title: 'billing · tshono' })
</script>
