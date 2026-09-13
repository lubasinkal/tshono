<template>
  <div class="shell">
    <header class="topbar">
      <NuxtLink to="/" class="brand">Tshono</NuxtLink>
      <nav class="nav">
        <NuxtLink to="/">Search</NuxtLink>
        <NuxtLink to="/insights">Insights</NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="foot">
      <span>Tshono. Every opportunity in Botswana in one fast search.</span>
    </footer>
  </div>
</template>

<style>
body { margin: 0; }
</style>
