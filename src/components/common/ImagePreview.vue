<template>
  <div v-if="visible" class="image-overlay" @click.self="close">
    <button class="io-close" @click="close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <img :src="src" class="io-image" @click.self="close" />
    <div class="io-nav">
      <button v-if="prev" class="io-nav-btn" @click="switchTo(prev)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
      <button v-if="next" class="io-nav-btn" @click="switchTo(next)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  src: String, visible: Boolean,
  images: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 }
})
const emit = defineEmits(['close', 'update:currentIndex'])

function close() { emit('close') }
function switchTo(idx) { emit('update:currentIndex', idx) }

const prev = computed(() => props.currentIndex > 0 ? props.currentIndex - 1 : null)
const next = computed(() => props.currentIndex < props.images.length - 1 ? props.currentIndex + 1 : null)

import { computed } from 'vue'
</script>

<style scoped>
.image-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.io-close {
  position: absolute; top: 16px; right: 16px;
  background: rgba(255,255,255,0.1); border: none; border-radius: 50%;
  width: 44px; height: 44px; cursor: pointer; color: white;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.2); }
}
.io-image {
  max-width: 90vw; max-height: 90vh; object-fit: contain;
  border-radius: 4px; user-select: none;
}
.io-nav {
  position: absolute; left: 0; right: 0; top: 50%;
  transform: translateY(-50%);
  display: flex; justify-content: space-between; padding: 0 16px;
  pointer-events: none;
}
.io-nav-btn {
  pointer-events: auto;
  background: rgba(255,255,255,0.1); border: none; border-radius: 50%;
  width: 44px; height: 44px; cursor: pointer; color: white;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.25); }
  svg { stroke: currentColor; }
}
</style>
