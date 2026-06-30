<template>
  <article class="post-card" @click="router.push('/posts/' + post.id)">
    <!-- 作者信息 -->
    <div class="card-header">
      <div class="author-area" @click.stop="router.push('/profile/' + post.author_id)">
        <UserAvatar :src="post.author?.avatar_url" :nickname="post.author?.nickname" :size="34" />
        <div class="author-info">
          <div class="author-name">{{ post.author?.nickname || '未知用户' }}</div>
          <div class="meta-row">
            <time>{{ formatTime(post.created_at) }}</time>
            <span v-if="post.tags?.length" class="meta-dot">·</span>
            <span v-if="post.tags?.length" class="meta-tag">{{ post.tags[0] }}</span>
          </div>
        </div>

    <!-- AI 结构化标签 -->
    <div v-if="post.intent || post.emotion || post.summary" class="card-ai-badges">
      <span v-if="post.intent" class="ai-badge intent-badge"> {{ intentLabel(post.intent) }} </span>
      <span v-if="post.emotion" class="ai-badge emotion-badge" v-html="emotionEmoji(post.emotion)"></span>

    </div>

    <!-- AI 匹配度标签 -->
    <div v-if="post.rank_score != null && post.rank_score > 0" class="card-match-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
      <span>AI 匹配 {{ (post.rank_score * 10).toFixed(0) }}%</span>
    </div>

      </div>
    </div>

    <!-- 正文 -->
    <div class="card-body">
      <h3 class="card-title">{{ post.title }}</h3>
      <p v-if="post.content" class="card-desc">{{ post.content }}</p>
    </div>

    <!-- 图片 -->
    <div v-if="post.images?.length" class="card-media" :class="'grid-' + Math.min(post.images.length, 3)">
      <div
        v-for="(img, i) in post.images.slice(0, post.images.length === 1 ? 1 : 3)"
        :key="i"
        class="media-cell"
        :class="{ 'single': post.images.length === 1 }"
      >
        <img :src="img" loading="lazy" @error="handleImageError" @click.stop />
      </div>
      <div v-if="post.images.length > 3" class="media-cell media-more" @click.stop>
        <span class="more-count">+{{ post.images.length - 3 }}</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="card-footer">
      <button class="action-btn like-btn" :class="{ active: likeStore.isLiked(post.id) }" @click.stop="handleLike">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="likeStore.isLiked(post.id) ? '#FF4757' : 'none'" :stroke="likeStore.isLiked(post.id) ? '#FF4757' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="action-label">{{ likeCount > 0 ? likeCount : '点赞' }}</span>
      </button>

      <button class="action-btn" @click.stop>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="action-label">{{ 0 > 0 ? 0 : '评论' }}</span>
      </button>

      <button class="action-btn fav-btn" :class="{ active: favoriteStore.isFavorited(post.id) }" @click.stop="handleFavorite">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'none'" :stroke="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span class="action-label">收藏</span>
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLikeStore } from '@/stores/like'
import { useFavoriteStore } from '@/stores/favorite'
import UserAvatar from '@/components/common/UserAvatar.vue'

const props = defineProps({ post: { type: Object, required: true } })
const router = useRouter()
const likeStore = useLikeStore()
const favoriteStore = useFavoriteStore()

const likeCount = computed(() => likeStore.likeCounts[props.post.id] || 0)

onMounted(() => {
  if (likeStore.likeCounts[props.post.id] === undefined) {
    likeStore.fetchLikeCount(props.post.id)
  }
})

function handleLike() {
  const before = likeStore.isLiked(props.post.id)
  likeStore.toggleLike(props.post.id)
  if (!before) likeStore.likeCounts[props.post.id] = (likeStore.likeCounts[props.post.id] || 0) + 1
  else likeStore.likeCounts[props.post.id] = Math.max(0, (likeStore.likeCounts[props.post.id] || 1) - 1)
}

function handleFavorite() { favoriteStore.toggleFavorite(props.post.id) }

function handleImageError(e) { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none' }


// AI 结构化标签辅助函数
function intentLabel(intent) {
  const map = { '分享': '分享', '求助': '求助', '吐槽': '吐槽', '招募': '招募', '交易': '交易' }
  return map[intent] || intent
}
function emotionEmoji(emotion) {
  // 用 SVG 图标代替 emoji
  const icons = {
    'positive': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    'negative': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 17s1.5-2 4-2 4 2 4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    'neutral': '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9E9E9E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
  }
  return icons[emotion] || icons.neutral
}
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const m = Math.floor(diff / 60000); const h = Math.floor(diff / 3600000); const d = Math.floor(diff / 86400000)
  if (m < 1) return '刚刚'
  if (m < 60) return m + '分钟前'
  if (h < 24) return h + '小时前'
  if (d < 7) return d + '天前'
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.post-card {
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  padding: 20px 20px 20px 24px;
  transition: all 0.2s ease;
  position: relative;

  /* Card accent bar */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 16px;
    bottom: 16px;
    width: 4px;
    background: $color-primary-gradient;
    border-radius: 0 3px 3px 0;
    opacity: 0.3;
    transition: opacity 0.2s ease;
  }

  &:hover {
    box-shadow: $shadow-hover;
    border-color: $color-border;
    transform: translateY(-1px);
    &::before { opacity: 1; }
  }
}

.author-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.author-info { flex: 1; min-width: 0; }

.author-name {
  font-weight: 600;
  font-size: $font-size-sm;
  color: $color-text-primary;
  &:hover { color: $color-primary; }
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: $font-size-xs;
  color: $color-text-tertiary;
}

.meta-dot { opacity: 0.4; }
.meta-tag { color: $color-primary; font-weight: 500; }

.card-body { margin-bottom: 12px; }

.card-title {
  font-family: $font-display;
  font-size: 1.05rem;
  font-weight: 650;
  color: $color-text-primary;
  line-height: $line-height-tight;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: $font-size-base;
  color: $color-text-tertiary;
  line-height: $line-height-normal;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-media {
  display: grid;
  gap: 3px;
  margin-bottom: 12px;
  border-radius: $radius-md;
  overflow: hidden;
  &.grid-1 { grid-template-columns: 1fr; }
  &.grid-2 { grid-template-columns: 1fr 1fr; }
  &.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
}

.media-cell {
  aspect-ratio: 16/9;
  overflow: hidden;
  background: $color-surface;
  border-radius: 2px;
  &.single { aspect-ratio: 16/9; max-height: 300px; }
  img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
  &:hover img { transform: scale(1.08); }
}

.media-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.04);
  position: relative;
  .more-count { font-size: 1.2rem; font-weight: 700; color: $color-text-tertiary; }
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid $color-border-light;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;

  &:hover { background: $color-primary-subtle; color: $color-primary; }
  &:active { transform: scale(0.88); }

  &.like-btn.active {
    color: $color-heart;
    background: rgba(255, 71, 87, 0.06);
    animation: likePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  &.fav-btn.active {
    color: #F5A623;
    background: rgba(245, 166, 35, 0.08);
    animation: likePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  svg { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
  &.active svg { transform: scale(1.15); }
}

@keyframes likePop {
  0% { transform: scale(1); }
  30% { transform: scale(1.12); }
  60% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.action-label { font-weight: 500; }

/* AI 结构化标签 */
.card-ai-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.ai-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.intent-badge { background: rgba(74, 108, 247, 0.1); color: #4A6CF7; }
.emotion-badge { background: rgba(94, 196, 172, 0.1); color: #5EC4AC; }


/* AI 匹配度标签 */
.card-match-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.1), rgba(94, 196, 172, 0.1));
  border: 1px solid rgba(74, 108, 247, 0.2);
  border-radius: 12px;
  font-size: 0.7rem;
  color: #4A6CF7;
  font-weight: 600;
  margin-top: 6px;
}
.card-match-badge svg { stroke: #4A6CF7; }
</style>
