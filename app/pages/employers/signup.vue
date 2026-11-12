<template>
  <section class="wrap">
    <p><NuxtLink to="/employers">← employer sign in</NuxtLink></p>
    <h1 class="title">Create your employer account.</h1>
    <p class="sub">One account per company. You can post up to five live jobs on the free plan.</p>

    <form class="form" @submit.prevent="signup">
      <div class="rowfields">
        <div class="field">
          <label for="name">your name</label>
          <input id="name" v-model="name" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="company">company</label>
          <input id="company" v-model="company" required placeholder="Acme Mining" />
        </div>
      </div>
      <div class="field">
        <label for="email">work email</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="password">password (10+ characters)</label>
        <input id="password" v-model="password" type="password" autocomplete="new-password" minlength="10" required />
      </div>
      <div class="rowfields">
        <div class="field">
          <label for="sector">sector</label>
          <select id="sector" v-model="sector">
            <option v-for="s in SECTORS" :key="s" :value="s">{{ s.toLowerCase() }}</option>
          </select>
        </div>
        <div class="field">
          <label for="location">place</label>
          <select id="location" v-model="location">
            <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l.toLowerCase() }}</option>
          </select>
        </div>
        <div class="field">
          <label for="website">website (https, optional)</label>
          <input id="website" v-model="website" type="url" placeholder="https://acme.co.bw" />
        </div>
      </div>
      <p v-if="error" class="formerr">{{ error }}</p>
      <button class="applybtn" type="submit" :disabled="busy">{{ busy ? 'creating account…' : 'create account' }}</button>
      <p class="formnote">Already registered? <NuxtLink to="/employers">Sign in</NuxtLink>.</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const auth = useAuth()
const name = ref('')
const company = ref('')
const email = ref('')
const password = ref('')
const website = ref('')
const sector = ref('General')
const location = ref('Gaborone')
const error = ref('')
const busy = ref(false)

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'employer'
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

async function signup() {
  busy.value = true
  error.value = ''
  try {
    const { error: signUpError } = await auth.signUp.email({
      email: email.value,
      password: password.value,
      name: name.value,
    })
    if (signUpError) throw new Error(signUpError.message || 'could not create the account')

    const { data: org, error: orgError } = await auth.organization.create({
      name: company.value,
      slug: slugify(company.value),
    })
    if (orgError || !org) throw new Error(orgError?.message || 'could not create the company')

    await $fetch('/api/employer/profile', {
      method: 'POST',
      body: {
        organizationId: org.id,
        website: website.value,
        sector: sector.value,
        location: location.value,
      },
    })
    await navigateTo('/employers/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'signup failed'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'employer signup · tshono' })
</script>
