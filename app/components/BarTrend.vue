<template>
  <div class="chartscroll">
    <div class="weekaxis"><span v-for="(d, i) in days" :key="d.label"><b v-if="isTick(i)" class="tick">{{ fmtDay(d.label) }}</b></span></div>
    <div class="stack" @mouseleave="hover = null">
      <div
        v-for="(d, i) in days"
        :key="d.label"
        class="stackcol"
        :class="{ hot: hover === i }"
        @mouseenter="hover = i"
        @click="hover = hover === i ? null : i"
      >
        <div class="stackbar" :style="{ height: barPct(d) + '%' }">
          <i :style="{ height: '100%', background: 'var(--accent)' }" />
        </div>
        <div v-if="hover === i" class="tip" :class="tipAlign(i)">
          <div class="tipdate">{{ fmtDay(d.label) }}</div>
          <div class="tiptotal">{{ d.total }} roles</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ days: Array<{ label: string; total: number }> }>()

const hover = ref<number | null>(null)
const max = computed(() => Math.max(...props.days.map((d) => d.total), 1))
function barPct(d: { total: number }): number {
  return d.total ? (d.total / max.value) * 100 : 0
}
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
function fmtDay(iso: string): string {
  const dt = new Date(iso + 'T00:00:00')
  return `${MON[dt.getMonth()] ?? ''} ${dt.getDate()}`
}
function isTick(i: number): boolean {
  return i % 7 === 3
}
function tipAlign(i: number): string {
  if (i < 5) return 'tip--l'
  if (i > props.days.length - 6) return 'tip--r'
  return ''
}
</script>
