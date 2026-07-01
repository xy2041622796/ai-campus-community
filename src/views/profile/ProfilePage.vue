<template>
  <div class="profile-page" v-if="profileUser">
    
    <div class="profile-cover">
      <div class="cover-bg-pattern"></div>
      <div class="cover-content">
        <UserAvatar :src="profileUser.avatar_url" :nickname="profileUser.nickname" :size="72" class="profile-avatar" />
        <div class="profile-info">
          <h1 class="profile-name">{{ profileUser.nickname }}</h1>
          <p v-if="profileUser.college" class="profile-meta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            {{ profileUser.college }}
            <template v-if="profileUser.grade">
            | {{ profileUser.grade }}
          </template>
          </p>
          <p v-if="profileUser.bio" class="profile-bio">{{ profileUser.bio }}</p>
        </div>
        <div class="profile-actions-top">
          <FollowButton v-if="isOwnProfile === false" :target-id="profileUser.id" />
          <el-button v-if="isOwnProfile" round @click="router.push('/settings/profile')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            编辑资料
          </el-button>
        </div>
      </div>
    </div>

    
    <div class="profile-stats">
      <div class="stat-item" @click="goFollowers()">
        <span class="stat-num">{{ followers.length }}</span>
        <span class="stat-label">粉丝</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item" @click="goFollowing()">
        <span class="stat-num">{{ following.length }}</span>
        <span class="stat-label">关注</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ userPosts.length }}</span>
        <span class="stat-label">帖子</span>
      </div>
    </div>

    
    <div v-if="profileUser.interest_tags?.length" class="profile-tags">
      <span class="tags-title">兴趣标签</span>
      <div class="tags-list">
        <el-tag v-for="tag in profileUser.interest_tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
      </div>
    </div>

    
    <div class="profile-tabs">
      <button v-for="tab in tabs" :key="tab.key"
        class="ptab" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    
    <div v-if="activeTab === 'posts'" class="profile-posts">
      <PostCard v-for="post in userPosts" :key="post.id" :post="post" />
      <div v-if="!userPosts.length" class="profile-empty">
        <div class="pe-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p class="pe-text">还没有收藏帖子</p>
      </div>
    </div>

    
    <div v-if="activeTab === 'favorites'" class="profile-posts">
      <PostCard v-for="post in favoriteStore.favoriteList" :key="post.id" :post="post" />
      <div v-if="!favoriteStore.favoriteList.length" class="profile-empty">
        <div class="pe-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <p class="pe-text">还没有发布帖子</p>
      </div>
    </div>
  </div>

  <div v-else class="profile-loading">
    <div class="pl-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { usePostStore } from '@/stores/post'
import { useFollowStore } from '@/stores/follow'
import { useFavoriteStore } from '@/stores/favorite'
import { useLikeStore } from '@/stores/like'
import PostCard from '@/components/common/PostCard.vue'
import FollowButton from '@/components/common/FollowButton.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import { supabase } from '@/api/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const postStore = usePostStore()
const followStore = useFollowStore()
const favoriteStore = useFavoriteStore()
const likeStore = useLikeStore()

const profileUser = ref(null)
const userPosts = ref([])
const followers = ref([])
const following = ref([])
const activeTab = ref('posts')

const profileId = computed(() => route.params.id)
const isOwnProfile = computed(() => authStore.user?.id === profileId.value)
function goFollowers() { router.push('/profile/' + profileId.value + '/followers') }
function goFollowing() { router.push('/profile/' + profileId.value + '/following') }

const tabs = [
  { key: 'posts', label: '帖子' },
  { key: 'favorites', label: '收藏' },
]

async function loadProfile() {
  const userId = route.params.id
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (data) profileUser.value = data
  userPosts.value = await postStore.fetchPostsByAuthor(userId)
  await Promise.all([
    followStore.fetchFollowers(userId),
    followStore.fetchFollowing(userId)
  ])
  followers.value = followStore.followers
  following.value = followStore.following
  if (authStore.user?.id) {
    followStore.fetchFollowing(authStore.user.id)
    favoriteStore.fetchFavoritePosts(userId)
    likeStore.fetchLikedPosts(authStore.user.id)
  }
}

onMounted(loadProfile)
watch(() => route.params.id, loadProfile)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.profile-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* ?? */
.profile-cover {
  position: relative;
  background: linear-gradient(135deg, #4A6CF7 0%, #5EC4AC 50%, #3B82F6 100%);
  border-radius: $radius-xl;
  padding: 36px 28px 20px;
  color: white;
  overflow: hidden;
  margin-bottom: 20px;
}

.profile-stats-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
  padding: 12px 20px;
  background: rgba(255,255,255,0.12);
  border-radius: $radius-md;
  backdrop-filter: blur(8px);
}

.psi-item { text-align: center; cursor: pointer; padding: 0 4px; }
.psi-num { display: block; font-size: $font-size-xl; font-weight: 700; color: white; }
.psi-label { font-size: $font-size-xs; color: rgba(255,255,255,0.7); margin-top: 2px; }
.psi-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }

.cover-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image:
    radial-gradient(circle at 15% 30%, white 2px, transparent 2px),
    radial-gradient(circle at 80% 60%, white 1.5px, transparent 1.5px);
  background-size: 40px 40px, 60px 60px;
}

.cover-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.profile-avatar {
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-info { flex: 1; min-width: 0; padding-top: 8px; }

.profile-name {


  font-weight: 700;
  margin-bottom: 4px;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: 4px;
   border-radius: $radius-sm;
  opacity: 0.85;
  margin-bottom: 6px;

  svg { stroke: currentColor; }
}

.profile-bio {
   border-radius: $radius-sm;
  opacity: 0.8;
  line-height: $line-height-relaxed;
}

.profile-actions-top { flex-shrink: 0; padding-top: 8px; }

/* ͳ */
.profile-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 18px;
  background: $color-card;
  border-radius: $radius-lg;
  border: 1px solid $color-border-light;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 0 8px;
  transition: $transition-fast;

  &:hover .stat-num { color: $color-primary; }
}

.stat-num {
  display: block;

  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-primary;
  transition: $transition-fast;
}

.stat-label {

  color: $color-text-tertiary;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: $color-border;
}

/* ǩ */
.profile-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: $radius-md;
  flex-wrap: wrap;
}

.tags-title {

  color: $color-text-tertiary;
  font-weight: 600;
}

.tags-list { display: flex; gap: 4px; flex-wrap: wrap; }

/* Tabs */
.profile-tabs {
  display: flex;
  gap: 4px;
  background: $color-card;
  padding: 3px;
  border-radius: $radius-md;
  border: 1px solid $color-border-light;
  margin-bottom: 16px;
}

.ptab {
  background: none;
  border: none;
  padding: 8px 20px;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $color-text-tertiary;
  cursor: pointer;
  transition: $transition-fast;

  &.active {
    background: $color-primary-gradient;
    color: white;
    box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
  }

  &:not(.active):hover { color: $color-primary; background: $color-primary-subtle; }
}

/* б */
.profile-posts { display: flex; flex-direction: column; border-radius: $radius-md; }

.profile-empty {
  text-align: center;
  padding: 60px 0;
  color: $color-text-tertiary;

  .pe-icon { border-radius: $radius-sm; opacity: 0.4; }
  .pe-text {  border-radius: $radius-sm; }
}

/* ?? */
.profile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: $color-text-tertiary;
   border-radius: $radius-sm;
}

.pl-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $color-border;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  border-radius: $radius-md;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
