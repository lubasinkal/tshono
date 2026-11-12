<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← back to search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">{{ meta.chip }}</span>
      <span class="updated">{{ meta.sub }}</span>
    </div>

    <h1 class="title">{{ meta.title }}</h1>
    <p class="sub">{{ meta.sub2 }}</p>

    <form class="form auth" @submit.prevent="submit">
      <div v-if="mode === 'register'" class="field">
        <label for="role">i am</label>
        <select id="role" v-model="role">
          <option value="employer">hiring — post jobs</option>
          <option value="jobseeker">looking for work</option>
        </select>
      </div>

      <div v-if="mode === 'register'" class="rowfields">
        <div class="field">
          <label for="name">your name</label>
          <input id="name" v-model="name" autocomplete="name" required />
        </div>
        <div v-if="role === 'employer'" class="field">
          <label for="company">company</label>
          <input id="company" v-model="company" required placeholder="Acme Mining" />
        </div>
      </div>

      <div v-if="['signin', 'register', 'otp-send', 'forgot-send'].includes(mode)" class="field">
        <label for="email">email</label>
        <input id="email" v-model="email" type="email" autocomplete="email" required />
      </div>

      <div v-if="['signin', 'register', 'forgot-reset'].includes(mode)" class="field">
        <label for="password">{{ mode === 'forgot-reset' ? 'new password' : 'password' }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :autocomplete="mode === 'signin' ? 'current-password' : 'new-password'"
          :minlength="mode === 'register' ? 10 : 8"
          required
        />
      </div>

      <div v-if="mode === 'forgot-reset'" class="field">
        <label for="confirm">confirm password</label>
        <input id="confirm" v-model="confirm" type="password" autocomplete="new-password" required />
      </div>

      <div v-if="['otp-verify', 'forgot-verify'].includes(mode)" class="field">
        <label for="otp">6-digit code · sent to {{ email }}</label>
        <input
          id="otp"
          v-model="otp"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          pattern="[0-9]{6}"
          placeholder="000000"
          required
        />
      </div>

      <p v-if="error" class="formerr">{{ error }}</p>
      <button class="applybtn" type="submit" :disabled="busy">
        {{ busy ? 'working…' : submitLabel }}
      </button>
    </form>

    <p class="formnote">
      <template v-if="mode === 'signin'">
        <a href="#" @click.prevent="go('otp-send')">Use a code instead</a> ·
        <a href="#" @click.prevent="go('forgot-send')">Forgot password?</a> ·
        No account? <a href="#" @click.prevent="go('register')">Create one</a>.
      </template>
      <template v-else-if="mode === 'register'">
        Already registered? <a href="#" @click.prevent="go('signin')">Sign in</a>.
      </template>
      <template v-else-if="mode === 'otp-send'">
        <a href="#" @click.prevent="go('signin')">Use password instead</a>.
      </template>
      <template v-else-if="mode === 'otp-verify'">
        <a v-if="resendCooldown > 0" href="#" @click.prevent>resend in {{ resendCooldown }}s</a>
        <a v-else href="#" @click.prevent="resend">resend code</a> ·
        <a href="#" @click.prevent="go('signin')">use password instead</a>.
      </template>
      <template v-else-if="mode === 'forgot-send'">
        <a href="#" @click.prevent="go('signin')">Back to sign in</a>.
      </template>
      <template v-else-if="mode === 'forgot-verify'">
        <a v-if="resendCooldown > 0" href="#" @click.prevent>resend in {{ resendCooldown }}s</a>
        <a v-else href="#" @click.prevent="resend">resend code</a> ·
        <a href="#" @click.prevent="go('signin')">back to sign in</a>.
      </template>
      <template v-else-if="mode === 'forgot-reset'">
        <a href="#" @click.prevent="go('signin')">Back to sign in</a>.
      </template>
    </p>
  </section>
</template>

<script setup lang="ts">
type Mode = 'signin' | 'register' | 'otp-send' | 'otp-verify' | 'forgot-send' | 'forgot-verify' | 'forgot-reset'

const auth = useAuth()
const route = useRoute()
const mode = ref<Mode>(route.query.mode === 'register' ? 'register' : 'signin')

const role = ref<'employer' | 'jobseeker'>('employer')
const name = ref('')
const company = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const otp = ref('')
const error = ref('')
const busy = ref(false)
const verifiedOtp = ref('')
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

onBeforeUnmount(() => {
  if (resendTimer) clearInterval(resendTimer)
})

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'employer'
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

const meta = computed(() => {
  switch (mode.value) {
    case 'signin':
      return { chip: '◉ sign in', sub: 'welcome back', title: 'Sign in.', sub2: 'Employers and jobseekers use the same sign-in.' }
    case 'register':
      return {
        chip: '◉ create account',
        sub: role.value === 'employer' ? 'post jobs on tshono' : 'find work on tshono',
        title: 'Create account.',
        sub2:
          role.value === 'employer'
            ? 'One account per company. Free plan: five live jobs.'
            : 'One account per person. Your profile is private and used to match you with jobs.',
      }
    case 'otp-send':
      return { chip: '◉ sign in with code', sub: 'no password needed', title: 'Sign in with code.', sub2: "We'll email you a 6-digit code." }
    case 'otp-verify':
      return { chip: '◉ enter code', sub: `sent to ${email.value}`, title: 'Enter code.', sub2: '' }
    case 'forgot-send':
      return { chip: '◉ reset password', sub: "we'll email a code", title: 'Reset password.', sub2: "We'll email you a reset code." }
    case 'forgot-verify':
      return { chip: '◉ enter reset code', sub: `sent to ${email.value}`, title: 'Enter reset code.', sub2: '' }
    case 'forgot-reset':
      return { chip: '◉ new password', sub: '', title: 'New password.', sub2: 'Choose a new password.' }
  }
})

const submitLabel = computed(() => {
  switch (mode.value) {
    case 'signin': return 'sign in'
    case 'register': return 'create account'
    case 'otp-send': return 'send code'
    case 'otp-verify': return 'verify code'
    case 'forgot-send': return 'send reset code'
    case 'forgot-verify': return 'verify code'
    case 'forgot-reset': return 'reset password'
  }
})

function go(m: Mode) {
  mode.value = m
  error.value = ''
  otp.value = ''
  if (m === 'signin' || m === 'register') {
    password.value = ''
    confirm.value = ''
  }
}

function startResendCooldown() {
  resendCooldown.value = 60
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

async function sendOtp(type: 'sign-in' | 'forget-password') {
  const { error: err } = await auth.emailOtp.sendVerificationOtp({ email: email.value, type })
  if (err) throw new Error(err.message || 'failed to send code')
  startResendCooldown()
  mode.value = type === 'forget-password' ? 'forgot-verify' : 'otp-verify'
}

async function resend() {
  if (resendCooldown.value > 0 || busy.value) return
  busy.value = true
  error.value = ''
  try {
    await sendOtp(mode.value === 'forgot-verify' ? 'forget-password' : 'sign-in')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'failed to send code'
  } finally {
    busy.value = false
  }
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
      window.location.href = '/dashboard'
    } else if (mode.value === 'register') {
      const { error: upErr } = await auth.signUp.email({
        email: email.value,
        password: password.value,
        name: name.value,
      })
      if (upErr) throw new Error(upErr.message || 'could not create the account')

      if (role.value === 'employer') {
        const { data: org, error: orgErr } = await auth.organization.create({
          name: company.value,
          slug: slugify(company.value),
        })
        if (orgErr || !org) throw new Error(orgErr?.message || 'could not create the company')
        await $fetch('/api/employer/profile', { method: 'POST', body: { organizationId: org.id } })
      } else {
        // Empty profile marks the account as a jobseeker; details are filled in
        // on /jobseekers/profile afterwards.
        await $fetch('/api/jobseeker/profile', { method: 'POST', body: {} })
      }
      window.location.href = '/dashboard'
    } else if (mode.value === 'otp-send') {
      await sendOtp('sign-in')
    } else if (mode.value === 'otp-verify') {
      const { error: err } = await auth.signIn.emailOtp({ email: email.value, otp: otp.value })
      if (err) throw new Error(err.message || 'invalid code')
      window.location.href = '/dashboard'
    } else if (mode.value === 'forgot-send') {
      await sendOtp('forget-password')
    } else if (mode.value === 'forgot-verify') {
      const { error: err } = await auth.emailOtp.checkVerificationOtp({
        email: email.value,
        type: 'forget-password',
        otp: otp.value,
      })
      if (err) throw new Error(err.message || 'invalid code')
      verifiedOtp.value = otp.value
      mode.value = 'forgot-reset'
    } else if (mode.value === 'forgot-reset') {
      if (password.value !== confirm.value) throw new Error('passwords do not match')
      const { error: err } = await auth.emailOtp.resetPassword({
        email: email.value,
        otp: verifiedOtp.value,
        password: password.value,
      })
      if (err) throw new Error(err.message || 'reset failed')
      password.value = ''
      confirm.value = ''
      go('signin')
      error.value = ''
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'something went wrong'
  } finally {
    busy.value = false
  }
}

useHead({ title: 'sign in · tshono' })
</script>
