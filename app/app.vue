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
