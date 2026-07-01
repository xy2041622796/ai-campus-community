<template>
  <div class="people-page">
    <div class="people-header">
      <h1 class="people-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        发现同学
      </h1>
      <p class="people-desc">AI 根据你的兴趣和行为推荐的同学</p>
      <div class="people-ai-bar">
        <el-button size="small" :loading="reasonLoading" :disabled="!store.users.length" @click="generateReasons"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> AI 推荐理由</el-button>
      </div>
    </div>


    <!-- AI 找搭子 -->
    <div class="buddy-search-section">
      <div class="buddy-search-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>AI 找搭子</span>
      </div>
      <p class="buddy-search-desc">描述你想找什么样的人，AI 帮你匹配</p>
      <div class="buddy-search-input">
        <el-input
          v-model="buddyQuery"
          placeholder="想找一个会Vue的人一起做项目..."
          size="large"
          clearable
          @keyup.enter="searchBuddy"
        />
        <el-button type="primary" :loading="buddyLoading" :disabled="!buddyQuery.trim()" @click="searchBuddy">
          AI 匹配
        </el-button>
      </div>
      <div v-if="buddyResults.length" class="buddy-results">
        <div v-for="(user, idx) in buddyResults" :key="user.id" class="buddy-result-card" @click="router.push('/profile/' + user.id)">
          <div class="br-rank">{{ idx + 1 }}</div>
          <div class="br-avatar">
            <img v-if="user.avatar_url" :src="user.avatar_url" />
            <div v-else class="br-avatar-ph">{{ (user.nickname || '?')[0] }}</div>
          </div>
          <div class="br-info">
            <div class="br-name">{{ user.nickname }}</div>
            <div class="br-meta">{{ user.college || '' }} {{ user.grade || '' }}</div>
            <div class="br-reason">{{ user.reason }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="store.loading" class="people-loading">
      <div class="pl-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="store.users.length" class="people-grid">
      <div v-for="u in store.users" :key="u.id" class="people-card" @click="router.push('/profile/' + u.id)">
        <div class="pc-avatar">
          <img v-if="u.avatar_url" :src="u.avatar_url" />
          <div v-else class="pc-avatar-ph">{{ (u.nickname || '?')[0] }}</div>
        </div>
        <div class="pc-info">
          <div class="pc-name">{{ u.nickname }}</div>
          <div class="pc-meta">
            <span v-if="u.college">{{ u.college }}</span>
            <span v-if="u.grade"> · {{ u.grade }}</span>
          </div>
          <div v-if="u.bio" class="pc-bio">{{ u.bio.slice(0, 40) }}{{ u.bio.length > 40 ? '...' : '' }}</div>
            <!-- AI 推荐理由 -->
            <div v-if="aiReasons.get(u.id) || getReasonSummary(u.id)" class="pc-ai-reason">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              {{ aiReasons.get(u.id) || getReasonSummary(u.id) }}
            </div>
                    <div v-if="matchScores.get(u.id)" class="pc-match-score">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            {{ matchScores.get(u.id) }}
          </div>
          <div class="pc-tags">
              <span v-if="u.same_college" class="pc-tag badge-college">同校</span>
              <span v-if="u.common_tags > 0" class="pc-tag badge-interest">共兴匹超 · {{ u.common_tags }}</span>
            </div>
            <!-- 关系详情 -->
            <!-- AI 推荐理由 -->
            <div v-if="graphRelationships.get(u.id)" class="pc-relations">
              <div v-for="rel in graphRelationships.get(u.id).relationships" :key="rel.type" class="pc-rel-item">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ rel.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

    <div v-else class="people-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <h3>还没有发现更多同学</h3>
      <p>完善你的兴趣标签，会有更多同学出现</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecommendStore } from '@/stores/recommend'
import { useAIStore } from '@/stores/ai'
import FollowButton from '@/components/common/FollowButton.vue'

const router = useRouter()
const store = useRecommendStore()
const aiStore = useAIStore()
const buddyQuery = ref('')
const buddyLoading = ref(false)
const buddyResults = ref([])

async function searchBuddy() {
  if (!buddyQuery.value.trim() || buddyLoading.value) return
  buddyLoading.value = true
  try {
    const prompt = "User wants: " + buddyQuery.value + ". Recommend top 3 from: " + JSON.stringify(store.users.slice(0, 20).map(u => ({ id: u.id, nickname: u.nickname, college: u.college, bio: u.bio, common_tags: u.common_tags }))) + ". Return JSON: [{id, reason}]. Only JSON."
    const res = await fetch('/agnes/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'agnes-2.0-flash', messages: [{ role: 'user', content: prompt }] })
    })
    if (res.ok) {
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '[]'
      const cleaned = raw.replace(/```json\\s*/g, '').replace(/```\\s*/g, '').trim()
      const matches = JSON.parse(cleaned)
      buddyResults.value = matches.map(m => {
        const user = store.users.find(u => u.id === m.id)
        return user ? { ...user, reason: m.reason } : null
      }).filter(Boolean).slice(0, 3)
    }
  } catch (e) { console.error(e) }
  finally { buddyLoading.value = false }
}
const graphRelationships = store.graphRelationships
const aiReasons = ref(new Map())
const authStore = useAuthStore()

const reasonLoading = ref(false)


// 生成关系图谱摘要
function getReasonSummary(userId) {
  const rel = graphRelationships.value?.get(userId)
  if (!rel || !rel.relationships?.length) return null

  const reasons = []
  for (const r of rel.relationships) {
    if (r === 'common_tags') reasons.push('共同兴趣')
    else if (r === 'same_college') reasons.push('同校')
    else if (r === 'mutual_like') reasons.push('共同喜欢')
    else if (r === 'follower') reasons.push('关注了你')
    else if (r === 'mutual_follow') reasons.push('互相关注')
  }

  return reasons.length > 0 ? reasons.slice(0, 3).join(' · ') : null
}

async function generateReasons() {
  if (!store.users.length || !authStore.user) return
  reasonLoading.value = true
  const newReasons = new Map()
  const batch = store.users.slice(0, 5)
  for (const u of batch) {
    const reason = await aiStore.generateRecommendationReason(authStore.user, u)
    if (reason) newReasons.set(u.id, reason)
  }
  aiReasons.value = newReasons
  reasonLoading.value = false
}

onMounted(() => { store.fetchRecommendations() })
</script>


/* AI 找搭子 */
.buddy-search-section { background: linear-gradient(135deg, rgba(74,108,247,0.06), rgba(94,196,172,0.06)); border: 1px solid rgba(74,108,247,0.15); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
.buddy-search-header { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.buddy-search-header svg { color: #4A6CF7; }
.buddy-search-desc { font-size: 0.85rem; color: #667788; margin-bottom: 16px; }
.buddy-search-input { display: flex; gap: 12px; }
.buddy-search-input :deep(.el-input__wrapper) { border-radius: 12px; border: 1px solid #e2e8f0; }
.buddy-search-input :deep(.el-input__wrapper:focus-within) { border-color: #4A6CF7; box-shadow: 0 0 0 3px rgba(74,108,247,0.1); }
.buddy-search-input .el-button { background: linear-gradient(135deg, #4A6CF7, #5EC4AC); border: none; font-weight: 600; }
.buddy-results { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.buddy-result-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; }
.buddy-result-card:hover { border-color: #4A6CF7; box-shadow: 0 2px 8px rgba(74,108,247,0.1); }
.br-rank { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
.br-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.br-avatar img { width: 100%; height: 100%; object-fit: cover; }
.br-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4A6CF7, #5EC4AC); color: white; font-weight: 600; }
.br-info { flex: 1; min-width: 0; }
.br-name { font-weight: 600; font-size: 0.9rem; color: #1a1a2e; }
.br-meta { font-size: 0.8rem; color: #667788; margin-top: 2px; }
.br-reason { font-size: 0.8rem; color: #4A6CF7; margin-top: 4px; line-height: 1.4; }
<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.people-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.people-header { margin-bottom: 24px; }
.people-title {
  display: flex; align-items: center; gap: 8px;
  font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary;
  margin: 0 0 4px;
  svg { color: $color-primary; }
}
.people-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.people-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.pl-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.people-grid { display: flex; flex-direction: column; gap: 8px; }

.people-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px;
  background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-lg;
  cursor: pointer; transition: all 0.15s ease; box-shadow: $shadow-card;
  &:hover { box-shadow: $shadow-hover; transform: translateY(-1px); }
}

.pc-avatar { width: 48px; height: 48px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.pc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.pc-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 1rem; font-weight: 600; }

.pc-info { flex: 1; min-width: 0; }
.pc-name { font-weight: 600; color: $color-text-primary; margin-bottom: 2px; }
.pc-meta { font-size: $font-size-xs; color: $color-text-tertiary; }
.pc-bio { font-size: $font-size-sm; color: $color-text-secondary; margin-top: 4px; line-height: $line-height-normal; }

.pc-match-score {


.pc-ai-reason {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: #667788;
  margin-top: 6px;
}

.pc-ai-reason svg {
  stroke: #4A6CF7;
  flex-shrink: 0;
}
.pc-relations {
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(74, 108, 247, 0.03);
  border-radius: 8px;
}

.pc-rel-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #667788;
  margin-bottom: 4px;
}

.pc-rel-item:last-child { margin-bottom: 0; }

.pc-rel-item svg {
  stroke: #4A6CF7;
  flex-shrink: 0;
}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #4A6CF7;
  background: rgba(74,108,247,0.06);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 6px;
  font-weight: 500;
}
.pc-match-score svg { stroke: #4A6CF7; flex-shrink: 0; }

.pc-tags { display: flex; gap: 4px; margin-top: 6px; }
.pc-tag { font-size: 0.6rem; padding: 1px 8px; border-radius: $radius-round; font-weight: 500; }
.badge-college { background: rgba(74, 108, 247, 0.1); color: $color-primary; }
.badge-interest { background: rgba(255, 107, 74, 0.1); color: $color-accent; }

.pc-follow { flex-shrink: 0; }

.people-ai-bar { margin-bottom: 12px; }

.pc-ai-reason {
  display: flex; align-items: center; gap: 4px;
  margin-top: 4px; font-size: 0.7rem; color: $color-primary;
  background: rgba(74, 108, 247, 0.06); padding: 2px 8px; border-radius: $radius-round;
  svg { stroke: $color-primary; flex-shrink: 0; }
}

.people-empty { text-align: center; padding: 80px 20px; color: $color-text-tertiary; svg { stroke: $color-text-tertiary; } h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; } p { font-size: $font-size-sm; margin: 0; } }
</style>