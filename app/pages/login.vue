<template>
  <section class="wrap">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">{{ mode === 'signin' ? '◉ sign in' : '◉ create account' }}</span>
      <span class="updated">{{ mode === 'signin' ? 'welcome back' : 'post jobs on tshono' }}</span>
    </div>

    <h1 class="title">{{ mode === 'signin' ? 'Sign in.' : 'Create account.' }}</h1>
    <p class="sub">
      {{ mode === 'signin'
        ? 'Employers and paid accounts use the same sign-in.'
        : 'One account per company. Free plan: five live jobs.' }}
    </p>

    <form class="form" @submit.prevent="submit">
      <div v-if="mode === 'register'" class="rowfields">
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
        <label for="email">email</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="password">password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
          :minlength="mode === 'register' ? 10 : undefined"
          required
        />
      </div>

      <p v-if="error" class="formerr">{{ error }}</p>
      <button class="applybtn" type="submit" :disabled="busy">
        {{ busy ? 'working…' : mode === 'signin' ? 'sign in' : 'create account' }}
      </button>
    </form>

    <p class="formnote">
      <template v-if="mode === 'signin'">
        No account? <a href="/login?mode=register">Create one</a>.
      </template>
      <template v-else>
        Already registered? <a href="/login">Sign in</a>.
      </template>
    </p>
  </section>
</template>

<script setup lang="ts">
const auth = useAuth()
const route = useRoute()
const mode = ref<'signin' | 'register'>(route.query.mode === 'register' ? 'register' : 'signin')

const name = ref('')
const company = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'employer'
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

// Full-page navigation after auth so the session cookie is read on the next
// request (same approach as the fees app).
async function submit() {
  busy.value = true
  error.value = ''
  try {
    if (mode.value === 'signin') {
      const { error: err } = await auth.signIn.email({ email: email.value, password: password.value })
      if (err) throw new Error(err.message || 'sign in failed')
    } else {
      const { error: upErr } = await auth.signUp.email({
        email: email.value,
        password: password.value,
        name: name.value,
      })
      if (upErr) throw new Error(upErr.message || 'could not create the account')

      const { data: org, error: orgErr } = await auth.organization.create({
        name: company.value,
        slug: slugify(company.value),
      })
      if (orgErr || !org) throw new Error(orgErr?.message || 'could not create the company')

      await $fetch('/api/employer/profile', { method: 'POST', body: { organizationId: org.id } })
    }
    window.location.href = '/employers/dashboard'
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'something went wrong'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'sign in · tshono' })
</script>
