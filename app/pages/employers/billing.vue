<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ {{ activePaid ? `${data?.org.plan} until ${untilLabel}` : 'free plan' }}</span>
      <span class="chip">{{ data?.org.featuredCredits ?? 0 }} featured credits</span>
    </div>

    <h1 class="title">Get seen first.</h1>
    <p class="sub">Free posting stays free. Pay only when you want the top of search.</p>

    <!-- Foot-in-the-door: the cheap one-off is the first ask. -->
    <div class="featuredhero">
      <div>
        <h2 class="feathtitle">featured job</h2>
        <p class="formnote">Top of search for 30 days. One payment, no subscription.</p>
      </div>
      <div class="featprice">
        <b>BWP 99</b>
        <span>was <s class="strike">P270</s> at Jobs Botswana</span>
      </div>
      <button class="applybtn" type="button" @click="buy('featured')">feature a job · BWP 99</button>
    </div>

    <!-- Plans. -->
    <div class="plans">
      <div class="plan">
        <span class="planname">monthly</span>
        <b class="price">BWP 249<span class="per">/mo</span></b>
        <span class="plandesc">unlimited jobs · 10 featured</span>
        <span class="plansave">Jobs Botswana <s class="strike">P270</s> for 5 jobs</span>
        <button class="ghostbtn" type="button" @click="buy('monthly')">subscribe</button>
      </div>

      <div class="plan plan--hot">
        <span class="planbadge">most popular</span>
        <span class="planname">3-month pass</span>
        <b class="price">BWP 549<span class="per"> · P183/mo</span></b>
        <span class="plandesc">unlimited jobs · 30 featured</span>
        <span class="plansave">save P198 vs monthly · JB <s class="strike">P607</s></span>
        <button class="applybtn" type="button" @click="buy('pass')">get the pass</button>
      </div>

      <div class="plan">
        <span class="planbadge">best value</span>
        <span class="planname">annual</span>
        <b class="price">BWP 1,099<span class="per"> · P92/mo</span></b>
        <span class="plandesc">unlimited jobs · 120 featured</span>
        <span class="plansave">save 63% · JB <s class="strike">P1,350</s></span>
        <button class="ghostbtn" type="button" @click="buy('annual')">subscribe</button>
      </div>
    </div>

    <h2 class="sect"><span>#</span> Featured top-ups.</h2>
    <div class="plans">
      <div class="plan">
        <span class="planname">single</span>
        <b class="price">BWP 99</b>
        <span class="plandesc">1 featured job · 30 days</span>
        <button class="ghostbtn" type="button" @click="buy('featured')">buy one</button>
      </div>
      <div class="plan plan--hot">
        <span class="planbadge">save 50%</span>
        <span class="planname">ten pack</span>
        <b class="price">BWP 499<span class="per"> · P50 each</span></b>
        <span class="plandesc">10 featured jobs</span>
        <button class="applybtn" type="button" @click="buy('featured-10')">buy ten</button>
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
