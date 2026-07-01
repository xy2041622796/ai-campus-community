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
      <button class="cf-ai-btn" :disabled="!postContent || suggestLoading" @click="suggestReply">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        AI 建议
      </button>
      <button v-if="replyTo" class="cf-cancel" @click="$emit('cancelReply')">取消回复</button>
      <button class="cf-submit" :disabled="!content.trim() || submitting" @click="handleSubmit">
        {{ submitting ? '发布中...' : '发布评论' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommentStore } from '@/stores/comment'

const props = defineProps({
  postId: { type: String, required: true },
  replyTo: { type: String, default: null },
    postContent: { type: String, default: '' },
  parentId: { type: String, default: null }
})

const emit = defineEmits(['cancelReply', 'created'])

const commentStore = useCommentStore()
const content = ref('')
const submitting = ref(false)
const suggestLoading = ref(false)

// Clear content when switching reply target
watch(() => props.parentId, () => { content.value = '' })

async function suggestReply() {
  if (!props.postContent || suggestLoading.value) return
  suggestLoading.value = true
  try {
    const prompt = props.replyTo
      ? '有人评论了"' + props.replyTo + '"，请生成一个简短友好的回复建议，20字以内。'
      : '以下是一篇校园帖子，请生成一个简短有趣的评论，20字以内。帖子内容：' + props.postContent.slice(0, 200)

    const res = await fetch('/agnes/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [{ role: 'user', content: prompt }]
      })
    })
    if (res.ok) {
      const data = await res.json()
      const suggestion = data.choices?.[0]?.message?.content
      if (suggestion) content.value = suggestion.replace(/^["']|["']$/g, '')
    }
  } catch (e) {
    console.error('[Comment] AI suggestion failed:', e)
  } finally {
    suggestLoading.value = false
  }
}

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
.cf-ai-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #5EC4AC, #4A6CF7);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  svg { stroke: currentColor; }
}
.cf-submit {
  padding: 6px 18px; border: none; border-radius: $radius-sm;
  background: $color-primary-gradient; color: white; font-size: $font-size-sm;
  font-weight: 600; cursor: pointer; transition: $transition-fast;
  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>



