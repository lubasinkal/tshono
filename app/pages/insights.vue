<template>
  <section class="wrap">
    <div class="dhead">
      <span class="chip">◉ {{ loadState === 'loading' ? '…' : total }} roles tracked</span>
      <span class="chip">{{ loadState === 'ready' ? '● live aggregates' : '○ loading live…' }}</span>
      <span class="updated">updated {{ updated }}</span>
    </div>

    <h1 class="title">Hiring Data</h1>
    <p class="sub">See who is hiring in Botswana, where demand sits, and which roles close soon.</p>

    <div v-if="loadState === 'loading'" class="skel">
      <div class="grid">
        <div v-for="i in 4" :key="i" class="stat pulse"><b>…</b><span>loading live index</span></div>
      </div>
      <div v-for="i in 6" :key="'r' + i" class="row pulse-row"><span></span></div>
    </div>

    <div v-else-if="liveDocs && liveDocs.length">

    <div class="grid">
      <div class="stat"><b>{{ total }}</b><span>roles tracked</span></div>
      <div class="stat"><b>{{ fresh }}</b><span>fresh this week</span></div>
      <div class="stat"><b>{{ urgent }}</b><span>closing in 7 days</span></div>
      <div class="stat"><b>{{ entryShare }}%</b><span>entry level share</span></div>
    </div>

    <h2 class="sect"><span>#</span> Top Sectors. Daily postings by sector, last 60 days. <span class="peak">peak {{ maxTotal }}/day</span></h2>
    <div ref="chartEl" class="chartscroll">
    <div class="weekaxis"><span v-for="(day, i) in daily" :key="day.label"><b v-if="isTick(i)" :class="i % 14 === 3 ? 'tick' : 'tick tick--minor'">{{ fmtDay(day.label) }}</b></span></div>
    <div class="stack" @mouseleave="hoverDay = null">
      <div class="yline" />
      <div class="ymax">{{ maxTotal }}</div>
      <div class="ymid">{{ Math.round(maxTotal / 2) }}</div>
      <div
        v-for="(day, i) in daily"
        :key="day.label"
        class="stackcol"
        :class="{ hot: hoverDay === i }"
        @mouseenter="hoverDay = i"
        @click="hoverDay = hoverDay === i ? null : i"
      >
        <div class="stackbar" :style="{ height: barPct(day) + '%' }">
          <i
            v-for="s in day.segs"
            :key="s.name"
            :style="{ height: s.share + '%', background: sectorColor(s.name) }"
          />
        </div>
        <div v-if="hoverDay === i" class="tip" :class="tipAlign(i)">
          <div class="tipdate">{{ fmtDay(day.label) }}</div>
          <div class="tiptotal">{{ day.total }} total</div>
          <div v-for="s in day.segs" :key="s.name" class="tiprow">
            <i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}<b>{{ s.count }}</b>
          </div>
        </div>
      </div>
    </div>
    </div>
    <div v-if="hovered" class="sheet">
      <div class="sheetcard">
        <button class="sheetx" @click="hoverDay = null" aria-label="Close">✕</button>
        <div class="tipdate">{{ fmtDay(hovered.label) }}</div>
        <div class="tiptotal">{{ hovered.total }} total</div>
        <div v-for="s in hovered.segs" :key="s.name" class="tiprow">
          <i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}<b>{{ s.count }}</b>
        </div>
      </div>
    </div>
    <div class="legend"><span v-for="s in bySector.slice(0, 8)" :key="s.name"><i :style="{ background: sectorColor(s.name) }" />{{ s.name.toLowerCase() }}</span></div>

    <table class="dtable">
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

    <h2 class="sect"><span>#</span> Top Companies. Who is hiring the most.</h2>
    <table class="dtable">
      <thead><tr><th>rank</th><th>company</th><th>roles</th><th>base</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in topCompanies" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td><NuxtLink :to="companyPath(r.name)">{{ r.name.toLowerCase() }}</NuxtLink></td>
          <td>{{ r.count }}</td>
          <td>{{ companyBase(r.name) }}</td>
        </tr>
      </tbody>
    </table>

    <h2 class="sect"><span>#</span> Entry Access. Where beginners get in.</h2>
    <p class="sub">Roles needing zero years, ranked by sector with a live example.</p>
    <table class="dtable">
      <thead><tr><th>rank</th><th>sector</th><th>entry roles</th><th>example</th></tr></thead>
      <tbody>
        <tr v-for="(r, i) in entryBySector" :key="r.name">
          <td class="rank">{{ String(i + 1).padStart(2, '0') }}</td>
          <td>{{ r.name.toLowerCase() }}</td>
          <td>{{ r.count }}</td>
          <td><NuxtLink :to="jobPath({ id: r.exampleId, title: r.example })">{{ r.example.toLowerCase().slice(0, 42) }}</NuxtLink></td>
        </tr>
      </tbody>
    </table>

    <h2 class="sect"><span>#</span> Demand by Place. Where the roles sit.</h2>
    <div v-for="r in byPlace" :key="r.name" class="row">
      <span class="rname">{{ r.name.toLowerCase() }}</span>
      <span class="rbar"><i :style="{ width: pct(r.count) + '%' }" /></span>
      <b>{{ r.count }}</b>
    </div>

    <h2 class="sect"><span>#</span> Closing Soon. Apply before they vanish.</h2>
    <ul class="list">
      <li v-for="j in closingSoon" :key="j.id" class="card">
        <NuxtLink :to="jobPath(j)" class="cardlink">
          <strong>{{ j.title }}</strong>
          <span class="co">{{ j.company }} · {{ j.closing ? `closes ${j.closing} · ${daysLeft(j.closing, nowDate)}d left` : 'fresh this week' }}</span>
        </NuxtLink>
      </li>
    </ul>
    </div>
    <p v-else-if="loadState === 'error'" class="empty">couldn't load live data. try again.</p>
  </section>
</template>

<script setup lang="ts">
import { daysLeft } from '~/composables/useJobSearch'
import { useJobData } from '~/composables/useJobData'
import { companyPath, jobPath, sectorPath } from '~~/shared/url'

const {
  liveDocs, loadState, load, nowDate,
  total, fresh, urgent, entryShare, updated,
  bySectorRaw, byPlace, topCompanies, bySector, entryBySector,
  closingSoon, daily, maxTotal, companyBase, sectorColor, fmtDay,
} = useJobData()

onMounted(() => load())

const hoverDay = ref<number | null>(null)
const hovered = computed(() => (hoverDay.value === null ? null : daily.value[hoverDay.value] ?? null))
function isTick(i: number): boolean {
  return i % 7 === 3
}
function tipAlign(i: number): string {
  if (i < 5) return 'tip--l'
  if (i > daily.value.length - 6) return 'tip--r'
  return ''
}
const chartEl = ref<HTMLElement | null>(null)
function scrollChartEnd() {
  if (typeof window === 'undefined' || window.innerWidth > 720) return
  const el = chartEl.value
  if (el) el.scrollLeft = el.scrollWidth
}
function barPct(day: { total: number }): number {
  return day.total ? (day.total / maxTotal.value) * 100 : 0
}
const max = computed(() => Math.max(...bySectorRaw.value.map((r) => r.count), 1))
const pct = (n: number) => Math.round((n / max.value) * 100)
watch(daily, () => { nextTick(scrollChartEnd) })
onMounted(() => { nextTick(scrollChartEnd) })

useHead({ title: 'tshono data. botswana hiring live' })
useSeoMeta({
  ogTitle: 'tshono data. botswana hiring live',
  ogDescription: 'Explore jobs data across Botswana. Sectors, companies, places and closing soon.',
  ogImage: 'https://tshono.pages.dev/og-insights.png',
})
</script>
