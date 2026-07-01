<template>
  <div class="ai-assistant" :class="{ open: isOpen }">
    <button class="assistant-trigger" @click="toggle" :class="{ open: isOpen }">
      <svg v-if="!isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/>
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div v-if="isOpen" class="assistant-panel">
      <div class="panel-header">
        <div class="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
          AI 社区助手
        </div>
        <span class="panel-hint">问我任何关于社区的问题</span>
      </div>
      <div v-if="!messages.length" class="quick-questions">
        <button v-for="q in quickQuestions" :key="q" class="quick-q" @click="askQuestion(q)">{{ q }}</button>
      </div>
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
          <div class="msg-avatar" v-if="msg.role === 'assistant'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <div class="msg-content">
            <div class="msg-text">{{ msg.content }}</div>
            <div v-if="msg.results" class="msg-results">
              <div v-for="result in msg.results" :key="result.id" class="result-card" @click="goTo(result)">
                <div class="result-type" :class="result.type">{{ result.type }}</div>
                <div class="result-info">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-desc">{{ result.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="msg-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg></div>
          <div class="msg-content"><div class="msg-text typing">正在搜索社区...</div></div>
        </div>
      </div>
      <div class="panel-input">
        <el-input v-model="input" placeholder="问我任何问题..." @keyup.enter="handleSend" :disabled="loading" size="small" />
        <button class="send-btn" @click="handleSend" :disabled="!input.trim() || loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useEventStore } from '@/stores/event'
import { useRecommendStore } from '@/stores/recommend'

const router = useRouter()
const postStore = usePostStore()
const eventStore = useEventStore()
const recommendStore = useRecommendStore()

const isOpen = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([])
const messagesContainer = ref(null)

const quickQuestions = ['今天有什么活动？', '有没有人打羽毛球？', '有没有 Vue 学习帖子？', '谁会 Python？', '校园里有什么新鲜事？']

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value && !messages.value.length) {
    messages.value.push({ role: 'assistant', content: '你好！我是 AI 社区助手。你可以问我任何关于社区的问题，比如搜索帖子、查找活动、找同学等。' })
  }
}

async function askQuestion(question) {
  input.value = ''
  messages.value.push({ role: 'user', content: question })
  await nextTick()
  if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight

  loading.value = true
  try {
    const results = await searchCommunity(question)
    const answer = generateAnswer(question, results)
    messages.value.push({ role: 'assistant', content: answer, results: results.length ? results.slice(0, 5) : null })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: '抱歉，搜索时出了点问题，请稍后再试。' })
  } finally {
    loading.value = false
    await nextTick()
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function searchCommunity(query) {
  const results = []
  const q = query.toLowerCase()
  if (q.includes('帖子') || q.includes('文章') || q.includes('学习') || q.includes('分享') || q.includes('讨论')) {
    postStore.posts.filter(p => p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q)).slice(0, 3).forEach(p => {
      results.push({ type: '帖子', id: p.id, title: p.title, desc: p.content?.slice(0, 50), path: '/posts/' + p.id })
    })
  }
  if (q.includes('活动') || q.includes('聚会') || q.includes('比赛') || q.includes('烧烤') || q.includes('电影')) {
    try {
      await eventStore.fetchEvents()
      eventStore.events.filter(e => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)).slice(0, 3).forEach(e => {
        results.push({ type: '活动', id: e.id, title: e.title, desc: e.location || e.description?.slice(0, 50), path: '/events/' + e.id })
      })
    } catch (e) {}
  }
  if (q.includes('谁') || q.includes('同学') || q.includes('会') || q.includes('找')) {
    try {
      recommendStore.users.filter(u => u.nickname?.toLowerCase().includes(q) || u.interest_tags?.some(t => q.includes(t))).slice(0, 3).forEach(u => {
        results.push({ type: '用户', id: u.id, title: u.nickname, desc: u.college || u.interest_tags?.join(', '), path: '/profile/' + u.id })
      })
    } catch (e) {}
  }
  if (!results.length) {
    postStore.posts.slice(0, 3).forEach(p => {
      results.push({ type: '推荐', id: p.id, title: p.title, desc: p.content?.slice(0, 50), path: '/posts/' + p.id })
    })
  }
  return results
}

function generateAnswer(query, results) {
  if (!results.length) return '暂时没有找到与"' + query + '"直接相关的内容。你可以试试其他关键词，或者浏览首页看看最新动态。'
  const q = query.toLowerCase()
  if (q.includes('活动')) return '找到 ' + results.length + ' 个相关活动：'
  if (q.includes('帖子') || q.includes('学习') || q.includes('讨论')) return '找到 ' + results.length + ' 篇相关帖子：'
  if (q.includes('谁') || q.includes('同学')) return '找到 ' + results.length + ' 位相关同学：'
  return '为你找到 ' + results.length + ' 条相关内容：'
}

function goTo(result) { router.push(result.path); isOpen.value = false }
function handleSend() { if (input.value.trim()) askQuestion(input.value) }
</script>

<style scoped lang="scss">
.ai-assistant { position: fixed; bottom: 24px; right: 24px; z-index: 1000; }
.assistant-trigger { width: 56px; height: 56px; border-radius: 50%; border: none; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(74,108,247,0.3); transition: all 0.3s ease; &:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(74,108,247,0.4); } &.open { background: #666; transform: rotate(90deg); } }
.assistant-panel { position: absolute; bottom: 70px; right: 0; width: 380px; max-height: 520px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.panel-header { padding: 16px; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); color: white; }
.panel-title { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 1rem; }
.panel-hint { font-size: 0.8rem; opacity: 0.8; }
.quick-questions { padding: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.quick-q { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 20px; background: white; font-size: 0.8rem; color: #4A6CF7; cursor: pointer; transition: all 0.2s ease; &:hover { background: rgba(74,108,247,0.05); border-color: #4A6CF7; } }
.messages { flex: 1; overflow-y: auto; padding: 12px; max-height: 320px; }
.message { display: flex; gap: 8px; margin-bottom: 12px; &.user { flex-direction: row-reverse; .msg-content { background: #4A6CF7; color: white; border-radius: 12px 12px 4px 12px; } } &.assistant .msg-content { background: #f5f7fa; border-radius: 12px 12px 12px 4px; } }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.msg-content { padding: 10px 14px; font-size: 0.85rem; line-height: 1.5; max-width: 80%; }
.typing { color: #999; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.msg-results { margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.result-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; &:hover { border-color: #4A6CF7; background: rgba(74,108,247,0.02); } }
.result-type { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0; &.帖子 { background: rgba(74,108,247,0.1); color: #4A6CF7; } &.活动 { background: rgba(94,196,172,0.1); color: #5EC4AC; } &.用户 { background: rgba(255,107,74,0.1); color: #FF6B4A; } &.推荐 { background: rgba(255,179,71,0.1); color: #FFB347; } }
.result-info { flex: 1; min-width: 0; }
.result-title { font-weight: 500; font-size: 0.8rem; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-desc { font-size: 0.75rem; color: #999; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.panel-input { padding: 12px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
.panel-input :deep(.el-input__wrapper) { border-radius: 20px; border: 1px solid #e2e8f0; }
.send-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: #4A6CF7; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s ease; &:hover { background: #3d5ce5; } &:disabled { background: #ccc; cursor: not-allowed; } }
@media (max-width: 768px) { .assistant-panel { width: calc(100vw - 32px); right: -8px; bottom: 64px; } }
</style>