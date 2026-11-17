<template>
  <!-- aria-live so a toast is announced without stealing focus from the form. -->
  <div class="toaster" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <span>{{ t.message }}</span>
        <button class="toastx" type="button" aria-label="Dismiss" @click="dismiss(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>
