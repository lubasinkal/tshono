<template>
  <section class="wrap">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>
    <h1 class="title">Hire on tshono.</h1>
    <p class="sub">Post a job. It goes live in search immediately. Free while we grow.</p>

    <div v-if="!signedIn">
      <form class="form" @submit.prevent="login">
        <div class="field">
          <label for="email">work email</label>
          <input id="email" v-model="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="password">password</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="formerr">{{ error }}</p>
        <button class="applybtn" type="submit" :disabled="busy">{{ busy ? 'signing in…' : 'sign in' }}</button>
      </form>
      <p class="formnote">No employer account yet? <NuxtLink to="/employers/signup">Create one</NuxtLink>.</p>
    </div>

    <p v-else>Already signed in. <NuxtLink to="/employers/dashboard">Go to your dashboard →</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
const auth = useAuth()
const { data: session } = await auth.useSession(useFetch)
const signedIn = computed(() => Boolean(session.value?.user))

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function login() {
  busy.value = true
  error.value = ''
  const { error: err } = await auth.signIn.email({ email: email.value, password: password.value })
  busy.value = false
  if (err) {
    error.value = err.message || 'sign in failed'
    return
  }
  await navigateTo('/employers/dashboard')
}

useHead({ title: 'hire · tshono' })
</script>
