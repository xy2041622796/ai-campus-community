<template>
  <div class="fav-btn" :class="{ active: isFavorited }" @click="handleToggle">
    <span class="btn-icon">{{ isFavorited ? '🔖' : '🏷️' }}</span>
    <span class="btn-label">{{ isFavorited ? '已收藏' : '收藏' }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoriteStore } from '@/stores/favorite'

const props = defineProps({
  postId: { type: String, required: true }
})

const favStore = useFavoriteStore()
const isFavorited = computed(() => favStore.isFavorited(props.postId))

async function handleToggle() {
  await favStore.toggleFavorite(props.postId)
}
</script>

<style scoped>
.fav-btn { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; padding: 4px 10px; border-radius: 16px; transition: all 0.2s; user-select: none; }
.fav-btn:hover { background: #f0f5ff; }
.fav-btn.active { color: #409eff; }
.btn-icon { font-size: 1rem; line-height: 1; }
.btn-label { font-size: 0.85rem; color: #666; }
.fav-btn.active .btn-label { color: #409eff; }
@keyframes likePop {
  0% { transform: scale(1); }
  30% { transform: scale(1.2); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
</style>