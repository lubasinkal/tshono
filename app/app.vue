<template>
  <div class="page">
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink to="/" class="brand">tshono<b>.</b></NuxtLink>
        <form class="hdsearch" role="search" @submit.prevent="doSearch">
          <kbd>/</kbd>
          <input v-model="hdq" name="q" type="search" placeholder="search roles…" aria-label="Search jobs" autocomplete="off" spellcheck="false" />
        </form>
        <nav class="nav">
          <NuxtLink to="/">Search</NuxtLink>
          <NuxtLink to="/companies">Companies</NuxtLink>
          <NuxtLink to="/sectors">Sectors</NuxtLink>
          <NuxtLink to="/insights">Insights</NuxtLink>
        </nav>
        <button class="jumpbtn" type="button" aria-label="Open command palette" @click="palette?.open()">
          <span>jump to…</span>
          <kbd>⌘K</kbd>
        </button>
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
  </div>
</template>

<style>
body { margin: 0; }
</style>

<script setup lang="ts">
const palette = ref<{ open: () => void } | null>(null)
const hdq = ref('')
function doSearch() {
  navigateTo({ path: '/', query: hdq.value.trim() ? { q: hdq.value.trim() } : {} })
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
