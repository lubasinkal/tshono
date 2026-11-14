<template>
  <section class="wrap">
    <p><NuxtLink to="/employers/candidates">← candidates</NuxtLink></p>

    <template v-if="candidate">
      <div class="dhead">
        <span class="chip">◉ candidate</span>
        <span class="updated">visible to employers</span>
      </div>

      <h1 class="title">{{ p?.headline || candidate.name || 'jobseeker' }}</h1>
      <p class="sub">{{ facts }}</p>

      <div class="jobgrid">
        <div class="jobmain">
          <div class="jobbody">
            <template v-if="p?.about">
              <h3>about</h3>
              <p>{{ p.about }}</p>
            </template>

            <template v-if="p?.experience.length">
              <h3>work history</h3>
              <ul>
                <li v-for="(r, i) in p.experience" :key="i">
                  <strong>{{ r.title }}</strong> · {{ r.company }}<br />
                  {{ r.startDate }} – {{ r.current ? 'present' : r.endDate }}
                  <template v-if="r.description"><br />{{ r.description }}</template>
                </li>
              </ul>
            </template>

            <template v-if="p?.education.length">
              <h3>education</h3>
              <ul>
                <li v-for="(r, i) in p.education" :key="i">
                  <strong>{{ r.qualification }}</strong> · {{ r.institution }}
                  <template v-if="r.field"> · {{ r.field }}</template>
                  <template v-if="r.year"> · {{ r.year }}</template>
                  <template v-if="r.grade"> · {{ r.grade }}</template>
                </li>
              </ul>
            </template>

            <template v-if="skills.length">
              <h3>skills</h3>
              <ul>
                <li v-for="s in skills" :key="s">{{ s }}</li>
              </ul>
            </template>

            <template v-if="p?.certifications">
              <h3>certifications &amp; licences</h3>
              <p>{{ p.certifications }}</p>
            </template>
          </div>
        </div>

        <aside class="jobside">
          <div class="sidecard">
            <h2 class="sideh">facts</h2>
            <dl class="facts">
              <div v-if="candidate.name" class="fact"><dt>name</dt><dd>{{ candidate.name }}</dd></div>
              <div v-if="p?.occupation" class="fact"><dt>occupation</dt><dd>{{ p.occupation.toLowerCase() }}</dd></div>
              <div v-if="p?.sector" class="fact"><dt>sector</dt><dd>{{ p.sector.toLowerCase() }}</dd></div>
              <div v-if="p?.location" class="fact"><dt>place</dt><dd>{{ p.location.toLowerCase() }}</dd></div>
              <div class="fact"><dt>experience</dt><dd>{{ p?.years === 0 ? 'entry level' : `${p?.years} years plus` }}</dd></div>
              <div v-if="p?.employmentType" class="fact"><dt>type</dt><dd>{{ pretty(p.employmentType) }}</dd></div>
              <div v-if="p?.workMode" class="fact"><dt>work mode</dt><dd>{{ pretty(p.workMode) }}</dd></div>
              <div v-if="p?.educationLevel" class="fact"><dt>education</dt><dd>{{ pretty(p.educationLevel) }}</dd></div>
              <div v-if="p?.languages" class="fact"><dt>languages</dt><dd>{{ p.languages }}</dd></div>
              <div v-if="p?.relocate" class="fact"><dt>relocation</dt><dd>willing</dd></div>
              <div v-if="p?.availableFrom" class="fact"><dt>available</dt><dd>{{ p.availableFrom }}</dd></div>
            </dl>
            <a v-if="p?.phone" class="applybtn" :href="`tel:${p.phone}`">call {{ p.phone }}</a>
          </div>
        </aside>
      </div>
    </template>

    <p v-else class="empty">
      candidate not found or no longer visible.
      <NuxtLink to="/employers/candidates">back to candidates</NuxtLink>
    </p>
  </section>
</template>

<script setup lang="ts">
import type { JobseekerInput } from '~~/shared/jobseeker'

interface Payload {
  name: string
  profile: JobseekerInput
}

const route = useRoute()
const { data, error } = await useFetch<Payload>(`/api/employer/candidates/${route.params.id}`)
if (error.value) {
  await navigateTo(error.value.statusCode === 404 ? '/employers/candidates' : '/login')
}

const candidate = computed<Payload | null>(() => data.value ?? null)
const p = computed(() => candidate.value?.profile ?? null)
const skills = computed(() =>
  (p.value?.skills ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
)
const facts = computed(() =>
  [candidate.value?.name, p.value?.occupation, p.value?.location].filter(Boolean).join(' · '),
)
const pretty = (v: string) => v.replace(/_/g, ' ')

useHead({ title: `${p.value?.headline || 'candidate'} · tshono` })
</script>
