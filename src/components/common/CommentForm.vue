<template>
  <div class="comment-form">
    <el-input
      v-model="content"
      type="textarea"
      :rows="2"
      :placeholder="replyTo ? '回复 ' + replyTo + '...' : '写下你的评论...'"
      maxlength="500"
      show-word-limit
      resize="none"
    />
    <div class="cf-actions">
      <button v-if="replyTo" class="cf-cancel" @click="('cancelReply')">取消回复</button>
      <button class="cf-submit" :disabled="!content.trim() || submitting" @click="handleSubmit">
        {{ submitting ? '发布中...' : '发布评论' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommentStore } from '@/stores/comment'

const props = defineProps({
  postId: { type: String, required: true },
  replyTo: { type: String, default: null },
  parentId: { type: String, default: null }
})

const emit = defineEmits(['cancelReply', 'created'])

const commentStore = useCommentStore()
const content = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!content.value.trim() || submitting.value) return
  submitting.value = true
  try {
    await commentStore.addComment(props.postId, content.value, props.parentId)
    content.value = ''
    ElMessage.success('评论发布成功')
    emit('created')
  } catch (e) {
    ElMessage.error(e.message || '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.comment-form { display: flex; flex-direction: column; gap: 8px; }
.cf-actions { display: flex; justify-content: flex-end; gap: 8px; }
.cf-cancel {
  padding: 6px 14px; border: $color-border; border-radius: $radius-sm;
  background: $color-card; color: $color-text-secondary; font-size: $font-size-sm;
  cursor: pointer; transition: $transition-fast;
  &:hover { color: $color-primary; border-color: $color-primary; }
}
.cf-submit {
  padding: 6px 18px; border: none; border-radius: $radius-sm;
  background: $color-primary-gradient; color: white; font-size: $font-size-sm;
  font-weight: 600; cursor: pointer; transition: $transition-fast;
  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
