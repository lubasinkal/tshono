<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ loadState === 'loading' ? '…' : companies.length }} companies</span>
      <span class="chip">{{ loadState === 'ready' ? '● live' : '○ loading' }}</span>
      <span class="updated">{{ total }} roles tracked</span>
    </div>

    <h1 class="title">Companies</h1>
    <p class="sub">Every employer hiring in Botswana, ranked by roles posted.</p>

    <div v-if="loadState === 'loading'" class="skel">
      <div v-for="i in 8" :key="i" class="row pulse-row"><span></span></div>
    </div>

    <table v-else-if="companies.length" class="dtable">
      <thead><tr><th>rank</th><th>company</th><th>roles</th><th>base</th><th>entry</th></tr></thead>
      <tbody>
        <tr v-for="(c, i) in companies" :key="c.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td><NuxtLink :to="`/companies/${encodeURIComponent(c.name)}`">{{ c.name.toLowerCase() }}</NuxtLink></td>
          <td>{{ c.count }}</td>
          <td>{{ c.base.toLowerCase() }}</td>
          <td>{{ c.entry }}%</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">no companies yet. <NuxtLink to="/">back to search</NuxtLink></p>
  </section>
</template>

<script setup lang="ts">
import { useJobData } from '~/composables/useJobData'

const { allDocs, load, loadState } = useJobData()
onMounted(() => load())

const total = computed(() => allDocs.value.length)

// One pass: count + entry share + most common location per company.
const companies = computed(() => {
  const m = new Map<string, { count: number; entry: number; locs: Map<string, number> }>()
  for (const j of allDocs.value) {
    let c = m.get(j.company)
    if (!c) { c = { count: 0, entry: 0, locs: new Map() }; m.set(j.company, c) }
    c.count++
    if (j.minYears === 0) c.entry++
    c.locs.set(j.location, (c.locs.get(j.location) ?? 0) + 1)
  }
  return [...m.entries()]
    .map(([name, c]) => ({
      name,
      count: c.count,
      entry: c.count ? Math.round((c.entry / c.count) * 100) : 0,
      base: [...c.locs.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Botswana',
    }))
    .sort((a, b) => b.count - a.count)
})

useHead({ title: 'companies · tshono' })
useSeoMeta({
  ogTitle: 'companies hiring in botswana · tshono',
  ogDescription: 'Every employer hiring in Botswana, ranked by roles posted.',
  ogImage: 'https://tshono.pages.dev/og.png',
})
</script>
