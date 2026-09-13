<template>
  <section class="wrap">
    <p>opening search… <NuxtLink to="/">go now</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
await navigateTo({ path: '/', query: route.query }, { redirectCode: 301 })
</script>
