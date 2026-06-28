<template>
  <div class="follow-list-page">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回
      </button>
      <h1 class="page-title">{{ isFollowers ? '粉丝' : '关注' }}</h1>
    </div>

    <div v-if="list.length" class="user-list">
      <div v-for="user in list" :key="user.id" class="user-item" @click="router.push('/profile/' + user.id)">
        <img v-if="user.avatar_url" :src="user.avatar_url" class="u-avatar" />
        <div v-else class="u-avatar ph">{{ user.nickname?.[0] || '?' }}</div>
        <div class="u-info">
          <div class="u-name">{{ user.nickname }}</div>
          <div class="u-meta">{{ user.college || '' }} {{ user.grade || '' }}</div>
        </div>
        <FollowButton v-if="user.id !== authStore.user?.id" :target-id="user.id" />
      </div>
    </div>

    <div v-else class="page-empty">
      <div class="pe-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <p class="pe-text">{{ isFollowers ? '还没有粉丝' : '还没有关注任何人' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFollowStore } from '@/stores/follow'
import { supabase } from '@/api/supabase'
import FollowButton from '@/components/common/FollowButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const followStore = useFollowStore()

const isFollowers = computed(() => route.name === 'Followers')
const list = ref([])

onMounted(async () => {
  const userId = route.params.id
  if (isFollowers.value) {
    await followStore.fetchFollowers(userId)
    list.value = followStore.followers
  } else {
    await followStore.fetchFollowingProfiles(userId)
    list.value = followStore.followingList
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.follow-list-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: $radius-lg;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: $color-border;
  border-radius: 50%;
  background: $color-card;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $color-primary;
    border-color: $color-primary;
  }

  svg { stroke: currentColor; }
}

.page-title {

  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-primary;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: $color-card;
  border: $color-border;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    border-color: transparent;
    border-radius: $radius-sm;
  }
}

.u-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;

  &.ph {

    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
  }
}

.u-info { flex: 1; min-width: 0; }
.u-name { font-weight: 600;  border-radius: $radius-sm; color: $color-primary; }
.u-meta { color: $color-text-tertiary; margin-top: 1px; }

.page-empty {
  text-align: center;
  padding: 80px 0;
  color: $color-text-tertiary;
  .pe-icon { opacity: 0.4; border-radius: $radius-sm; }
  .pe-text {  border-radius: $radius-sm; }
}
</style>
