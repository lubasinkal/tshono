<template>
  <Teleport to="body">
    <div v-if="open" class="cmdk" @click.self="close" @keydown.esc="close">
      <div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Jump to">
        <input
          ref="input"
          v-model="q"
          class="cmdk-input"
          type="text"
          placeholder="type a command…"
          spellcheck="false"
          autocomplete="off"
          @keydown="onKey"
        />
        <ul class="cmdk-list">
          <li
            v-for="(c, i) in filtered"
            :key="c.label"
            class="cmdk-item"
            :class="{ 'is-sel': i === sel }"
            @mousemove="sel = i"
            @click="run(c)"
          >
            <span class="cmdk-icon">{{ c.icon }}</span>
            <span class="cmdk-label">{{ c.label }}</span>
          </li>
        </ul>
        <p v-if="!filtered.length" class="cmdk-empty">no match</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Cmd { icon: string; label: string; to: string }

const commands: Cmd[] = [
  { icon: '/', label: 'Search jobs', to: '/' },
  { icon: '▦', label: 'Companies', to: '/companies' },
  { icon: '◉', label: 'Hiring data · insights', to: '/insights' },
]

const open = ref(false)
const q = ref('')
const sel = ref(0)
const input = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const t = q.value.trim().toLowerCase()
  if (!t) return commands
  return commands.filter((c) => c.label.toLowerCase().includes(t))
})

function reset() {
  q.value = ''
  sel.value = 0
}

function openPalette() {
  open.value = true
  reset()
  nextTick(() => input.value?.focus())
}
function close() {
  open.value = false
}

function run(c: Cmd) {
  close()
  navigateTo(c.to)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    sel.value = Math.min(sel.value + 1, filtered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    sel.value = Math.max(sel.value - 1, 0)
  } else if (e.key === 'Enter') {
    const c = filtered.value[sel.value]
    if (c) run(c)
  }
}

function onGlobal(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    open.value ? close() : openPalette()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobal))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobal))

defineExpose({ open: openPalette, close })
</script>
