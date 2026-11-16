<template>
  <!-- One destructive action, guarded by typing the word back. Shared by the
       account, jobseeker profile and company pages so the three read the same. -->
  <div class="danger">
    <p class="formnote">{{ hint }}</p>
    <div class="field">
      <label :for="id">type {{ word }} to confirm</label>
      <input :id="id" v-model="text" autocomplete="off" spellcheck="false" :placeholder="word" />
    </div>
    <button class="ghostbtn dangerbtn" type="button" :disabled="busy || !ready" @click="emit('confirm')">
      {{ busy ? 'deleting…' : label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const props = withDefaults(
  defineProps<{ label: string; hint: string; word?: string; busy?: boolean }>(),
  { word: 'delete', busy: false },
)
const emit = defineEmits<{ confirm: [] }>()

const id = useId()
const text = ref('')
const ready = computed(() => text.value.trim().toLowerCase() === props.word.toLowerCase())
</script>
