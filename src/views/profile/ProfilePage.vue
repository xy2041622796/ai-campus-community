<template>
  <div class="profile-page" v-if="profileUser">
    <!-- �������� -->
    <div class="profile-cover">
      <div class="cover-bg-pattern"></div>
      <div class="cover-content">
        <UserAvatar :src="profileUser.avatar_url" :nickname="profileUser.nickname" :size="72" class="profile-avatar" />
        <div class="profile-info">
          <h1 class="profile-name">{{ profileUser.nickname }}</h1>
          <p v-if="profileUser.college" class="profile-meta">
            <svg $sidebar-width="14" $navbar-height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            {{ profileUser.college }}
            <template v-if="profileUser.grade"> �� {{ profileUser.grade }}</template>
          </p>
          <p v-if="profileUser.bio" class="profile-bio">{{ profileUser.bio }}</p>
        </div>
        <div class="profile-actions-top">
          <FollowButton v-if="isOwnProfile === false" :target-id="profileUser.id" />
          <el-button v-if="isOwnProfile" $radius-round @click="router.push('/settings/profile')">
            <svg $sidebar-width="14" $navbar-height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            �༭����
          </el-button>
        </div>
      </div>
    </div>

    <!-- ͳ�ƿ�Ƭ -->
    <div class="profile-stats">
      <div class="stat-item" @click="router.push(/profile//followers)">
        <span class="stat-num">{{ followers.length }}</span>
        <span class="stat-label">��˿</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item" @click="router.push(/profile//following)">
        <span class="stat-num">{{ following.length }}</span>
        <span class="stat-label">��ע</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ userPosts.length }}</span>
        <span class="stat-label">����</span>
      </div>
    </div>

    <!-- ��ǩ -->
    <div v-if="profileUser.interest_tags?.length" class="profile-tags">
      <span class="tags-title">��Ȥ��ǩ</span>
      <div class="tags-list">
        <el-tag v-for="tag in profileUser.interest_tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
      </div>
    </div>

    <!-- Tab �л� -->
    <div class="profile-tabs">
      <button v-for="tab in tabs" :key="tab.key"
        class="ptab" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- �����б� -->
    <div v-if="activeTab === 'posts'" class="profile-posts">
      <PostCard v-for="post in userPosts" :key="post.id" :post="post" />
      <div v-if="!userPosts.length" class="profile-empty">
        <div class="pe-icon">
          <svg $sidebar-width="48" $navbar-height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p class="pe-text">��û�з�������</p>
      </div>
    </div>

    <!-- �ղ��б� -->
    <div v-if="activeTab === 'favorites'" class="profile-posts">
      <PostCard v-for="post in favoriteStore.favoriteList" :key="post.id" :post="post" />
      <div v-if="!favoriteStore.favoriteList.length" class="profile-empty">
        <div class="pe-icon">
          <svg $sidebar-width="48" $navbar-height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <p class="pe-text">��û���ղ�����</p>
      </div>
    </div>
  </div>

  <div v-else class="profile-loading">
    <div class="pl-spinner"></div>
    <p>������...</p>
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

const isOwnProfile = computed(() => authStore.user?.id === route.params.id)

const tabs = [
  { key: 'posts', label: '����' },
  { key: 'favorites', label: '�ղ�' },
]

async function loadProfile() {
  const userId = route.params.id
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (data) profileUser.value = data
  userPosts.value = await postStore.fetchPostsByAuthor(userId)
  followStore.fetchFollowers(userId)
  followStore.fetchFollowing(userId)
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

<script>
import { supabase } from '@/api/supabase'
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.profile-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* ���� */
.profile-cover {
  position: relative;
  background: linear-gradient(135deg, #4A6CF7 0%, #5EC4AC 50%, #3B82F6 100%);
  border-radius: $radius-xl;
  padding: 36px 28px;
  color: white;
  $spacingborder-radius: border-radius: $radius-lg;
  overflow: hidden;
}

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
  $fontdisplay: flex;
  align-items: flex-start;
  gap: 20px;
}

.profile-avatar {
  $colorborder: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  flex-shrink: 0;
}

.profile-info { flex: 1; min-width: 0; padding-top: 8px; }

.profile-name {
  $font-display;
  $font-size-2xl;
  font-weight: 700;
  margin-bottom: 4px;
}

.profile-meta {
  $fontdisplay: flex;
  align-items: center;
  gap: 4px;
  $font-sizeborder-radius: border-radius: $radius-sm;
  opacity: 0.85;
  margin-bottom: 6px;

  svg { stroke: currentColor; }
}

.profile-bio {
  $font-sizeborder-radius: border-radius: $radius-sm;
  opacity: 0.8;
  line-height: -height-relaxed;
}

.profile-actions-top { flex-shrink: 0; padding-top: 8px; }

/* ͳ�� */
.profile-stats {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 18px;
  $colorbackground: background: $color-card;
  $radiusborder-radius: border-radius: $radius-lg;
  $colorborder: $color-border;
  $spacingborder-radius: border-radius: $radius-md;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 0 8px;
  $transitiontransition: transition: $transition-fast;

  &:hover .stat-num { $colorcolor: color: $color-primary; }
}

.stat-num {
  $fontdisplay: block;
  $font-display;
  $fontfont-size: font-size: $font-size-xl;
  font-weight: 700;
  $colorcolor: -textcolor: color: $color-primary;
  $transitiontransition: transition: $transition-fast;
}

.stat-label {
  $font-size-xs;
  $colorcolor: color: $color-text-tertiary;
}

.stat-divider {
  $sidebar-width: 1px;
  $navbar-height: 32px;
  background: -border;
}

/* ��ǩ */
.profile-tags {
  $fontdisplay: flex;
  align-items: center;
  gap: 10px;
  $spacingborder-radius: border-radius: $radius-md;
  flex-wrap: wrap;
}

.tags-title {
  $font-size-xs;
  $colorcolor: color: $color-text-tertiary;
  font-weight: 600;
}

.tags-list { $fontdisplay: flex; gap: 4px; flex-wrap: wrap; }

/* Tabs */
.profile-tabs {
  $fontdisplay: flex;
  gap: 4px;
  $colorbackground: background: $color-card;
  padding: 3px;
  $radiusborder-radius: border-radius: $radius-md;
  $colorborder: $color-border;
  $spacingborder-radius: border-radius: $radius-md;
}

.ptab {
  background: none;
  $colorborder: none;
  padding: 8px 20px;
  $radiusborder-radius: border-radius: $radius-sm;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 500;
  $colorcolor: color: $color-text-secondary;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;

  &.active {
    $color-primary-gradient;
    color: white;
  }

  &:not(.active):$shadow&:hover { $colorcolor: -textcolor: color: $color-primary; }
}

/* �����б� */
.profile-posts { $fontdisplay: flex; flex-direction: column; $spacingborder-radius: border-radius: $radius-md; }

.profile-empty {
  text-align: center;
  padding: 60px 0;
  $colorcolor: color: $color-text-tertiary;

  .pe-icon { $spacingborder-radius: border-radius: $radius-sm; opacity: 0.4; }
  .pe-text { $font-sizeborder-radius: border-radius: $radius-sm; }
}

/* ������ */
.profile-loading {
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  $colorcolor: color: $color-text-tertiary;
  $font-sizeborder-radius: border-radius: $radius-sm;
}

.pl-spinner {
  $sidebar-width: 32px;
  $navbar-height: 32px;
  $colorborder: 3px solid -border;
  border-top-$colorcolor: color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  $spacingborder-radius: border-radius: $radius-md;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
