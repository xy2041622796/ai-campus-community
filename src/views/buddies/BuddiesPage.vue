<template>
  <div class="buddies-page">
    <div class="buddies-header">
      <h1 class="buddies-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        找搭子
      </h1>
      <p class="buddies-desc">选择你感兴趣的搭子类型，一起玩一起学</p>
    </div>
    <div class="buddy-categories">
      <button v-for="cat in categories" :key="cat.tag" class="buddy-cat-btn" :class="{ active: activeTag === cat.tag }" @click="selectCategory(cat.tag)">
        #{{ cat.tag }} <span class="bcat-count">{{ cat.user_count }}</span>
      </button>
    </div>
    <div v-if="loading" class="buddies-loading"><div class="bl-spinner"></div><span>加载中...</span></div>
    <div v-else-if="buddies.length" class="buddies-grid">
      <div v-for="u in buddies" :key="u.id" class="buddy-card" @click="router.push('/profile/' + u.id)">
        <div class="bc-avatar">
          <img v-if="u.avatar_url" :src="u.avatar_url" />
          <div v-else class="bc-avatar-ph">{{ (u.nickname || '?')[0] }}</div>
        </div>
        <div class="bc-info">
          <div class="bc-name">{{ u.nickname }}</div>
          <div class="bc-meta">{{ u.college || '' }}<span v-if="u.grade"> · {{ u.grade }}</span></div>
          <div v-if="u.bio" class="bc-bio">{{ u.bio.slice(0, 50) }}</div>
          <div class="bc-tags"><span v-for="t in u.interest_tags?.slice(0, 3)" :key="t" class="bc-tag">{{ t }}</span></div>
        </div>
        <FollowButton :target-id="u.id" class="bc-follow" />
      </div>
    </div>
    <div v-else class="buddies-empty"><p>暂无搭子</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import FollowButton from '@/components/common/FollowButton.vue'

const router = useRouter()
const activeTag = ref('')
const buddies = ref([])
const categories = ref([])
const loading = ref(false)

async function loadCategories() {
  const { data } = await supabase.rpc('get_all_interest_tags')
  categories.value = data || []
  if (data?.length) { activeTag.value = data[0].tag; loadBuddies() }
}

async function loadBuddies() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !activeTag.value) return
  loading.value = true
  const { data } = await supabase.rpc('find_buddies_by_tag', { tag: activeTag.value, current_user_id: user.id })
  buddies.value = data || []
  loading.value = false
}

function selectCategory(tag) { activeTag.value = tag; loadBuddies() }

function getBuddyReason(u) {
  if (!u.interest_tags?.length) return null
  const common = u.interest_tags.filter(t => categories.value.some(c => c.tag === t))
  if (common.length > 0) return '共同兴趣：' + common.slice(0, 2).join('、')
  return null
}

onMounted(loadCategories)
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.buddies-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.buddies-header { margin-bottom: 20px; }
.buddies-title { display: flex; align-items: center; gap: 8px; font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary; margin: 0 0 4px; svg { color: $color-primary; } }
.buddies-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.buddy-categories { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.buddy-cat-btn { padding: 5px 14px; border: 1px solid $color-border-light; border-radius: $radius-round; background: $color-card; color: $color-text-tertiary; font-size: $font-size-sm; cursor: pointer; transition: all 0.15s ease; }
.buddy-cat-btn:hover { border-color: $color-primary; color: $color-primary; background: $color-primary-subtle; }
.buddy-cat-btn.active { background: $color-primary-gradient; color: white; border-color: transparent; box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2); }
.bcat-count { font-size: 0.6rem; opacity: 0.7; margin-left: 2px; }

.buddies-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.bl-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.buddies-grid { display: flex; flex-direction: column; gap: 8px; }
.buddy-card { display: flex; align-items: center; gap: 14px; padding: 14px; background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-lg; cursor: pointer; transition: all 0.15s ease; box-shadow: $shadow-card; }
.buddy-card:hover { box-shadow: $shadow-hover; transform: translateY(-1px); }
.bc-avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.bc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.bc-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-weight: 600; }
.bc-info { flex: 1; min-width: 0; }
.bc-name { font-weight: 600; color: $color-text-primary; }
.bc-meta { font-size: $font-size-xs; color: $color-text-tertiary; }
.bc-bio { font-size: $font-size-sm; color: $color-text-secondary; margin-top: 2px; }
.bc-tags { display: flex; gap: 4px; margin-top: 4px; }
.bc-tag { font-size: 0.6rem; padding: 1px 8px; background: $color-primary-subtle; color: $color-primary; border-radius: $radius-round; }
.bc-follow { flex-shrink: 0; }
.bc-reason { font-size: 0.7rem; color: #667788; margin-top: 4px; font-style: italic; }
.buddies-empty { text-align: center; padding: 60px 0; color: $color-text-tertiary; }
</style>
