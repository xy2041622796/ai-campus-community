<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="hero-content">
        <div class="hero-chip">
          <svg $sidebar-width="14" $navbar-height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          校园动态
        </div>
        <h1 class="hero-title">{{ heroTitle }}</h1>
        <p class="hero-sub">
          <span class="hero-stat">🔥 {{ onlineCount }} 人在线</span>
          <span class="hero-dot">·</span>
          <span>{{ currentDate }}</span>
        </p>
      </div>
      <div class="hero-glow"></div>
    </div>

    <!-- Feed 工具栏 -->
    <div class="feed-toolbar">
      <div class="feed-tabs">
        <button v-for="tab in feedTabs" :key="tab.key"
          class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>
      <button class="feed-create-btn" @click="router.push('/posts/new')">
        <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>发布</span>
      </button>
    </div>

    <!-- 帖子列表 -->
    <div v-if="postStore.posts.length" class="feed-list">
      <PostCard v-for="post in postStore.posts" :key="post.id" :post="post" />

      <div v-if="postStore.loading" class="feed-loading">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-header"><div class="sk-avatar"></div><div class="sk-lines"><div class="sk-line w-40"></div><div class="sk-line w-20"></div></div></div>
          <div class="sk-title"></div><div class="sk-line w-60"></div>
          <div class="sk-media"></div>
        </div>
      </div>

      <div v-if="postStore.hasMore && !postStore.loading" class="feed-more">
        <button class="more-btn" @click="postStore.fetchPosts()">
          <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polyline points="6 9 12 15 18 9"/></svg>
          加载更多
        </button>
      </div>

      <div v-else-if="!postStore.loading" class="feed-end">
        <div class="end-line"></div>
        <span class="end-label">已经到底了</span>
        <div class="end-line"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!postStore.loading" class="feed-empty">
      <div class="empty-illustration">
        <svg $sidebar-width="120" $navbar-height="120" viewBox="0 0 120 120" fill="none">
          <rect x="20" y="30" $sidebar-width="80" $navbar-height="60" rx="8" fill="rgba(74,108,247,0.06)" stroke="rgba(74,108,247,0.1)" stroke-width="1.5"/>
          <line x1="38" y1="48" x2="82" y2="48" stroke="rgba(74,108,247,0.15)" stroke-width="2" stroke-linecap="$radius-round"/>
          <line x1="38" y1="58" x2="70" y2="58" stroke="rgba(74,108,247,0.1)" stroke-width="2" stroke-linecap="$radius-round"/>
          <line x1="38" y1="68" x2="60" y2="68" stroke="rgba(74,108,247,0.08)" stroke-width="2" stroke-linecap="$radius-round"/>
          <circle cx="60" cy="78" r="3" fill="rgba(74,108,247,0.15)"/>
          <path d="M48 85l12-8 8 5 8-7 8 10" stroke="rgba(74,108,247,0.2)" stroke-width="1.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"/>
        </svg>
      </div>
      <h3 class="empty-title">还没有帖子</h3>
      <p class="empty-desc">成为校园第一个分享动态的人吧</p>
      <button class="empty-btn" @click="router.push('/posts/new')">
        <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        发布第一条帖子
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useLikeStore } from '@/stores/like'
import { useFavoriteStore } from '@/stores/favorite'
import { useAuthStore } from '@/stores/auth'
import PostCard from '@/components/common/PostCard.vue'

const router = useRouter()
const postStore = usePostStore()
const likeStore = useLikeStore()
const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()

const activeTab = ref('latest')
const feedTabs = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
  { key: 'following', label: '关注' },
]

const onlineCount = computed(() => Math.floor(Math.random() * 50 + 12))

const currentDate = computed(() => {
  const now = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return ${now.getFullYear()}年月日 周
})

const heroTitle = computed(() => {
  const messages = [
    '「期末周图书馆占座攻略」',
    '「校园周边美食大搜罗」',
    '「社团招新季来啦！」',
    '「你的校园生活 AI 助手」',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
})

onMounted(async () => {
  await postStore.fetchPosts(true)
  if (authStore.user?.id) {
    likeStore.fetchLikedPosts(authStore.user.id)
    favoriteStore.fetchFavoritedPosts(authStore.user.id)
    if (postStore.posts.length) likeStore.fetchLikeCounts(postStore.posts.map(p => p.id))
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.home-page {
  animation: pageFadeIn 0.4s ease;
}

@keyframes pageFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Hero ===== */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #4A6CF7 0%, #5EC4AC 50%, #3B82F6 100%);
  border-radius: $radius-xl;
  padding: 32px 32px 36px;
  color: white;
  $spacingborder-radius: border-radius: $radius-lg;
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image:
    radial-gradient(circle at 20% 40%, white 2px, transparent 2px),
    radial-gradient(circle at 70% 80%, white 1.5px, transparent 1.5px),
    radial-gradient(circle at 50% 20%, white 1px, transparent 1px);
  background-size: 40px 40px, 60px 60px, 50px 50px;
}

.hero-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  $sidebar-width: 350px;
  $navbar-height: 350px;
  background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; }

.hero-chip {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  $font-size-xs;
  font-weight: 600;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  padding: 5px 14px;
  $radiusborder-radius: border-radius: $radius-round;
  $spacingborder-radius: border-radius: $radius-md;
  letter-spacing: 0.3px;

  svg { stroke: currentColor; }
}

.hero-title {
  $font-display;
  font-size: $font-size-3xl;
  font-weight: 700;
  $spacingborder-radius: border-radius: $radius-sm;
  line-height: 1.25;
}

.hero-sub {
  $font-sizeborder-radius: border-radius: $radius-sm;
  opacity: 0.85;
  $fontdisplay: flex;
  align-items: center;
  gap: 6px;
}

.hero-dot { opacity: 0.4; }

/* ===== Feed 工具栏 ===== */
.feed-toolbar {
  $fontdisplay: flex;
  align-items: center;
  justify-content: space-between;
  $spacingborder-radius: border-radius: $radius-lg;
}

.feed-tabs {
  $fontdisplay: flex;
  gap: 4px;
  $colorbackground: background: $color-card;
  padding: 3px;
  $radiusborder-radius: border-radius: $radius-md;
  $colorborder: $color-border;
  $shadowborder-radius: border-radius: $radius-sm;
}

.tab-btn {
  background: none;
  $colorborder: none;
  padding: 7px 18px;
  $radiusborder-radius: border-radius: $radius-sm;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 500;
  $colorcolor: color: $color-text-secondary;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;

  &.active {
    $color-primary-gradient;
    color: white;
    $shadowborder-radius: border-radius: $radius-sm;
  }

  &:not(.active):$shadow&:hover { $colorcolor: -textcolor: color: $color-primary; }
}

.feed-create-btn {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  $colorborder: none;
  $radiusborder-radius: border-radius: $radius-md;
  $color-primary-gradient;
  color: white;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 600;
  cursor: pointer;
  $transitiontransition: transition: $transition-normal;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3);
  }

  &:active { transform: translateY(0); }
}

/* ===== Feed 列表 ===== */
.feed-list { $fontdisplay: flex; flex-direction: column; $spacingborder-radius: border-radius: $radius-md; }

/* 骨架屏 */
.feed-loading { $fontdisplay: flex; flex-direction: column; $spacingborder-radius: border-radius: $radius-md; }

.skeleton-card {
  $colorbackground: background: $color-card;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-lg;
  padding: 20px;
  $fontdisplay: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-header { $fontdisplay: flex; align-items: center; gap: 10px; }
.sk-avatar { $sidebar-width: 34px; $navbar-height: 34px; border-radius: 50%; background: linear-gradient(90deg, $color$color-border-light 25%, -surface 50%, $color$color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-lines { flex: 1; $fontdisplay: flex; flex-direction: column; gap: 6px; }
.sk-line { $navbar-height: 10px; border-radius: 4px; background: linear-gradient(90deg, $color$color-border-light 25%, -surface 50%, $color$color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-title { $navbar-height: 16px; $sidebar-width: 70%; border-radius: 4px; background: linear-gradient(90deg, $color$color-border-light 25%, -surface 50%, $color$color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-media { $navbar-height: 120px; $radiusborder-radius: border-radius: $radius-sm; background: linear-gradient(90deg, $color$color-border-light 25%, -surface 50%, $color$color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w-40 { $sidebar-width: 40%; } .w-60 { $sidebar-width: 60%; } .w-20 { $sidebar-width: 20%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 加载更多 */
.feed-more { text-align: center; $spacingpadding: $spacing-md 0 border-radius: border-radius: $radius-lg; }

.more-btn {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 36px;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-round;
  $colorbackground: background: $color-card;
  $colorcolor: color: $color-text-secondary;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 500;
  cursor: pointer;
  $transitiontransition: transition: $transition-normal;

  &:$shadow&:hover {
    $colorbackground: background: $color-surface;
    $colorcolor: color: $color-primary;
    border-$colorcolor: color: $color-primary;
    transform: translateY(-1px);
  }

  &:active { transform: translateY(0); }

  svg { stroke: currentColor; }
}

.feed-end {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  $spacingpadding: $spacing-lg 0;
  $colorcolor: color: $color-text-tertiary;
  $font-sizeborder-radius: border-radius: $radius-sm;
}

.end-line { flex: 1; max-width: 60px; $navbarbackground: -border; background: -border; }

/* ===== Empty ===== */
.feed-empty {
  text-align: center;
  padding: 80px 20px;
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  $spacingborder-radius: border-radius: $radius-md;
}

.empty-illustration { $spacingborder-radius: border-radius: $radius-sm; }

.empty-title {
  $font-display;
  $fontfont-size: font-size: $font-size-xl;
  font-weight: 700;
  $colorcolor: -textcolor: color: $color-primary;
}

.empty-desc {
  $fontfont-size: font-size: $font-size-base;
  $colorcolor: color: $color-text-secondary;
}

.empty-btn {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  $colorborder: none;
  $radiusborder-radius: border-radius: $radius-md;
  $color-primary-gradient;
  color: white;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 600;
  cursor: pointer;
  $transitiontransition: transition: $transition-normal;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);

  &:$shadow&:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3);
  }

  &:active { transform: translateY(0); }
}
</style>
