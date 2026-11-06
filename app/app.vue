<template>
  <div class="page">
    <header class="topbar">
      <div class="topbar-inner">
        <NuxtLink to="/" class="brand">
          <span class="branddot" aria-hidden="true"></span>
          <span>tshono<b>.</b></span>
          <em class="brandtag">bw</em>
        </NuxtLink>
        <form class="hdsearch" role="search" @submit.prevent="doSearch">
          <kbd>/</kbd>
          <input v-model="hdq" name="q" type="search" placeholder="search roles…" aria-label="Search jobs" autocomplete="off" spellcheck="false" />
        </form>
        <div class="topbar-right">
          <nav class="nav">
            <NuxtLink to="/">Search<kbd>g s</kbd></NuxtLink>
            <NuxtLink to="/insights">Insights<kbd>g i</kbd></NuxtLink>
          </nav>
          <button class="jumpbtn" type="button" aria-label="Open command palette" @click="palette?.open()">
            <span>jump to…</span>
            <kbd>⌘K</kbd>
          </button>
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
  ogImage: 'https://tshono.pages.dev/og.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'tshono. find work. fast.',
  twitterDescription: 'Every opportunity in Botswana in one instant search.',
  twitterImage: 'https://tshono.pages.dev/og.png',
  themeColor: '#0a0a0a',
})
</script>
