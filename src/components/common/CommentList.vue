<template>
  <div class="comment-list">
    <div v-if="commentStore.loading" class="cl-loading">
      <div class="cl-spinner"></div>
      <span>加载评论中...</span>
    </div>

    <template v-else-if="topLevelComments.length">
      <div v-for="comment in topLevelComments" :key="comment.id" class="comment-item">
        <div class="ci-main">
          <div class="ci-avatar" @click="router.push('/profile/' + comment.author_id)">
            <img v-if="comment.author?.avatar_url" :src="comment.author.avatar_url" />
            <div v-else class="ci-avatar-ph">{{ comment.author?.nickname?.[0] || '?' }}</div>
          </div>
          <div class="ci-body">
            <div class="ci-header">
              <span class="ci-name" @click="router.push('/profile/' + comment.author_id)">{{ comment.author?.nickname || '未知用户' }}</span>
              <span class="ci-time">{{ formatTime(comment.created_at) }}</span>
            </div>
            <div class="ci-content">{{ comment.content }}</div>
            <div class="ci-footer">
              <button class="ci-reply-btn" @click="$emit('reply', comment)">回复</button>
              <button v-if="canDelete(comment)" class="ci-del-btn" @click="handleDelete(comment.id)">删除</button>
            </div>
          </div>
        </div>
        <!-- 子回复 -->
        <div v-if="repliesMap[comment.id]?.length" class="ci-replies">
          <div v-for="reply in repliesMap[comment.id]" :key="reply.id" class="reply-item">
            <div class="ci-avatar ci-avatar-sm" @click="router.push('/profile/' + reply.author_id)">
              <img v-if="reply.author?.avatar_url" :src="reply.author.avatar_url" />
              <div v-else class="ci-avatar-ph">{{ reply.author?.nickname?.[0] || '?' }}</div>
            </div>
            <div class="ci-body">
              <div class="ci-header">
                <span class="ci-name" @click="router.push('/profile/' + reply.author_id)">{{ reply.author?.nickname || '未知用户' }}</span>
                <span class="ci-time">{{ formatTime(reply.created_at) }}</span>
              </div>
              <div class="ci-content">{{ reply.content }}</div>
              <div class="ci-footer">
                <button class="ci-reply-btn" @click="$emit('reply', reply)">回复</button>
                <button v-if="canDelete(reply)" class="ci-del-btn" @click="handleDelete(reply.id)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="cl-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <p>暂无评论，来说点什么吧</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCommentStore } from '@/stores/comment'
import { useAuthStore } from '@/stores/auth'
import { formatTime } from '@/utils/helpers'

defineProps({ postId: { type: String, required: true } })
defineEmits(['reply'])

const router = useRouter()
const commentStore = useCommentStore()
const authStore = useAuthStore()

const topLevelComments = computed(() => commentStore.comments.filter(c => !c.parent_id))

const repliesMap = computed(() => {
  const map = {}
  commentStore.comments.forEach(c => {
    if (c.parent_id) {
      if (!map[c.parent_id]) map[c.parent_id] = []
      map[c.parent_id].push(c)
    }
  })
  return map
})

function canDelete(comment) {
  return authStore.user?.id === comment.author_id
}

async function handleDelete(commentId) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '确认删除', {
      confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
    })
    await commentStore.deleteComment(commentId)
    ElMessage.success('已删除')
  } catch { /* cancelled */ }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.comment-list { display: flex; flex-direction: column; gap: 16px; }
.cl-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 24px 0; color: $color-text-tertiary; font-size: $font-size-sm; }
.cl-spinner { width: 18px; height: 18px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.cl-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 0; color: $color-text-tertiary; font-size: $font-size-sm; }

.comment-item { display: flex; flex-direction: column; gap: 8px; }
.ci-main { display: flex; gap: 10px; }
.ci-avatar { width: 34px; height: 34px; border-radius: 50%; overflow: hidden; flex-shrink: 0; cursor: pointer; }
.ci-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ci-avatar.ci-avatar-sm { width: 28px; height: 28px; }
.ci-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 0.75rem; font-weight: 600; }
.ci-body { flex: 1; min-width: 0; }
.ci-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.ci-name { font-size: $font-size-sm; font-weight: 600; color: $color-primary; cursor: pointer; }
.ci-name:hover { opacity: 0.8; }
.ci-time { font-size: $font-size-xs; color: $color-text-tertiary; }
.ci-content { font-size: $font-size-base; color: $color-text-primary; line-height: $line-height-normal; word-break: break-word; }
.ci-footer { display: flex; gap: 12px; margin-top: 4px; }
.ci-reply-btn, .ci-del-btn { font-size: $font-size-xs; color: $color-text-tertiary; background: none; border: none; cursor: pointer; padding: 0; transition: $transition-fast; }
.ci-reply-btn:hover, .ci-del-btn:hover { color: $color-primary; }
.ci-del-btn:hover { color: $color-danger; }

.ci-replies { margin-left: 44px; padding-left: 12px; border-left: 2px solid $color-border-light; display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }
.reply-item { display: flex; gap: 8px; }
</style>
