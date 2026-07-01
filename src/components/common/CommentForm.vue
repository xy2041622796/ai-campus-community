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
    <!-- AI 一键回复 -->
    <div v-if="quickReplies.length" class="quick-replies">
      <span class="qr-label">AI 推荐回复：</span>
      <button
        v-for="(reply, idx) in quickReplies"
        :key="idx"
        class="qr-chip"
        @click="useQuickReply(reply)"
      >
        {{ reply }}
      </button>
    </div>
    <div class="cf-actions">
      <button class="cf-ai-btn" :disabled="!postContent || suggestLoading" @click="suggestReplies">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        {{ suggestLoading ? '生成中...' : 'AI 推荐回复' }}
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
const quickReplies = ref([])

watch(() => props.parentId, () => { content.value = ''; quickReplies.value = [] })

function useQuickReply(reply) {
  content.value = reply
}

async function suggestReplies() {
  if (!props.postContent || suggestLoading.value) return
  suggestLoading.value = true
  quickReplies.value = []
  try {
    const prompt = props.replyTo
      ? `有人评论了"${props.replyTo}"。请生成3条不同风格的简短回复建议（每条15字以内），风格分别是：1.表示赞同 2.追问细节 3.轻松幽默。只返回JSON数组，如["回复1","回复2","回复3"]。`
      : `以下是一篇校园帖子，请生成3条不同风格的简短评论建议（每条15字以内），风格分别是：1.表示共鸣 2.提问互动 3.轻松调侃。帖子内容：${props.postContent.slice(0, 200)}。只返回JSON数组，如["评论1","评论2","评论3"]。`

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
      const raw = data.choices?.[0]?.message?.content || '[]'
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      try {
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) quickReplies.value = parsed.slice(0, 3)
      } catch {}
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
    quickReplies.value = []
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

/* AI 一键回复 */
.quick-replies {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0;
}
.qr-label {
  font-size: 0.8rem;
  color: #667788;
  flex-shrink: 0;
}
.qr-chip {
  padding: 5px 12px;
  border: 1px solid rgba(74, 108, 247, 0.2);
  border-radius: 20px;
  background: rgba(74, 108, 247, 0.04);
  color: #4A6CF7;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(74, 108, 247, 0.1);
    border-color: #4A6CF7;
    transform: translateY(-1px);
  }
  &:active {
    transform: scale(0.95);
  }
}
</style>