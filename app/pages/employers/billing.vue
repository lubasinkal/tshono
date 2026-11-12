<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>
    <h1 class="title">Plans.</h1>
    <p class="sub">
      Free posting stays free. Paid plans add unlimited live jobs and featured credits —
      cheaper than Jobs Botswana, with more featured slots.
    </p>

    <div class="dhead">
      <span class="chip">◉ {{ activePaid ? `${data?.org.plan} until ${untilLabel}` : 'free plan' }}</span>
      <span class="chip">{{ data?.org.featuredCredits ?? 0 }} featured credits</span>
    </div>

    <div class="grid">
      <div class="stat">
        <b>BWP 249</b>
        <span>per month</span>
        <span class="formnote">unlimited jobs · 10 featured</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('monthly')">subscribe</button>
      </div>
      <div class="stat">
        <b>BWP 549</b>
        <span>3 months, once off</span>
        <span class="formnote">unlimited jobs · 30 featured</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('pass')">buy pass</button>
      </div>
      <div class="stat">
        <b>BWP 1,099</b>
        <span>per year</span>
        <span class="formnote">unlimited jobs · 120 featured</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('annual')">subscribe</button>
      </div>
    </div>

    <h2 class="sect"><span>#</span> Featured top-ups.</h2>
    <div class="grid">
      <div class="stat">
        <b>BWP 99</b>
        <span>1 featured job · 30 days</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('featured')">buy one</button>
      </div>
      <div class="stat">
        <b>BWP 499</b>
        <span>10 featured jobs</span>
        <button class="ghostbtn" type="button" style="margin-top: 10px" @click="buy('featured-10')">buy ten</button>
      </div>
    </div>

    <p class="formnote">
      Pula prices; USD is charged outside Botswana. Payments, invoices and cancellations are handled by Polar.
      <button class="ghostbtn" type="button" style="margin-left: 8px" @click="portal">manage billing</button>
    </p>
    <p v-if="error" class="formerr">{{ error }}</p>
    <p v-if="busy" class="formnote">opening checkout…</p>
  </section>
</template>

<script setup lang="ts">
interface Payload {
  org: { plan: string; planUntil: string | null; featuredCredits: number }
}
const { data } = await useFetch<Payload>('/api/employer/jobs')
const error = ref('')
const busy = ref(false)

const activePaid = computed(() => Boolean(data.value?.org.planUntil && new Date(data.value.org.planUntil) > new Date()))
const untilLabel = computed(() =>
  data.value?.org.planUntil ? new Date(data.value.org.planUntil).toISOString().slice(0, 10) : '',
)

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
    error.value = e?.data?.statusMessage || e?.data?.message || e?.message || 'could not open checkout'
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
    error.value = e?.data?.statusMessage || e?.message || 'could not open billing portal'
  }
}

useHead({ title: 'plans · tshono' })
</script>
