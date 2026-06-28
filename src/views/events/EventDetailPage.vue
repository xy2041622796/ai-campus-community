<template>
  <div class="event-detail-page" v-if="event">
    <button class="back-btn" @click="router.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      返回
    </button>

    <div class="detail-card">
      <div v-if="event.images?.length" class="detail-image">
        <img :src="event.images[0]" alt="" />
      </div>
      <div class="detail-body">
        <div class="detail-meta">
          <span class="detail-status" :class="event.status">{{ statusLabel(event.status) }}</span>
          <span class="detail-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ formatDate(event.event_date) }}
          </span>
          <span v-if="event.location" class="detail-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ event.location }}
          </span>
        </div>
        <h1 class="detail-title">{{ event.title }}</h1>
        <p class="detail-desc">{{ event.description }}</p>

        <div class="detail-organizer">
          <img v-if="event.organizer?.avatar_url" :src="event.organizer.avatar_url" class="do-avatar" />
          <div v-else class="do-avatar do-ph">{{ (event.organizer?.nickname || '?')[0] }}</div>
          <div class="do-info">
            <div class="do-name">{{ event.organizer?.nickname || '未知用户' }}</div>
            <div class="do-label">组织者</div>
          </div>
        </div>

        <div class="detail-participants" v-if="participants.length">
          <div class="dp-label">已报名用户 ({{ participants.length }})</div>
          <div class="dp-list">
            <div v-for="p in participants" :key="p.id" class="dp-item" @click="router.push('/profile/' + p.user_id)">
              <img v-if="p.profile?.avatar_url" :src="p.profile.avatar_url" class="dp-avatar" />
              <div v-else class="dp-avatar dp-ph">{{ (p.profile?.nickname || '?')[0] }}</div>
              <span class="dp-name">{{ p.profile?.nickname || '未知用户' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <div class="da-info">
            <span v-if="event.max_participants > 0">{{ participantCount }}/{{ event.max_participants }} 人已报名</span>
            <span v-else>{{ participantCount }} 人已报名</span>
            <span v-if="event.deadline" class="da-deadline"> · {{ formatDate(event.deadline) }} 截止</span>
          </div>
          <div class="da-buttons">
            <el-button
              v-if="event.status === 'open'"
              :type="isRegistered ? 'default' : 'primary'"
              :loading="actionLoading"
              @click="handleToggleJoin"
            >{{ isRegistered ? '取消报名' : '立即报名' }}</el-button>
            <el-button v-if="authStore.user?.id === event.organizer_id" size="small" @click="router.push('/events/' + event.id + '/edit')">编辑</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="detail-loading">
    <div class="dl-spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEventStore } from '@/stores/event'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'

const route = useRoute()
const router = useRouter()
const store = useEventStore()
const authStore = useAuthStore()
const actionLoading = ref(false)

const event = computed(() => store.currentEvent)
const isRegistered = computed(() => event.value ? store.registeredIds.has(event.value.id) : false)
const participantCount = ref(0)
const participants = ref([])

function statusLabel(s) {
  const map = { open: '开始报名', closed: '报名已结束', cancelled: '已取消', completed: '已结束' }
  return map[s] || s
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

async function handleToggleJoin() {
  if (!event.value) return
  actionLoading.value = true
  try {
    if (isRegistered.value) {
      await store.leaveEvent(event.value.id)
      ElMessage.success('已取消报名')
    } else {
      await store.joinEvent(event.value.id)
      ElMessage.success('报名成功!')
    }
    participantCount.value = isRegistered.value
      ? Math.max(0, participantCount.value - 1)
      : participantCount.value + 1
  } catch (e) { ElMessage.error(e.message || '操作失败') }
  finally { actionLoading.value = false }
}

onMounted(async () => {
  await store.fetchEventById(route.params.id)
  await store.fetchMyRegistrations()
  if (event.value) {
    const { count } = await supabase.rpc('get_event_participant_count', { event_id: event.value.id })
    participantCount.value = count || 0
    const { data: pData } = await supabase
      .from('event_participants')
      .select('id, user_id, profile:user_id(id, nickname, avatar_url)')
      .eq('event_id', event.value.id)
      .eq('status', 'registered')
    participants.value = pData || []
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.event-detail-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid $color-border-light; border-radius: $radius-md; background: $color-card; color: $color-text-secondary; cursor: pointer; transition: $transition-fast; margin-bottom: 16px; }
.back-btn:hover { color: $color-primary; border-color: $color-primary; }
.back-btn svg { stroke: currentColor; }

.detail-card { background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-xl; overflow: hidden; }
.detail-image { width: 100%; max-height: 300px; overflow: hidden; background: $color-surface; img { width: 100%; height: 100%; object-fit: cover; } }
.detail-body { padding: 28px; display: flex; flex-direction: column; gap: 16px; }
.detail-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: $font-size-sm; color: $color-text-tertiary; svg { stroke: currentColor; } }
.detail-status { font-weight: 600; }
.detail-status.open { color: $color-success; }
.detail-status.closed { color: $color-text-tertiary; }
.detail-status.cancelled { color: $color-danger; }
.detail-status.completed { color: $color-text-tertiary; }
.detail-title { font-family: $font-display; font-size: 1.35rem; font-weight: 700; color: $color-text-primary; margin: 0; }
.detail-desc { font-size: 1rem; color: $color-text-secondary; line-height: $line-height-relaxed; white-space: pre-wrap; margin: 0; }

.detail-organizer { display: flex; align-items: center; gap: 10px; padding: 16px; background: $color-primary-subtle; border-radius: $radius-md; }
.do-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; object-fit: cover; }
.do-ph { display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-weight: 600; }
.do-name { font-weight: 600; color: $color-text-primary; }
.do-label { font-size: $font-size-xs; color: $color-text-tertiary; }
.dp-label { font-size: $font-size-sm; font-weight: 600; color: $color-text-primary; margin-bottom: 8px; }
.dp-list { display: flex; flex-wrap: wrap; gap: 8px; }
.dp-item { display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 8px; border-radius: $radius-round; background: $color-card; font-size: $font-size-sm; transition: $transition-fast; }
.dp-item:hover { background: $color-primary-subtle; }
.dp-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.dp-ph { display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 0.6rem; font-weight: 600; }

.detail-participants { padding: 12px; background: $color-primary-subtle; border-radius: $radius-md; }
.da-info { font-size: $font-size-sm; color: $color-text-tertiary; }
.da-buttons { display: flex; gap: 8px; }
.da-deadline { color: $color-text-tertiary; }

.detail-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; color: $color-text-tertiary; }
.dl-spinner { width: 32px; height: 32px; border: 3px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
