<template>
  <div class="detail-page" v-if="post">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="router.back()">
      <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      返回
    </button>

    <article class="detail-card">
      <header class="detail-header">
        <div class="author-area" @click="router.push('/profile/' + post.author_id)">
          <UserAvatar :src="post.author?.avatar_url" :nickname="post.author?.nickname" :size="40" />
          <div class="author-info">
            <div class="author-name">{{ post.author?.nickname || '未知用户' }}</div>
            <div class="meta-row">
              <time>{{ formatTime(post.created_at) }}</time>
              <span v-if="post.tags?.length" class="meta-dot">·</span>
              <span v-if="post.tags?.length" class="meta-tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <div v-if="canEdit" class="author-actions">
          <el-button size="small" @click="router.push('/posts/' + post.id + '/edit')">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete">删除</el-button>
        </div>
      </header>

      <div class="detail-body">
        <h1 class="detail-title">{{ post.title }}</h1>
        <p class="detail-content">{{ post.content }}</p>
      </div>

      <div v-if="post.images?.length" class="detail-images">
        <div v-for="(img, i) in post.images" :key="i" class="detail-image-cell">
          <img :src="img" alt="帖子图片" loading="lazy" @error="handleImageError" />
        </div>
      </div>

      <footer class="detail-footer">
        <div class="detail-actions">
          <button class="dact" :class="{ active: likeStore.isLiked(post.id) }" @click="handleLike">
            <svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" :fill="likeStore.isLiked(post.id) ? '#FF4757' : 'none'" :stroke="likeStore.isLiked(post.id) ? '#FF4757' : 'currentColor'" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>{{ likeCount > 0 ? likeCount : '点赞' }}</span>
          </button>
          <button class="dact" :class="{ active: favoriteStore.isFavorited(post.id) }" @click="handleFavorite">
            <svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" :fill="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'none'" :stroke="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'currentColor'" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>{{ favoriteStore.isFavorited(post.id) ? '已收藏' : '收藏' }}</span>
          </button>
        </div>
      </footer>
    </article>
  </div>

  <div v-else class="detail-loading">
    <div class="dl-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useLikeStore } from '@/stores/like'
import { useFavoriteStore } from '@/stores/favorite'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/common/UserAvatar.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const likeStore = useLikeStore()
const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()

const post = computed(() => postStore.currentPost)
const canEdit = computed(() => authStore.user?.id === post.value?.author_id)
const likeCount = computed(() => likeStore.likeCounts[post.value?.id] || 0)

onMounted(async () => {
  const p = await postStore.fetchPostById(route.params.id)
  if (p && authStore.user?.id) {
    await likeStore.fetchLikedPosts(authStore.user.id)
    await likeStore.fetchLikeCount(p.id)
    await favoriteStore.fetchFavoritedPosts(authStore.user.id)
  }
})

function handleLike() {
  if (!post.value) return
  const before = likeStore.isLiked(post.value.id)
  likeStore.toggleLike(post.value.id)
  if (!before) likeStore.likeCounts[post.value.id] = (likeStore.likeCounts[post.value.id] || 0) + 1
  else likeStore.likeCounts[post.value.id] = Math.$content-max(0, (likeStore.likeCounts[post.value.id] || 1) - 1)
}

function handleFavorite() { if (post.value) favoriteStore.toggleFavorite(post.value.id) }

async function handleDelete() {
  if (!post.value) return
  try {
    await ElMessageBox.confirm('确定要删除这篇帖子吗？', '确认删除', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await postStore.deletePost(post.value.id)
    ElMessage.success('已删除')
    router.push('/')
  } catch { }
}

function handleImageError(e) { e.target.style.$font-display = 'none'; e.target.parentElement.style.$font-display = 'none' }

function formatTime(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.detail-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.back-btn {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-round;
  $colorbackground: background: $color-card;
  $colorcolor: color: $color-text-secondary;
  $font-sizeborder-radius: border-radius: $radius-sm;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;
  $spacingborder-radius: border-radius: $radius-md;

  &:hover {
    $colorcolor: color: $color-primary;
    border-$colorcolor: color: $color-primary;
    $color-primary-soft;
  }

  svg { stroke: currentColor; }
}

.detail-card {
  $colorbackground: background: $color-card;
  $colorborder: $color-border;
  border-radius: $radius-xl;
  padding: 32px;
}

.detail-header {
  $fontdisplay: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: $color$color$color-border-light;
}

.author-area { $fontdisplay: flex; align-items: center; gap: 12px; cursor: pointer; }
.author-info { }
.author-name { font-weight: 600; $fontfont-size: font-size: $font-size-base; $colorcolor: -textcolor: color: $color-primary; &:$shadow&:hover { $colorcolor: color: $color-primary; } }
.meta-row { $fontdisplay: flex; align-items: center; gap: 4px; margin-top: 2px; $font-size-xs; $colorcolor: color: $color-text-tertiary; flex-wrap: wrap; }
.meta-dot { opacity: 0.4; }
.meta-tag { $colorcolor: color: $color-primary; font-weight: 500; }
.author-actions { $fontdisplay: flex; gap: 8px; flex-shrink: 0; }

.detail-body { margin-bottom: 24px; }
.detail-title { $font-display; font-size: 1.35rem; font-weight: 700; $colorcolor: -textcolor: color: $color-primary; line-height: 1.3; margin-bottom: 16px; }
.detail-content { font-size: 1rem; $colorcolor: color: $color-text-secondary; line-height: -height-relaxed; white-space: pre-wrap; }

.detail-images {
  $fontdisplay: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-image-cell {
  $radiusborder-radius: border-radius: $radius-md;
  overflow: hidden;
  $colorbackground: background: $color-surface;

  img { $sidebar-width: 100%; max-height: 500px; object-fit: contain; $fontdisplay: block; }
}

.detail-footer {
  padding-top: 20px;
  border-top: $color$color$color-border-light;
}

.detail-actions {
  $fontdisplay: flex;
  gap: 8px;
}

.dact {
  $fontdisplay: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  $colorborder: $color-border;
  $radiusborder-radius: border-radius: $radius-round;
  $colorbackground: background: $color-card;
  $colorcolor: color: $color-text-secondary;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 500;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;

  &:$shadow&:hover { border-$colorcolor: color: $color-primary; $colorcolor: color: $color-primary; $color-primary-soft; }
  &:active { transform: scale(0.97); }

  &.active { border-color: transparent; }
  &.active:first-child { background: rgba(255, 71, 87, 0.06); color: -heart; }
  &.active:last-child { background: rgba(245, 166, 35, 0.08); color: #F5A623; }
}

.detail-loading {
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  $colorcolor: color: $color-text-tertiary;
}

.dl-spinner {
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
