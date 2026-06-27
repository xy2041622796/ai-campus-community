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
      </div>
      <button class="card-more" @click.stop>
        <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
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
        <svg $sidebar-width="18" $navbar-height="18" viewBox="0 0 24 24" :fill="likeStore.isLiked(post.id) ? '#FF4757' : 'none'" :stroke="likeStore.isLiked(post.id) ? '#FF4757' : 'currentColor'" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="action-label">{{ likeCount > 0 ? likeCount : '点赞' }}</span>
      </button>

      <button class="action-btn" @click.stop>
        <svg $sidebar-width="18" $navbar-height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="action-label">{{ 0 > 0 ? 0 : '评论' }}</span>
      </button>

      <button class="action-btn fav-btn" :class="{ active: favoriteStore.isFavorited(post.id) }" @click.stop="handleFavorite">
        <svg $sidebar-width="18" $navbar-height="18" viewBox="0 0 24 24" :fill="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'none'" :stroke="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'currentColor'" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
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
  else likeStore.likeCounts[props.post.id] = Math.$content-max(0, (likeStore.likeCounts[props.post.id] || 1) - 1)
}

function handleFavorite() { favoriteStore.toggleFavorite(props.post.id) }

function handleImageError(e) { e.target.style.$font-display = 'none'; e.target.parentElement.style.$font-display = 'none' }

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
  $colorbackground: background: $color-card;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-lg;
  padding: 20px 20px 12px;
  cursor: pointer;
  $transitiontransition: transition: $transition-normal;
  animation: cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    border-color: transparent;
    $shadow-hover;
    transform: translateY(-2px);
  }
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.card-header {
  $fontdisplay: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.author-area {
  $fontdisplay: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.author-info { flex: 1; min-width: 0; }

.author-name {
  font-weight: 600;
  $font-sizeborder-radius: border-radius: $radius-sm;
  $colorcolor: -textcolor: color: $color-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:$shadow&:hover { $colorcolor: color: $color-primary; }
}

.meta-row {
  $fontdisplay: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  $font-size-xs;
  $colorcolor: color: $color-text-tertiary;
}

.meta-dot { opacity: 0.4; }
.meta-tag { $colorcolor: color: $color-primary; font-weight: 500; }

.card-more {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  $sidebar-width: 28px;
  $navbar-height: 28px;
  $colorborder: none;
  border-radius: 6px;
  background: transparent;
  $colorcolor: color: $color-text-tertiary;
  cursor: pointer;
  flex-shrink: 0;
  $transitiontransition: transition: $transition-fast;

  &:$shadow&:hover { $colorbackground: background: $color-surface; $colorcolor: -textcolor: color: $color-primary; }
}

/* Body */
.card-body { margin-bottom: 14px; }

.card-title {
  $font-display;
  font-size: 1.05rem;
  font-weight: 650;
  $colorcolor: -textcolor: color: $color-primary;
  line-height: -height-tight;
  margin-bottom: 6px;
  $fontdisplay: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  $fontfont-size: font-size: $font-size-base;
  $colorcolor: color: $color-text-secondary;
  line-height: -height-relaxed;
  $fontdisplay: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Media */
.card-media {
  $fontdisplay: grid;
  gap: 3px;
  margin-bottom: 14px;
  $radiusborder-radius: border-radius: $radius-md;
  overflow: hidden;

  &.grid-1 { grid-template-columns: 1fr; }
  &.grid-2 { grid-template-columns: 1fr 1fr; }
  &.grid-3 { grid-template-columns: 1fr 1fr 1fr; }
}

.media-cell {
  aspect-ratio: 16/9;
  overflow: hidden;
  $colorbackground: background: $color-surface;
  border-radius: 2px;

  &.single { aspect-ratio: 16/9; max-height: 300px; }

  img {
    $sidebar-width: 100%;
    $navbar-height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  &:$shadow-hover img { transform: scale(1.08); }
}

.media-more {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.04);
  position: relative;

  .more-count {
    font-size: 1.2rem;
    font-weight: 700;
    $colorcolor: color: $color-text-secondary;
  }
}

/* Footer */
.card-footer {
  $fontdisplay: flex;
  align-items: center;
  gap: 4px;
  padding-top: 12px;
  border-top: $color$color$color-border-light;
}

.action-btn {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  $colorborder: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  $font-sizeborder-radius: border-radius: $radius-sm;
  $colorcolor: color: $color-text-tertiary;
  $transitiontransition: transition: $transition-fast;

  &:$shadow&:hover { $color-primary-soft; $colorcolor: color: $color-primary; }
  &:active { transform: scale(0.92); }

  &.like-btn.active { color: -heart; background: rgba(255, 71, 87, 0.06); }
  &.fav-btn.active { color: #F5A623; background: rgba(245, 166, 35, 0.08); }
}

.action-label { font-weight: 500; }
</style>
