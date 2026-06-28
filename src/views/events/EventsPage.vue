<template>
  <div class="events-page">
    <div class="events-header">
      <div class="eh-left">
        <h1 class="events-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          校园活动
        </h1>
        <p class="events-desc">枚观校圖校园活动，一起参加</p>
      </div>
      <button class="events-create-btn" @click="router.push('/events/new')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        创建活动
      </button>
    </div>

    <div v-if="store.loading" class="events-loading">
      <div class="el-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="store.events.length" class="events-list">
      <div v-for="ev in store.events" :key="ev.id" class="event-card" @click="router.push('/events/' + ev.id)">
        <div v-if="ev.images?.length" class="ec-image">
          <img :src="ev.images[0]" alt="" loading="lazy" />
        </div>
        <div class="ec-body">
          <div class="ec-meta">
            <span class="ec-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formatEventDate(ev.event_date) }}
            </span>
            <span class="ec-status" :class="ev.status">· {{ statusLabel(ev.status) }}</span>
          </div>
          <h3 class="ec-title">{{ ev.title }}</h3>
          <p class="ec-desc">{{ ev.description.slice(0, 80) }}{{ ev.description.length > 80 ? '...' : '' }}</p>
          <div class="ec-footer">
            <span class="ec-organizer">
              <img v-if="ev.organizer?.avatar_url" :src="ev.organizer.avatar_url" class="eo-avatar" />
              <span>{{ ev.organizer?.nickname || '未知用户' }}</span>
            </span>
            <span v-if="ev.location" class="ec-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ ev.location }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="events-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <h3>暂无活动</h3>
      <p>发布第一个活动吧</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '@/stores/event'

const router = useRouter()
const store = useEventStore()

function formatEventDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusLabel(s) {
  const map = { open: '报正报报', closed: '已正报报', cancelled: '已消报报', completed: '已结成成' }
  return map[s] || s
}

onMounted(() => { store.fetchEvents(); store.fetchMyRegistrations() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.events-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.events-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 24px;
}
.eh-left { flex: 1; }
.events-title {
  display: flex; align-items: center; gap: 8px;
  font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary;
  margin: 0 0 4px;
  svg { color: $color-primary; }
}
.events-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.events-create-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: none; border-radius: $radius-md;
  background: $color-primary-gradient; color: white;
  font-size: $font-size-sm; font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
  transition: $transition-normal;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3); }
  svg { stroke: currentColor; }
}

.events-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.el-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.events-list { display: flex; flex-direction: column; gap: 12px; }

.event-card {
  display: flex; background: $color-card; border: 1px solid $color-border-light;
  border-radius: $radius-lg; overflow: hidden; cursor: pointer;
  transition: all 0.15s ease; box-shadow: $shadow-card;
  &:hover { box-shadow: $shadow-hover; transform: translateY(-1px); }
}

.ec-image { width: 160px; min-height: 120px; flex-shrink: 0; overflow: hidden; background: $color-surface; }
.ec-image img { width: 100%; height: 100%; object-fit: cover; }

.ec-body { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.ec-meta { display: flex; align-items: center; gap: 8px; font-size: $font-size-xs; }
.ec-date { display: flex; align-items: center; gap: 4px; color: $color-text-tertiary; svg { stroke: currentColor; } }
.ec-status { font-weight: 500; }
.ec-status.open { color: $color-success; }
.ec-status.closed { color: $color-text-tertiary; }
.ec-status.cancelled { color: $color-danger; }
.ec-status.completed { color: $color-text-tertiary; }

.ec-title { font-family: $font-display; font-size: 1rem; font-weight: 650; color: $color-text-primary; margin: 0; line-height: $line-height-tight; }
.ec-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; line-height: $line-height-normal; }

.ec-footer { display: flex; align-items: center; justify-content: space-between; font-size: $font-size-xs; color: $color-text-tertiary; margin-top: auto; }
.ec-organizer { display: flex; align-items: center; gap: 4px; }
.eo-avatar { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
.ec-location { display: flex; align-items: center; gap: 2px; svg { stroke: currentColor; } }

.events-empty { text-align: center; padding: 80px 20px; color: $color-text-tertiary; svg { stroke: $color-text-tertiary; } h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; } p { font-size: $font-size-sm; margin: 0; } }

@media (max-width: 768px) {
  .event-card { flex-direction: column; }
  .ec-image { width: 100%; height: 140px; }
}
</style>
