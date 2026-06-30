<template>
  <div class="activities-page">
    <div class="activities-header">
      <h1 class="activities-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        校圖动态
      </h1>
      <p class="activities-desc">看看校圖里最近发生了么么</p>
    </div>

    <div v-if="loading" class="activities-loading">
      <div class="al-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="activities.length" class="activities-feed">
      <div v-for="item in activities" :key="item.id" class="activity-card" @click="goToPost(item)">
        <div class="ac-icon">
          <svg v-if="item.type === 'like'" width="18" height="18" viewBox="0 0 24 24" fill="#FF4757" stroke="#FF4757" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <svg v-else-if="item.type === 'comment'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A6CF7" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5EC4AC" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="ac-body">
          <div class="ac-text">
            <span class="ac-user">{{ item.actor?.nickname || '某位用户' }}</span>
            {{ item.type === 'like' ? '赞了一篇帖子' : item.type === 'comment' ? '发表了评论评' : '收藏了帖子' }}
          </div>
          <div class="ac-post">{{ item.post?.title || '无标题' }}</div>
          <div class="ac-time">{{ formatTime(item.created_at) }}</div>
        </div>
        <div class="ac-avatar">
          <img v-if="item.actor?.avatar_url" :src="item.actor.avatar_url" />
          <div v-else class="ac-avatar-ph">{{ (item.actor?.nickname || '?')[0] }}</div>
        </div>
      </div>
    </div>

    <div v-else class="activities-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <h3>暂有动态</h3>
      <p>当有人点赞、评论评或收藏帖子时，你会在这里看到</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { formatTime } from '@/utils/helpers'

const router = useRouter()
const notifStore = useNotificationStore()
const loading = ref(true)
const seasonSuggestions = ref([])
const router = useRouter()
const activities = ref([])

function goToPost(item) {
  if (item.post_id) router.push('/posts/' + item.post_id)
}

onMounted(async () => {
  await notifStore.fetchNotifications()
  activities.value = notifStore.notifications.slice(0, 30)
  loading.value = false
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.activities-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.season-section { margin-bottom: 24px; }
.season-title { display: flex; align-items: center; gap: 8px; font-size: -size-base; font-weight: 600; color: -primary; margin: 0 0 12px; svg { stroke: -primary; } }
.season-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.season-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: -card; border: 1px solid -border-light; border-radius: -lg; cursor: pointer; transition: all 0.15s ease; text-align: left; width: 100%; }
.season-card:hover { border-color: -primary; background: -primary-subtle; transform: translateY(-1px); }
.season-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(74, 108, 247, 0.08); border-radius: -md; flex-shrink: 0; svg { stroke: -primary; } }
.season-info { flex: 1; min-width: 0; }
.season-name { font-weight: 600; font-size: -size-sm; color: -text-primary; }
.season-desc { font-size: -size-xs; color: -text-tertiary; margin-top: 2px; }
@media (max-width: 768px) { .season-grid { grid-template-columns: 1fr; } }

.activities-header { margin-bottom: 24px; }
.activities-title {
  display: flex; align-items: center; gap: 8px;
  font-family: $font-display; font-size: $font-size-xl; font-weight: 700; color: $color-text-primary;
  margin: 0 0 4px;
  svg { color: $color-primary; }
}
.activities-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.activities-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 60px 0; color: $color-text-tertiary; }
.al-spinner { width: 20px; height: 20px; border: 2px solid $color-border; border-top-color: $color-primary; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.activities-feed { display: flex; flex-direction: column; gap: 8px; }

.activity-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: $color-card; border: 1px solid $color-border-light; border-radius: $radius-lg;
  cursor: pointer; transition: all 0.15s ease; box-shadow: $shadow-card;
  &:hover { box-shadow: $shadow-hover; transform: translateY(-1px); }
}

.ac-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ac-body { flex: 1; min-width: 0; }
.ac-text { font-size: $font-size-sm; color: $color-text-secondary; line-height: $line-height-normal; }
.ac-user { font-weight: 600; color: $color-primary; }
.ac-post { font-size: $font-size-sm; color: $color-text-tertiary; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac-time { font-size: $font-size-xs; color: $color-text-tertiary; margin-top: 4px; }

.ac-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.ac-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-avatar-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: $color-primary-gradient; color: white; font-size: 0.75rem; font-weight: 600; }

.activities-empty { text-align: center; padding: 80px 20px; color: $color-text-tertiary; svg { stroke: $color-text-tertiary; } h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; } p { font-size: $font-size-sm; margin: 0; } }
</style>

