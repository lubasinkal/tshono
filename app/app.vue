<template>
  <div class="page">
    <AsciiBackdrop />
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
          <div v-if="user" ref="accountRef" class="account">
            <button
              class="navauth"
              type="button"
              :aria-expanded="accountOpen"
              @click="accountOpen = !accountOpen"
            >
              Account
            </button>
            <!-- A disclosure list, not an ARIA menu: every item is a plain link,
                 so Tab/Enter is the whole contract and nothing promises arrows. -->
            <ul v-if="accountOpen" class="accountmenu">
              <li><NuxtLink to="/dashboard" @click="accountOpen = false">dashboard</NuxtLink></li>
              <li v-if="role === 'jobseeker'">
                <NuxtLink to="/jobseekers/profile" @click="accountOpen = false">your profile</NuxtLink>
              </li>
              <li v-if="role === 'employer'">
                <NuxtLink to="/employers/company" @click="accountOpen = false">company</NuxtLink>
              </li>
              <li v-if="role === 'employer'">
                <NuxtLink to="/employers/billing" @click="accountOpen = false">billing</NuxtLink>
              </li>
              <li><NuxtLink to="/account" @click="accountOpen = false">account</NuxtLink></li>
              <li><button type="button" @click="logout">sign out</button></li>
            </ul>
          </div>
          <NuxtLink v-else to="/login" class="navauth">Sign in</NuxtLink>
        </div>
      </div>
    </header>
    <main class="shell">
      <NuxtPage />
    </main>
    <footer class="foot">
      <div class="foot-inner">
        <div class="foot-brand">
          <NuxtLink to="/" class="brand">tshono<b>.</b></NuxtLink>
          <p>every opportunity in bw, one fast search.</p>
          <p>built in gaborone</p>
        </div>
        <nav class="footcol" aria-label="Explore">
          <h2>explore</h2>
          <NuxtLink to="/">search jobs</NuxtLink>
          <NuxtLink to="/companies">companies</NuxtLink>
          <NuxtLink to="/sectors">sectors</NuxtLink>
          <NuxtLink to="/insights">hiring insights</NuxtLink>
        </nav>
        <nav class="footcol" aria-label="Employers">
          <h2>employers</h2>
          <NuxtLink to="/employers/jobs/new">post a job</NuxtLink>
          <NuxtLink to="/employers/billing">plans &amp; billing</NuxtLink>
          <NuxtLink to="/account">your account</NuxtLink>
        </nav>
        <nav class="footcol" aria-label="About and legal">
          <h2>about</h2>
          <NuxtLink to="/about">about tshono</NuxtLink>
          <NuxtLink to="/contact">contact</NuxtLink>
          <NuxtLink to="/privacy">privacy &amp; your data</NuxtLink>
          <NuxtLink to="/terms">terms of use</NuxtLink>
        </nav>
      </div>
      <div class="foot-bottom">
        <span>© {{ year }} tshono. all rights reserved.</span>
        <span>made for the botswana job market</span>
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
const year = new Date().getFullYear()

const requestFetch = useRequestFetch()
// Almost every visit is anonymous, and a server hop for them is pure latency.
const signedIn = useHasSession()
const { data: session } = await useAsyncData<{ user?: { email: string } } | null>('auth-session', async () =>
  signedIn ? requestFetch('/api/auth/get-session') : null,
)
const user = computed(() => (session.value as { user?: { email: string } } | null)?.user ?? null)

// Which account this is decides the menu entries; /dashboard routes by itself.
const { data: account } = await useAsyncData('account', () => requestFetch('/api/me'), {
  immediate: Boolean(user.value),
})
const role = computed(() => (account.value as { role?: string } | null)?.role ?? '')

const accountOpen = ref(false)
const accountRef = ref<HTMLElement | null>(null)
function closeAccountMenu(e: Event) {
  if (e instanceof MouseEvent && accountRef.value?.contains(e.target as Node)) return
  accountOpen.value = false
}
function onAccountKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !accountOpen.value) return
  accountOpen.value = false
  // Focus stays useful: Escape puts the caret back on the button that opened it.
  accountRef.value?.querySelector('button')?.focus()
}
onMounted(() => {
  document.addEventListener('click', closeAccountMenu)
  document.addEventListener('keydown', onAccountKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeAccountMenu)
  document.removeEventListener('keydown', onAccountKey)
})

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

// Set the theme before paint so there is no flash on reload, and load Umami
// only when a website id is configured (so local dev stays out of the stats).
// Analytics is for real visitors: dev serves nothing so localhost never lands
// in the stats, and an empty id disables it entirely.
const umami = useRuntimeConfig().public
const umamiScript =
  umami.umamiId && !import.meta.dev
    ? [{ src: umami.umamiSrc, defer: true, 'data-website-id': umami.umamiId }]
    : []
useHead({
  script: [
    ...umamiScript,
    {
      innerHTML: `(function(){try{var t=localStorage.getItem('tshono-theme')||'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`,
    },
  ],
})

async function logout() {
  // Loaded on click only: the auth client is ~90KB and the header needs none of it.
  const { signOut } = await import('~~/lib/auth-client')
  await signOut()
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
