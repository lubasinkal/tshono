<template>
  <section class="wrap narrow">
    <p><NuxtLink to="/">← search</NuxtLink></p>

    <div class="dhead">
      <span class="chip">◉ account</span>
      <span class="updated">{{ email }}</span>
    </div>

    <h1 class="title">Account.</h1>
    <p class="sub">
      Your name and password. Company details, billing and the jobseeker profile live in their own sections.
    </p>

    <form class="form auth" @submit.prevent="saveName">
      <div class="field">
        <label for="name">name</label>
        <input id="name" v-model="name" required maxlength="80" autocomplete="name" />
      </div>
      <p v-if="nameError" class="formerr">{{ nameError }}</p>
      <p v-if="nameSaved" class="formnote">saved.</p>
      <button class="applybtn" type="submit" :disabled="nameBusy">{{ nameBusy ? 'saving…' : 'save name' }}</button>
    </form>

    <h2 class="sect"><span>#</span> password</h2>

    <form class="form auth" @submit.prevent="savePassword">
      <div class="field">
        <label for="current">current password</label>
        <input id="current" v-model="current" type="password" autocomplete="current-password" required />
      </div>
      <div class="field">
        <label for="next">new password</label>
        <input id="next" v-model="next" type="password" autocomplete="new-password" minlength="10" required />
      </div>
      <div class="field">
        <label for="confirm">confirm new password</label>
        <input id="confirm" v-model="confirm" type="password" autocomplete="new-password" required />
      </div>
      <p v-if="passwordError" class="formerr">{{ passwordError }}</p>
      <p v-if="passwordSaved" class="formnote">password changed.</p>
      <button class="applybtn" type="submit" :disabled="passwordBusy">
        {{ passwordBusy ? 'saving…' : 'change password' }}
      </button>
    </form>

    <h2 class="sect"><span>#</span> sections</h2>
    <ul class="todo">
      <li><NuxtLink to="/dashboard">dashboard</NuxtLink></li>
      <li v-if="role === 'employer'"><NuxtLink to="/employers/company">company</NuxtLink></li>
      <li v-if="role === 'employer'"><NuxtLink to="/employers/billing">billing</NuxtLink></li>
      <li v-if="role === 'jobseeker'"><NuxtLink to="/jobseekers/profile">your profile</NuxtLink></li>
      <li><button type="button" @click="logout">sign out</button></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
const auth = useAuth()
const requestFetch = useRequestFetch()

const { data: session } = await useAsyncData('auth-session', () => requestFetch('/api/auth/get-session'))

const email = computed(() => (session.value as { user?: { email: string } } | null)?.user?.email ?? '')
if (!email.value) await navigateTo('/login')

const { data: account } = await useFetch<{ role: string }>('/api/me')
const role = computed(() => account.value?.role ?? '')

const name = ref((session.value as { user?: { name?: string } } | null)?.user?.name ?? '')
const nameError = ref('')
const nameSaved = ref(false)
const nameBusy = ref(false)

const current = ref('')
const next = ref('')
const confirm = ref('')
const passwordError = ref('')
const passwordSaved = ref(false)
const passwordBusy = ref(false)

async function saveName() {
  nameBusy.value = true
  nameError.value = ''
  nameSaved.value = false
  try {
    const { error } = await auth.updateUser({ name: name.value.trim() })
    if (error) throw new Error(error.message || 'could not save your name')
    nameSaved.value = true
  } catch (e: any) {
    nameError.value = e?.message || 'could not save your name'
  } finally {
    nameBusy.value = false
  }
}

async function savePassword() {
  passwordBusy.value = true
  passwordError.value = ''
  passwordSaved.value = false
  try {
    if (next.value !== confirm.value) throw new Error('passwords do not match')
    const { error } = await auth.changePassword({
      currentPassword: current.value,
      newPassword: next.value,
      revokeOtherSessions: true,
    })
    if (error) throw new Error(error.message || 'could not change the password')
    current.value = ''
    next.value = ''
    confirm.value = ''
    passwordSaved.value = true
  } catch (e: any) {
    passwordError.value = e?.message || 'could not change the password'
  } finally {
    passwordBusy.value = false
  }
}

async function logout() {
  await auth.signOut()
  window.location.href = '/login'
}

useHead({ title: 'account · tshono' })
</script>

<style scoped>
.todo { list-style: none; margin: 0; padding: 0; display: grid; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
.todo a, .todo button {
  display: flex; width: 100%; align-items: center; gap: 10px; padding: 11px 16px;
  border-bottom: 1px solid var(--line); color: var(--text); text-decoration: none;
  font-family: var(--mono); font-size: 13px; text-align: left; cursor: pointer;
}
.todo li:last-child a, .todo li:last-child button { border-bottom: none; }
.todo a::before, .todo button::before { content: '→'; color: var(--faint); font-size: 12px; }
.todo a:hover, .todo button:hover { background: var(--panel2); color: var(--accent); }
.todo li:last-child button:hover { color: var(--warn); }
</style>
