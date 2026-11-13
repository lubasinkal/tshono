<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ loadState === 'loading' ? '…' : bySector.length }} sectors</span>
      <span class="chip">{{ loadState === 'ready' ? '● live' : '○ loading' }}</span>
      <span class="updated">{{ total }} roles tracked</span>
    </div>

    <h1 class="title">Sectors</h1>
    <p class="sub">Every sector hiring in Botswana, ranked by roles posted.</p>

    <div v-if="loadState === 'loading'" class="skel">
      <div v-for="i in 8" :key="i" class="row pulse-row"><span></span></div>
    </div>

    <table v-else-if="bySector.length" class="dtable">
      <thead><tr><th>rank</th><th>sector</th><th>roles</th><th>share</th><th>wk/wk</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in bySector" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td><NuxtLink :to="sectorPath(r.name)">{{ r.name.toLowerCase() }}</NuxtLink></td>
          <td>{{ r.count }}</td>
          <td>{{ total ? Math.round((r.count / total) * 100) : 0 }}%</td>
          <td :class="r.delta === null ? 'flat' : r.delta >= 0 ? 'up' : 'down'">
            {{ r.delta === null ? 'new' : (r.delta >= 0 ? '+' : '') + r.delta + '%' }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">no sectors yet. <NuxtLink to="/">back to search</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { useJobData } from '~/composables/useJobData'
import { sectorPath } from '~~/shared/url'

const { load, loadState, bySector, total } = useJobData()
onMounted(() => load())

useHead({ title: 'sectors · tshono' })
const reqUrl = useRequestURL()
const ogImage = `${reqUrl.origin}/og/job?${new URLSearchParams({ title: 'Sectors', label: 'SECTORS', sub: 'every sector hiring in botswana' }).toString()}`
useSeoMeta({
  ogTitle: 'sectors hiring in botswana · tshono',
  ogDescription: 'Every sector hiring in Botswana, ranked by roles posted.',
  ogImage,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})
</script>
