<template>
  <div class="post-detail-root">
    <div class="detail-page" v-if="post">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="likeStore.isLiked(post.id) ? '#FF4757' : 'none'" :stroke="likeStore.isLiked(post.id) ? '#FF4757' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>{{ likeCount > 0 ? likeCount : '点赞' }}</span>
          </button>
          <button class="dact" :class="{ active: favoriteStore.isFavorited(post.id) }" :disabled="favoriteStore.toggling" @click="handleFavorite">
            <svg width="20" height="20" viewBox="0 0 24 24" :fill="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'none'" :stroke="favoriteStore.isFavorited(post.id) ? '#F5A623' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>{{ favoriteStore.isFavorited(post.id) ? '已收藏' : '收藏' }}</span>
          </button>
        </div>
      </footer>
    </article>

    <!-- 评论区 -->
    <section class="comment-section">
      <h3 class="comment-heading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        评论 ({{ commentStore.comments.length }})
      </h3>
      <div v-if="replyTo" class="reply-indicator">
        <span>回复复 @{{ replyTo.author?.nickname }}</span>
        <button @click="cancelReply">取消回复</button>
      </div>
      <CommentForm :key="replyTo ? replyTo.id : 'default'" :post-id="post.id" :post-content="post.content" :reply-to="replyTo?.author?.nickname" :parent-id="replyTo?.id" @created="onCommentCreated" @cancel-reply="cancelReply" />
      <CommentList :post-id="post.id" @reply="handleReply" />
    </section>
    </div>
    <div v-else class="detail-loading">
    <div class="dl-spinner"></div>
    <p>加载中...</p>
  </div>
  <ImagePreview :src="previewSrc" :visible="previewVisible" :images="post?.images" v-model:current-index="previewIndex" @close="previewVisible = false" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePostStore } from '@/stores/post'
import { useLikeStore } from '@/stores/like'
import { useFavoriteStore } from '@/stores/favorite'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import UserAvatar from '@/components/common/UserAvatar.vue'
import CommentForm from '@/components/common/CommentForm.vue'
import CommentList from '@/components/common/CommentList.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const likeStore = useLikeStore()
const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()
const commentStore = useCommentStore()

const replyTo = ref(null)

const post = computed(() => postStore.currentPost)
const canEdit = computed(() => authStore.user?.id === post.value?.author_id)
const likeCount = computed(() => likeStore.likeCounts[post.value?.id] || 0)

onMounted(async () => {
  const p = await postStore.fetchPostById(route.params.id)
  if (p) {
    if (authStore.user?.id) {
      await likeStore.fetchLikedPosts(authStore.user.id)
      await likeStore.fetchLikeCount(p.id)
      await favoriteStore.fetchFavoritedPosts(authStore.user.id)
    }
    await commentStore.fetchComments(p.id)
  }
})

async function handleLike() {
  if (!post.value) return
  await likeStore.toggleLike(post.value.id)
  await likeStore.fetchLikeCount(post.value.id)
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

function handleImageError(e) { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none' }

function handleReply(comment) {
  replyTo.value = comment
}

function cancelReply() {
  replyTo.value = null
}

function onCommentCreated() {
  replyTo.value = null
  commentStore.fetchComments(post.value.id)
}

const previewVisible = ref(false)
const previewSrc = ref('')
const previewIndex = ref(0)

function openImage(src, idx) { previewSrc.value = src; previewIndex.value = idx; previewVisible.value = true }

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
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border: $color-border; border-radius: $radius-md;
  background: $color-card; color: $color-text-secondary; cursor: pointer; transition: $transition-fast;
  &:hover { border-color: $color-primary; color: $color-primary; }
  svg { stroke: currentColor; }
}
.detail-card { background: $color-card; border: $color-border; border-radius: $radius-xl; padding: 32px; }
.detail-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px; padding-bottom: 20px; border-bottom: $color-border-light;
}
.author-area { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.author-name { font-weight: 600; font-size: $font-size-base; color: $color-primary; }
.meta-row { display: flex; align-items: center; gap: 4px; margin-top: 2px; color: $color-text-tertiary; flex-wrap: wrap; }
.meta-dot { opacity: 0.4; }
.meta-tag { color: $color-primary; font-weight: 500; }
.author-actions { display: flex; gap: 8px; flex-shrink: 0; }
.detail-body { margin-bottom: 24px; }
.detail-title { font-family: $font-display; font-size: 1.35rem; font-weight: 700; color: $color-text-primary; line-height: 1.3; margin-bottom: 16px; }
.detail-content { font-size: 1rem; color: $color-text-secondary; line-height: $line-height-relaxed; white-space: pre-wrap; }
.detail-images { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.detail-image-cell { width: 100%; max-height: 500px; }
.detail-image-cell img { width: 100%; max-height: 500px; object-fit: cover; display: block; border-radius: $radius-md; }
.detail-footer { padding-top: 20px; border-top: $color-border-light; }
.detail-actions { display: flex; gap: 8px; }
.dact {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: $color-border; border-radius: $radius-round;
  background: $color-card; color: $color-text-secondary; font-weight: 500; cursor: pointer; transition: $transition-fast;
  &:hover { border-color: $color-primary; color: $color-primary; }
  &:active { transform: scale(0.97); }
  &.active { border-color: transparent; }
  &.active:first-child { background: rgba(255, 71, 87, 0.06); color: $color-heart; }
  &.active:last-child { background: rgba(245, 166, 35, 0.08); color: #F5A623; }
}
.detail-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; color: $color-text-tertiary; }
.dl-spinner { width: 32px; height: 32px; border: 3px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.comment-section {
  margin-top: 20px; background: $color-card; border: $color-border;
  border-radius: $radius-xl; padding: 24px 32px; display: flex; flex-direction: column; gap: 16px;
}
.comment-heading { display: flex; align-items: center; gap: 8px; font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 0; }
.comment-heading svg { color: $color-primary; }
.comment-count { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; padding: 0 6px; font-size: $font-size-xs; font-weight: 600; color: white; background: $color-primary-gradient; border-radius: $radius-round; }

/* Reply indicator */
.reply-indicator {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; background: $color-primary-subtle; border-radius: $radius-md;
  font-size: $font-size-sm; color: $color-primary;
}
.reply-indicator button {
  background: none; border: none; color: $color-text-tertiary; cursor: pointer; font-size: $font-size-xs;
  &:hover { color: $color-danger; }
}

@media (max-width: 768px) {
  .detail-card, .comment-section { padding: 20px; border-radius: $radius-md; }
}
</style>









