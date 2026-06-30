<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="search-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        搜索结果
      </h1>
      <div class="search-mode-bar">
          <el-button size="small" :type="aiMode ? 'primary' : 'default'" @click="toggleAIMode">{{ aiMode ? 'AI智能搜索' : '关键词搜索' }}</el-button>
        </div>
        <div class="search-input-wrap">
        <el-input v-model="query" placeholder="搜索帖子或用户..." size="large" clearable @keyup.enter="doSearch" />
      </div>
    </div>

    <div v-if="aiSummary" class="search-summary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span class="summary-label">AI 摘要：</span>
      <span class="summary-text">{{ aiSummary }}</span>
    </div>
    <div v-if="loading" class="search-loading">
      <div class="sl-spinner"></div>
      <span>搜索中...</span>
    </div>

    <template v-else-if="query">
      <div v-if="posts.length || users.length" class="search-results">
        <div v-if="posts.length" class="result-section">
          <h2 class="result-heading">帖子</h2>
          <div v-for="post in posts" :key="post.id" class="result-item" @click="router.push('/posts/' + post.id)">
            <div class="ri-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div class="ri-body">
              <div class="ri-title">{{ post.title }}</div>
              <span v-if="post.similarity" class="ri-sim-badge">{{ (post.similarity * 100).toFixed(0) }}% 匹配</span>
              <div class="ri-desc">{{ post.content?.slice(0, 60) }}{{ post.content?.length > 60 ? '...' : '' }}</div>
            </div>
          </div>
        </div>

        <div v-if="users.length" class="result-section">
          <h2 class="result-heading">用户</h2>
          <div v-for="u in users" :key="u.id" class="result-item" @click="router.push('/profile/' + u.id)">
            <div class="ri-avatar">
              <img v-if="u.avatar_url" :src="u.avatar_url" />
              <div v-else class="ri-avatar-ph">{{ (u.nickname || '?')[0] }}</div>
            </div>
            <div class="ri-body">
              <div class="ri-title">{{ u.nickname }}</div>
              <div class="ri-desc">{{ u.college || '' }}{{ u.grade ? ' | ' + u.grade : '' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="search-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>没有找到相关结果</h3>
        <p>试试其他关键词</p>
      </div>
    </template>

    <div v-else class="search-hint">
      <p>输入关键词搜索帖子和用户</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useProfileStore } from '@/stores/profile'
import { useAIStore } from '@/stores/ai'
import { supabase } from '@/api/supabase'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const profileStore = useProfileStore()
const aiStore = useAIStore()

const aiMode = ref(false)
const aiSummary = ref('')
const query = ref('')
const posts = ref([])
const users = ref([])
const loading = ref(false)

async function doSearch() {
  const q = query.value.trim()
  if (!q) return
  loading.value = true
  try {
    const [postResults, userResults] = await Promise.all([
      supabase.rpc('search_posts_text', { search_query: q, match_count: 10 }),
      profileStore.searchUsers(q)
    ])
    posts.value = postResults.data || []
    users.value = userResults || []
  } catch (e) {
    console.error('Search error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q
    doSearch()
  }
})

watch(() => route.query.q, (q) => {
  if (q) { query.value = q; doSearch() }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.search-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.search-header { margin-bottom: 20px; }
.search-title { display: flex; align-items: center; gap: 8px; font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; margin: 0 0 12px; svg { color: $color-primary; } }

.search-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.sl-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.result-section { margin-bottom: 24px; }
.result-heading { font-size: $font-size-base; font-weight: 600; color: $color-text-primary; margin: 0 0 8px; }

.result-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-md; cursor: pointer; transition: all 0.1s ease; margin-bottom: 4px; }
.result-item:hover { background: $color-primary-subtle; border-color: $color-primary; }
.ri-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: $color-text-tertiary; flex-shrink: 0; svg { stroke: currentColor; } }
.ri-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
.ri-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 0.75rem; font-weight: 600; }
.ri-body { flex: 1; min-width: 0; }
.ri-title { font-weight: 500; color: $color-text-primary; }
.ri-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.search-empty { text-align: center; padding: 80px 20px; color: $color-text-tertiary; svg { stroke: $color-text-tertiary; } h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; } p { font-size: $font-size-sm; margin: 0; } }
.search-mode-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }

.search-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.06), rgba(94, 196, 172, 0.06));
  border: 1px solid rgba(74, 108, 247, 0.1);
  border-radius: $radius-md;
  margin-bottom: 16px;
  font-size: $font-size-sm;
  line-height: 1.5;
  svg { stroke: $color-primary; flex-shrink: 0; margin-top: 2px; }
}
.summary-label { font-weight: 600; color: $color-primary; flex-shrink: 0; }
.summary-text { color: $color-text-secondary; }

.ri-sim-badge {
  font-size: 0.6rem;
  padding: 1px 6px;
  background: rgba(74, 108, 247, 0.08);
  color: $color-primary;
  border-radius: $radius-round;
  margin-left: 8px;
  font-weight: 500;
  flex-shrink: 0;
}

.search-hint { text-align: center; padding: 80px 20px; color: $color-text-tertiary; }
</style>


