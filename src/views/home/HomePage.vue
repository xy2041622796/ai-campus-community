<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-bg-pattern"></div>
      <div class="hero-content">
        <div class="hero-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
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
        <button class="tab-btn" :class="{ active: postStore.feedMode === 'recommended' }"
          @click="switchFeedMode('recommended')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
          为你推荐
        </button>
        <button class="tab-btn" :class="{ active: postStore.feedMode === 'latest' }"
          @click="switchFeedMode('latest')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          最新动态
        </button>
      </div>
      <button class="feed-create-btn" @click="router.push('/posts/new')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>发布</span>
      </button>
    </div>

    <!-- 帖子列表 -->
    <!-- AI 话题推荐 -->
    <div v-if="aiTopics.topics.length" class="ai-topics-section">
      <div class="ai-topics-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        <span class="ai-topics-title">{{ aiTopics.quietMode ? '&#x1f4a1; 社区有点冷清，来聊聊这些吧' : '&#x1f525; 热门讨论话题' }}</span>
        <button v-if="!aiTopics.loading" class="ai-topics-refresh" @click="loadTopics">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
        <span v-else class="ai-topics-loading"></span>
      </div>
      <div class="ai-topics-list">
        <div v-for="(topic, idx) in aiTopics.topics.slice(0, 3)" :key="idx" class="ai-topic-card" @click="goCreatePost(topic)">
          <div class="ai-topic-rank">{{ idx + 1 }}</div>
          <div class="ai-topic-body">
            <div class="ai-topic-title">{{ topic.title }}</div>
            <div class="ai-topic-desc">{{ topic.description }}</div>
            <div v-if="topic.tags?.length" class="ai-topic-tags">
              <span v-for="tag in topic.tags" :key="tag" class="ai-topic-tag">{{ tag }}</span>
            </div>
          </div>
          <button class="ai-topic-join" @click.stop="goCreatePost(topic)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            参与讨论
          </button>
        </div>
      </div>
    </div>

    <div v-if="postStore.posts.length" class="feed-list">
      <PostCard v-for="post in postStore.posts" :key="post.id" :post="post" />

      <div v-if="postStore.loading" class="feed-loading">
        <div v-for="i in 3" :key="i" class="skeleton-card">
          <div class="sk-header"><div class="sk-avatar"></div><div class="sk-lines"><div class="sk-line w-40"></div><div class="sk-line w-20"></div></div></div>
          <div class="sk-title"></div><div class="sk-line w-60"></div>
          <div class="sk-media"></div>
        </div>
      </div>

      <!-- 无限滚动触发元素 -->
      <div ref="scrollSentinel" class="scroll-sentinel"></div>

      <div v-if="postStore.loading" class="feed-loading">
        <div class="feed-more-spinner"></div>
        <span>加载更多...</span>
      </div>

      <div v-if="!postStore.hasMore && !postStore.loading" class="feed-end">
        <div class="end-line"></div>
        <span class="end-label">已经到底了</span>
        <div class="end-line"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!postStore.loading" class="feed-empty">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="20" y="30" width="80" height="60" rx="8" fill="rgba(74,108,247,0.06)" stroke="rgba(74,108,247,0.1)" stroke-width="1.5"/>
          <line x1="38" y1="48" x2="82" y2="48" stroke="rgba(74,108,247,0.15)" stroke-width="2" stroke-linecap="round"/>
          <line x1="38" y1="58" x2="70" y2="58" stroke="rgba(74,108,247,0.1)" stroke-width="2" stroke-linecap="round"/>
          <line x1="38" y1="68" x2="60" y2="68" stroke="rgba(74,108,247,0.08)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="60" cy="78" r="3" fill="rgba(74,108,247,0.15)"/>
          <path d="M48 85l12-8 8 5 8-7 8 10" stroke="rgba(74,108,247,0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="empty-title">还没有帖子</h3>
      <p class="empty-desc">成为校园第一个分享动态的人吧</p>
      <button class="empty-btn" @click="router.push('/posts/new')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        发布第一条帖子
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useAITopicsStore } from '@/stores/ai-topics'

const router = useRouter()
const postStore = usePostStore()

const aiTopics = useAITopicsStore()
const scrollSentinel = ref(null)
let scrollObserver = null
const scrollLoading = ref(false)

// 无限滚动：当 sentinel 元素进入视口时加载更多
onMounted(() => {
  postStore.fetchPosts(true)
  loadTopics()

  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && postStore.hasMore && !postStore.loading && !scrollLoading.value) {
      scrollLoading.value = true
      if (postStore.feedMode === 'latest') {
        postStore.fetchPosts()
      } else {
        postStore.fetchPersonalizedFeed()
      }
      // 延迟重置 loading 状态
      setTimeout(() => { scrollLoading.value = false }, 500)
    }
  }, { rootMargin: '200px' })

  // 等待 DOM 渲染后观察 sentinel
  nextTick(() => {
    if (scrollSentinel.value) scrollObserver.observe(scrollSentinel.value)
  })
})

onUnmounted(() => {
  if (scrollObserver) scrollObserver.disconnect()
})
const currentDate = ref(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }))
const heroTitle = ref('校园动态')
const onlineCount = ref(128)


function goCreatePost(topic) {
  sessionStorage.setItem('ai-topic', JSON.stringify(topic))
  router.push('/posts/new')
}

async function loadTopics() {
  await aiTopics.generateTopicSuggestions()
}
function switchFeedMode(mode) {
  postStore.feedMode = mode
  if (mode === 'recommended') postStore.fetchPersonalizedFeed(true)
  else postStore.fetchPosts(true)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

/* AI 话题推荐 */
.ai-topics-section {
  background: white;
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;
}
.ai-topics-section:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

.ai-topics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.ai-topics-header svg { color: #4A6CF7; }
.ai-topics-title { font-weight: 600; font-size: 0.95rem; color: #1a1a2e; flex: 1; }
.ai-topics-refresh {
  background: none; border: none; cursor: pointer; color: #8899aa; padding: 4px;
  transition: transform 0.2s ease;
}
.ai-topics-refresh:hover { color: #4A6CF7; transform: rotate(180deg); }
.ai-topics-loading {
  width: 14px; height: 14px; border: 2px solid #e8ecf1; border-top: 2px solid #4A6CF7;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}

.ai-topics-list { display: flex; flex-direction: column; gap: 8px; }

.ai-topic-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; border-radius: 12px;
  cursor: pointer; transition: background 0.15s ease;
}
.ai-topic-card:hover { background: rgba(74,108,247,0.04); }

.ai-topic-rank {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
  background: rgba(74,108,247,0.08); color: #4A6CF7; flex-shrink: 0;
}
.ai-topic-card:nth-child(1) .ai-topic-rank { background: linear-gradient(135deg,#FFD700,#FFA500); color: white; }
.ai-topic-card:nth-child(2) .ai-topic-rank { background: linear-gradient(135deg,#C0C0C0,#A0A0A0); color: white; }
.ai-topic-card:nth-child(3) .ai-topic-rank { background: linear-gradient(135deg,#CD7F32,#B8860B); color: white; }

.ai-topic-body { flex: 1; min-width: 0; }
.ai-topic-title { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; margin-bottom: 4px; }
.ai-topic-desc { font-size: 0.8rem; color: #667788; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ai-topic-tags { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.ai-topic-tag {
  font-size: 0.65rem; padding: 1px 8px; border-radius: 10px;
  background: rgba(74,108,247,0.08); color: #4A6CF7; font-weight: 500;
}

.ai-topic-join {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 14px; border: none; border-radius: 8px;
  background: linear-gradient(135deg,#4A6CF7,#5EC4AC); color: white;
  font-size: 0.8rem; font-weight: 500; cursor: pointer; flex-shrink: 0;
  transition: all 0.2s ease;
}
.ai-topic-join:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(74,108,247,0.3); }


/* 无限滚动 */
.scroll-sentinel { height: 1px; }

.feed-more-spinner {
  width: 20px; height: 20px;
  border: 2px solid #e8ecf1;
  border-top: 2px solid #4A6CF7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

.feed-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
  color: #8899aa;
  font-size: 0.85rem;
}

.home-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Hero */
.hero-section {
  position: relative;
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-xl;
  padding: 32px;
  margin-bottom: 24px;
  overflow: hidden;
}

.hero-content { position: relative; z-index: 1; }

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: $color-primary-subtle;
  color: $color-primary;
  border-radius: $radius-round;
  font-size: $font-size-xs;
  font-weight: 600;
  margin-bottom: 12px;
}

.hero-title {
  font-family: $font-display;
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-text-primary;
  line-height: 1.25;
  margin-bottom: 8px;
}

.hero-sub {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-dot { opacity: 0.4; }

/* Feed toolbar */
.feed-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.feed-tabs {
  display: flex;
  gap: 4px;
  background: $color-card;
  padding: 3px;
  border-radius: $radius-md;
  border: 1px solid $color-border-light;
}

.tab-btn {
  background: none;
  border: none;
  padding: 7px 18px;
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

.feed-create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: none;
  border-radius: $radius-md;
  background: $color-primary-gradient;
  color: white;
  font-size: $font-size-sm;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-normal;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3); }
  &:active { transform: translateY(0); }
}

/* Feed list - cards stacked with generous spacing */
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Skeleton */
.feed-loading { display: flex; flex-direction: column; gap: 16px; }

.skeleton-card {
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-lg;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-header { display: flex; align-items: center; gap: 10px; }
.sk-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(90deg, $color-border-light 25%, $color-surface 50%, $color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg, $color-border-light 25%, $color-surface 50%, $color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-title { height: 16px; width: 70%; border-radius: 4px; background: linear-gradient(90deg, $color-border-light 25%, $color-surface 50%, $color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-media { height: 120px; border-radius: $radius-md; background: linear-gradient(90deg, $color-border-light 25%, $color-surface 50%, $color-border-light 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w-40 { width: 40%; } .w-60 { width: 60%; } .w-20 { width: 20%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Load more */
.feed-more { text-align: center; padding: 20px 0; }

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 36px;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-card;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-normal;
  &:hover { background: $color-primary-subtle; color: $color-primary; border-color: $color-primary; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
  svg { stroke: currentColor; }
}

.feed-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 0;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
}

.end-line { flex: 1; max-width: 60px; height: 1px; background: $color-border-light; }

/* Empty state */
.feed-empty {
  text-align: center;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-xl;
}

.empty-illustration { margin-bottom: 16px; }

.empty-title {
  font-family: $font-display;
  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: $font-size-base;
  color: $color-text-tertiary;
  margin-bottom: 20px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border: none;
  border-radius: $radius-md;
  background: $color-primary-gradient;
  color: white;
  font-size: $font-size-sm;
  font-weight: 600;
  cursor: pointer;
  transition: $transition-normal;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3); }
  &:active { transform: translateY(0); }
}

@media (max-width: 768px) {
  .hero-section { padding: 20px; border-radius: $radius-md; }
  .hero-title { font-size: $font-size-xl; }
  .feed-empty { border-radius: $radius-md; }
}
</style>
