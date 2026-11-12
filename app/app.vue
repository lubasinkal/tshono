<template>
  <div class="page">
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink to="/" class="brand">tshono<b>.</b></NuxtLink>
        <nav class="nav">
          <NuxtLink to="/">Search</NuxtLink>
          <NuxtLink to="/companies">Companies</NuxtLink>
          <NuxtLink to="/sectors">Sectors</NuxtLink>
          <NuxtLink to="/insights">Insights</NuxtLink>
          <NuxtLink to="/employers/jobs/new">Post a job</NuxtLink>
        </nav>
        <div class="navright">
          <button class="themebtn" type="button" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
            {{ theme === 'dark' ? '☾' : '☀' }}
          </button>
          <button class="jumpbtn" type="button" aria-label="Open command palette" @click="palette?.open()">
            <span>jump to…</span>
            <kbd>⌘K</kbd>
          </button>
          <template v-if="user">
            <NuxtLink to="/employers/dashboard" class="navauth">Dashboard</NuxtLink>
            <button class="navauth" type="button" @click="logout">Sign out</button>
          </template>
          <NuxtLink v-else to="/login" class="navauth">Sign in</NuxtLink>
        </div>
      </div>
    </header>
    <main class="shell">
      <NuxtPage />
    </main>
    <footer class="foot">
      <div class="foot-inner">
        <span>tshono. every opportunity in bw, one fast search.</span>
        <span>built in gaborone</span>
      </div>
    </footer>
    <CommandPalette ref="palette" />
    <Toaster />
  </div>
</template>

<style>
body { margin: 0; }
.themebtn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; color: var(--text); background: transparent;
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  font-family: var(--mono); font-size: 15px; line-height: 1; cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.themebtn:hover { border-color: var(--line2); background: var(--panel2); }
</style>

<script setup lang="ts">
const palette = ref<{ open: () => void } | null>(null)

const auth = useAuth()
// Read the session through the documented endpoint with the incoming cookie
// forwarded during SSR. Plain useSession did not forward it from app.vue.
const requestFetch = useRequestFetch()
const { data: session } = await useAsyncData('auth-session', () => requestFetch('/api/auth/get-session'))
const user = computed(() => (session.value as { user?: { email: string } } | null)?.user ?? null)

const theme = ref<'dark' | 'light'>('dark')
function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  theme.value = next
  document.documentElement.dataset.theme = next
  localStorage.setItem('tshono-theme', next)
}
onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
})

// Set the theme before paint so there is no flash on reload.
useHead({
  script: [
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('tshono-theme')||'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`,
    },
  ],
})

async function logout() {
  await auth.signOut()
  window.location.href = '/login'
}

useSeoMeta({
  title: 'tshono. fast botswana jobs search',
  description: 'Every opportunity in Botswana in one instant search. No accounts, no noise.',
  ogType: 'website',
  ogSiteName: 'tshono',
  ogTitle: 'tshono. find work. fast.',
  ogDescription: 'Every opportunity in Botswana in one instant search.',
  ogImage: 'https://tshono.pages.dev/og.jpg',
  twitterCard: 'summary_large_image',
  twitterTitle: 'tshono. find work. fast.',
  twitterDescription: 'Every opportunity in Botswana in one instant search.',
  twitterImage: 'https://tshono.pages.dev/og.jpg',
  themeColor: '#0a0a0a',
})
</script>
