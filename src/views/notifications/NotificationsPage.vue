<template>
  <div class="notif-page">
    <div class="notif-header">
      <h2 class="notif-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        通知中心
      </h2>
      <button v-if="notifStore.unreadCount > 0" class="notif-mark-btn" @click="handleMarkAll">
        全部已读
      </button>
    </div>

    <div v-if="notifStore.loading" class="notif-loading">
      <div class="nl-spinner"></div>
      <span>加载中...</span>
    </div>

    <template v-else-if="notifStore.notifications.length">
      <div class="notif-list">
        <div v-for="item in notifStore.notifications" :key="item.id"
          class="notif-item" :class="{ unread: !item.read }"
          @click="handleClick(item)">
          <div class="ni-avatar">
            <img v-if="item.actor?.avatar_url" :src="item.actor.avatar_url" />
            <div v-else class="ni-avatar-ph">{{ item.actor?.nickname?.[0] || '?' }}</div>
          </div>
          <div class="ni-body">
            <div class="ni-text">
              <span class="ni-name">{{ item.actor?.nickname || '未知用户' }}</span>
              {{ actionText(item.type) }}
              <span v-if="item.type === 'comment'" class="ni-preview">{{ previewText }}</span>
            </div>
            <div class="ni-time">{{ formatTime(item.created_at) }}</div>
          </div>
          <div v-if="!item.read" class="ni-dot"></div>
        </div>
      </div>
    </template>

    <div v-else class="notif-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <h3>暂无通知</h3>
      <p>当有人点赞、评论或关注你时，你会在这里看到通知</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { formatTime } from '@/utils/helpers'

const router = useRouter()
const notifStore = useNotificationStore()

const actionMap = {
  like: '赞了你的帖子',
  comment: '评论了你',
  follow: '关注了你',
  favorite: '收藏了你的帖子'
}

function actionText(type) {
  return actionMap[type] || '与你互动'
}

onMounted(() => {
  notifStore.fetchNotifications()
})

async function handleMarkAll() {
  await notifStore.markAllAsRead()
}

function handleClick(item) {
  if (!item.read) notifStore.markAsRead(item.id)
  if (item.post_id) {
    router.push('/posts/' + item.post_id)
  } else if (item.type === 'follow') {
    router.push('/profile/' + item.actor_id)
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.notif-page {
  animation: pageFadeIn 0.4s ease;
}

@keyframes pageFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.notif-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;

  svg { ; }
}

.notif-mark-btn {
  padding: 6px 16px;
  border: $color-border;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-fast;

  &:hover { ; border-; }
}

.notif-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: $color-text-tertiary;
}

.nl-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid -border;
  border-top-;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.notif-list {
  display: flex;
  flex-direction: column;
  border: $color-border;
  overflow: hidden;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: $transition-fast;
  position: relative;

  &:hover { $shadow-hover; }
  & + & { border-top: $color-border-light; }

  &.unread { background: rgba(74, 108, 247, 0.03); }
}

.ni-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;

  img { width: 100%; height: 100%; object-fit: cover; }
}

.ni-avatar-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-primary-gradient;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.ni-body { flex: 1; min-width: 0; }

.ni-text {
  color: $color-text-primary;
  line-height: $line-height-normal;
}

.ni-name {
  font-weight: 600;
}

.ni-time {
  color: $color-text-tertiary;
  margin-top: 2px;
}

.ni-dot {
  width: 8px;
  height: 8px;
  background: $color-heart;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: $color-text-tertiary;

  svg { ; margin-bottom: 12px; }

  h3 {
    font-weight: 600;
    color: $color-text-primary;
    margin: 0 0 4px;
  }

  p {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .notif-list { ; }
}
</style>
