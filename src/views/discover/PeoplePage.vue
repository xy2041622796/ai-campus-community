<template>
  <div class="people-page">
    <div class="people-header">
      <h1 class="people-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        发现同学
      </h1>
      <p class="people-desc">根据共兴品超的同学，可能关识一下</p>
    </div>

    <div v-if="store.loading" class="people-loading">
      <div class="pl-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="store.users.length" class="people-grid">
      <div v-for="u in store.users" :key="u.id" class="people-card" @click="router.push('/profile/' + u.id)">
        <div class="pc-avatar">
          <img v-if="u.avatar_url" :src="u.avatar_url" />
          <div v-else class="pc-avatar-ph">{{ (u.nickname || '?')[0] }}</div>
        </div>
        <div class="pc-info">
          <div class="pc-name">{{ u.nickname }}</div>
          <div class="pc-meta">
            <span v-if="u.college">{{ u.college }}</span>
            <span v-if="u.grade"> · {{ u.grade }}</span>
          </div>
          <div v-if="u.bio" class="pc-bio">{{ u.bio.slice(0, 40) }}{{ u.bio.length > 40 ? '...' : '' }}</div>
          <div class="pc-tags">
            <span v-if="u.same_college" class="pc-tag badge-college">同校</span>
            <span v-if="u.common_tags > 0" class="pc-tag badge-interest">共兴匹超 · {{ u.common_tags }}</span>
          </div>
        </div>
        <FollowButton :target-id="u.id" class="pc-follow" />
      </div>
    </div>

    <div v-else class="people-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <h3>没有更识的同学</h3>
      <p>等更多加更再据兴品超，就会有更多的同学出现</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecommendStore } from '@/stores/recommend'
import FollowButton from '@/components/common/FollowButton.vue'

const router = useRouter()
const store = useRecommendStore()

onMounted(() => { store.fetchRecommendations() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.people-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.people-header { margin-bottom: 24px; }
.people-title {
  display: flex; align-items: center; gap: 8px;
  font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary;
  margin: 0 0 4px;
  svg { color: $color-primary; }
}
.people-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.people-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.pl-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.people-grid { display: flex; flex-direction: column; gap: 8px; }

.people-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px;
  background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-lg;
  cursor: pointer; transition: all 0.15s ease; box-shadow: $shadow-card;
  &:hover { box-shadow: $shadow-hover; transform: translateY(-1px); }
}

.pc-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.pc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.pc-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 1rem; font-weight: 600; }

.pc-info { flex: 1; min-width: 0; }
.pc-name { font-weight: 600; color: $color-text-primary; margin-bottom: 2px; }
.pc-meta { font-size: $font-size-xs; color: $color-text-tertiary; }
.pc-bio { font-size: $font-size-sm; color: $color-text-secondary; margin-top: 4px; line-height: $line-height-normal; }

.pc-tags { display: flex; gap: 4px; margin-top: 6px; }
.pc-tag { font-size: 0.6rem; padding: 1px 8px; border-radius: $radius-round; font-weight: 500; }
.badge-college { background: rgba(74, 108, 247, 0.1); color: $color-primary; }
.badge-interest { background: rgba(255, 107, 74, 0.1); color: $color-accent; }

.pc-follow { flex-shrink: 0; }

.people-empty { text-align: center; padding: 80px 20px; color: $color-text-tertiary; svg { stroke: $color-text-tertiary; } h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; } p { font-size: $font-size-sm; margin: 0; } }
</style>
