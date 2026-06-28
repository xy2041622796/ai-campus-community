<template>
  <div class="user-avatar" :style="{ width: size + 'px', height: size + 'px', fontSize: (size * 0.4) + 'px' }">
    <img v-if="src" :src="src" :style="{ width: size + 'px', height: size + 'px' }" @error="failed = true" />
    <div v-else-if="failed || !src" class="avatar-fallback" :style="{ width: size + 'px', height: size + 'px', fontSize: (size * 0.38) + 'px' }">
      {{ fallbackChar }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  src: { type: String, default: null },
  nickname: { type: String, default: '?' },
  size: { type: Number, default: 34 }
})
const failed = ref(false)
const fallbackChar = computed(() => (props.nickname || '?')[0])
</script>

<style scoped lang="scss">
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img {
    object-fit: cover;
    display: block;
  }
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4A6CF7, #5EC4AC);
  color: white;
  font-weight: 600;
  border-radius: 50%;
}
</style>
