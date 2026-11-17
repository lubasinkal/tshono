<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/employers">← your jobs</NuxtLink></p>

    <template v-if="!noCompany">
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

    <DangerAction
      label="delete this company"
      hint="Removes the company, its job posts and its profile, and drops those posts out of search. Your account stays, and you can start another company from this page."
      :word="form.name"
      confirm="type the company name to confirm"
      :busy="deleting"
      @confirm="deleteCompany"
    />
    <p v-if="deleteError" class="formerr">{{ deleteError }}</p>
    </template>

    <!-- Where deleting a company leaves you: an account with no employer side.
         Kept on this page so deletion is not a one-way door. -->
    <template v-else>
      <div class="dhead">
        <span class="chip">◇ no company yet</span>
      </div>
      <h1 class="title">Start a company.</h1>
      <p class="sub">A company holds your job posts. Name it, then fill in the details.</p>
      <p v-if="route.query.deleted" class="formnote">company deleted.</p>
      <form class="form" @submit.prevent="createCompany">
        <div class="field">
          <label for="newName">company name</label>
          <input id="newName" v-model="newName" required maxlength="80" placeholder="Kalahari Logistics" />
        </div>
        <p v-if="createError" class="formerr">{{ createError }}</p>
        <button class="applybtn" type="submit" :disabled="creating">
          {{ creating ? 'creating…' : 'create company' }}
        </button>
      </form>
    </template>
  </section>
</template>

<script setup lang="ts">
import { LOCATIONS, SECTORS } from '~/data/sampleJobs'
import { slugify } from '~~/shared/url'

const auth = useAuth()
const route = useRoute()

const { data, error: loadError } = await useFetch<{ org: { id: string; name: string }; profile: Record<string, string | null> }>(
  '/api/employer/profile',
)
// 401 means no session. 403 means signed in with no company — the state a
// company deletion leaves behind, so show the create form instead of bouncing.
const noCompany = computed(() => loadError.value?.statusCode === 403)
if (loadError.value && !noCompany.value) await navigateTo('/login')

const newName = ref('')
const creating = ref(false)
const createError = ref('')

async function createCompany() {
  creating.value = true
  createError.value = ''
  try {
    const name = newName.value.trim()
    // Same two calls as sign-up: the auth client makes the org and its owner
    // membership, the API adds the profile row.
    const { data: org, error } = await auth.organization.create({ name, slug: slugify(name) })
    if (error || !org) throw new Error(error?.message || 'could not create the company')
    await $fetch('/api/employer/profile', { method: 'POST', body: { organizationId: org.id, name } })
    window.location.href = '/employers'
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || e?.message || 'could not create the company'
    creating.value = false
  }
}

const deleting = ref(false)
const deleteError = ref('')

async function deleteCompany() {
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch('/api/employer/company', { method: 'DELETE' })
    // Reload: role, header and dashboard all change with the company gone.
    window.location.href = '/employers/company?deleted=1'
  } catch (e: any) {
    deleteError.value = e?.data?.statusMessage || e?.message || 'could not delete the company'
    deleting.value = false
  }
}

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
