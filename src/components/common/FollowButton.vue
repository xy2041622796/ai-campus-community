<template>
  <el-button
    :type="isFollowing ? 'default' : 'primary'"
    :size="size"
    :loading="loading"
    :plain="isFollowing"
    round
    @click="handleClick"
  >
    <template v-if="!isFollowing">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      关注
    </template>
    <template v-else>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg>
      已关注
    </template>
  </el-button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFollowStore } from '@/stores/follow'

const props = defineProps({
  targetId: { type: String, required: true },
  size: { type: String, default: 'small' }
})

const followStore = useFollowStore()
const loading = ref(false)
const isFollowing = computed(() => followStore.isFollowing(props.targetId))

async function handleClick() {
  loading.value = true
  try {
    if (isFollowing.value) await followStore.unfollowUser(props.targetId)
    else await followStore.followUser(props.targetId)
  } finally { loading.value = false }
}
</script>

