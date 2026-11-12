<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers/dashboard">← your jobs</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ company profile</span>
      <span class="updated">{{ data?.org.name || '' }}</span>
    </div>

    <h1 class="title">Company details.</h1>
    <p class="sub">Shown alongside your jobs. This is your employer profile.</p>

    <form class="form" @submit.prevent="save">
      <div class="field">
        <label for="name">company name</label>
        <input id="name" v-model="form.name" required maxlength="80" />
      </div>

      <div class="field">
        <label for="website">website</label>
        <input id="website" v-model="form.website" type="url" placeholder="https://yourcompany.co.bw" />
      </div>

      <div class="field">
        <label for="about">about the company</label>
        <textarea id="about" v-model="form.about" rows="5" placeholder="A short description of what you do."></textarea>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="sector">sector</label>
          <select id="sector" v-model="form.sector">
            <option v-for="s in SECTORS" :key="s" :value="s">{{ s.toLowerCase() }}</option>
          </select>
        </div>
        <div class="field">
          <label for="location">location</label>
          <select id="location" v-model="form.location">
            <option v-for="l in LOCATIONS" :key="l" :value="l">{{ l.toLowerCase() }}</option>
          </select>
        </div>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="contactName">contact name</label>
          <input id="contactName" v-model="form.contactName" autocomplete="name" />
        </div>
        <div class="field">
          <label for="phone">phone</label>
          <input id="phone" v-model="form.phone" autocomplete="tel" />
        </div>
      </div>

      <div class="rowfields">
        <div class="field">
          <label for="email">contact email</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" />
        </div>
        <div class="field">
          <label for="address">address</label>
          <input id="address" v-model="form.address" autocomplete="street-address" placeholder="Plot 123, Industrial, Gaborone" />
        </div>
      </div>

      <p v-if="error" class="formerr">{{ error }}</p>
      <p v-if="saved" class="formnote">saved.</p>
      <button class="applybtn" type="submit" :disabled="busy">{{ busy ? 'saving…' : 'save details' }}</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'

const { data } = await useFetch<{ org: { id: string; name: string }; profile: Record<string, string | null> }>('/api/employer/profile')

const form = reactive({
  name: String(data.value?.org.name ?? ''),
  website: String(data.value?.profile.website ?? ''),
  about: String(data.value?.profile.about ?? ''),
  sector: String(data.value?.profile.sector ?? 'General'),
  location: String(data.value?.profile.location ?? 'Botswana'),
  contactName: String(data.value?.profile.contact_name ?? ''),
  phone: String(data.value?.profile.phone ?? ''),
  email: String(data.value?.profile.email ?? ''),
  address: String(data.value?.profile.address ?? ''),
})
const error = ref('')
const saved = ref(false)
const busy = ref(false)

async function save() {
  busy.value = true
  error.value = ''
  saved.value = false
  try {
    await $fetch('/api/employer/profile', {
      method: 'POST',
      body: {
        organizationId: data.value?.org.id,
        name: form.name,
        website: form.website,
        about: form.about,
        sector: form.sector,
        location: form.location,
        contactName: form.contactName,
        phone: form.phone,
        email: form.email,
        address: form.address,
      },
    })
    saved.value = true
    // Keep the header in step without a reload; other pages refetch the name.
    if (data.value) data.value.org.name = form.name
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'could not save'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'company profile · tshono' })
</script>
