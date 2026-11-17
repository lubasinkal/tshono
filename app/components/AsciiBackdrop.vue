<template>
  <!-- Decoration only: columns of index words drifting up behind the page.
       aria-hidden and pointer-events: none, so it never blocks a click and is
       never read out. CSS transforms only: no JS, no per-frame work. -->
  <div class="ascii" aria-hidden="true">
    <div v-for="c in columns" :key="c.key" class="ascii-col" :style="c.style">
      <div class="ascii-run">
        <span class="ascii-copy">{{ c.text }}</span>
        <span class="ascii-copy">{{ c.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Fixed data, not Math.random: the server and the browser must render the same
// thing or hydration fights over the text.
const LINES = [
  'nurse · gaborone', 'driver · francistown', 'accountant · maun',
  'teacher · serowe', 'electrician · jwaneng', 'cashier · palapye',
  'site clerk · kasane', 'mechanic · molepolole', 'chef · gaborone',
  'sales rep · mahalapye', 'security · ghanzi', 'receptionist · mogoditshane',
  'lab tech · gaborone', 'store keeper · lobatse', 'nurse · maun',
  'payroll officer · selebi-phikwe',
]

// Exactly 46 lines, and the stylesheet sizes a line to a 46th of the viewport,
// so one copy is always one screen tall and the -50% loop never shows a gap.
const LINES_PER_COPY = 46

const COLUMNS = [
  { left: '4%', dur: 108, delay: -20, skip: 0 },
  { left: '23%', dur: 156, delay: -74, skip: 6 },
  { left: '73%', dur: 126, delay: -44, skip: 3 },
  { left: '93%', dur: 174, delay: -96, skip: 10 },
]

function copy(skip: number): string {
  const out: string[] = []
  for (let i = 0; i < LINES_PER_COPY; i++) out.push(LINES[(i + skip) % (LINES.length)] ?? '')
  return out.join('\n')
}

const columns = COLUMNS.map((c, i) => ({
  key: i,
  style: `left:${c.left};--dur:${c.dur}s;--delay:${c.delay}s`,
  text: copy(c.skip),
}))
</script>
