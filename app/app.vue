<template>
  <div class="shell">
    <header class="topbar">
      <NuxtLink to="/" class="brand">tshono<b>.</b></NuxtLink>
      <nav class="nav">
        <NuxtLink to="/">Search</NuxtLink>
        <NuxtLink to="/insights">Insights</NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="foot">
      <span>tshono. every opportunity in bw, one fast search.</span>
      <span>built in gaborone</span>
    </footer>
  </div>
</template>

<style>
body { margin: 0; }
</style>

<script setup lang="ts">
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
  themeColor: '#06090d',
})
</script>
