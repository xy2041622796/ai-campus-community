<template>
  <button class="like-btn" :class="{ active: isLiked }" @click="handleClick">
    <svg width="18" height="18" viewBox="0 0 24 24" :fill="isLiked ? '#FF4757' : 'none'" :stroke="isLiked ? '#FF4757' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span>{{ count }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useLikeStore } from '@/stores/like'

const props = defineProps({ postId: { type: String, required: true } })
const likeStore = useLikeStore()
const isLiked = computed(() => likeStore.isLiked(props.postId))
const count = computed(() => likeStore.likeCounts[props.postId] || 0)

function handleClick() { likeStore.toggleLike(props.postId) }
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: $color-text-tertiary;
   border-radius: $radius-sm;
  cursor: pointer;
  transition: $transition-fast;

  &:hover { background: rgba(255, 71, 87, 0.06); color: $color-heart; }
  &:active { transform: scale(0.85); }
  &.active { animation: likePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
  &.active { color: $color-heart; background: rgba(255, 71, 87, 0.06); }
}
@keyframes likePop {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
</style>
