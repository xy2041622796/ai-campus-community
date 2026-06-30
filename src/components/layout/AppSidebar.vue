<template>
  <aside class="$z-sidebar">
    <div class="sidebar-inner">
      <!-- 用户摘要卡片 -->
      <div class="user-card" @click="router.push('/profile/' + authStore.user?.id)">
        <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" class="uc-avatar" />
        <div v-else class="uc-avatar ph">{{ authStore.user?.nickname?.[0] || '?' }}</div>
        <div class="uc-info">
          <div class="uc-name">{{ authStore.user?.nickname || '未登录' }}</div>
          <div class="uc-meta">{{ authStore.user?.college || '' }} {{ authStore.user?.grade || '' }}</div>
        </div>
      </div>

      <!-- 主导航 -->
      <nav class="sidebar-nav">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
          class="nav-item" :class="{ active: isActive(item) }">
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          <span v-else-if="item.path === '/notifications' && notifStore.unreadCount > 0" class="nav-badge">{{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}</span>
        </router-link>
      </nav>

      <!-- 分隔线 -->
      <div class="sidebar-divider"></div>

      <div class="sidebar-spacer"></div>

      <!-- 底部卡片 -->
      <div class="sidebar-footer-card">
        <div class="sfc-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="sfc-title">AI 校园助手</div>
        <div class="sfc-desc">基于人工智能的智慧校园平台</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const menuItems = [
  {
    path: '/',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    label: '首页'
  },
  {
    path: '/discover',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    label: '发现'
  },
  {
    path: '/events',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    label: '活动'
  },
  {
    path: '/buddies',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    label: '搭子'
  },
  {
    path: '/digest',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H2"/><path d="M17 14l-5-5-5 5"/><path d="M12 9v9"/></svg>',
    label: '日报'
  },
  {
    path: '/notifications',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    label: '通知'
  },
]

function isActive(item) {
  if (item.path === '/') return route.path === '/'
  return route.path.startsWith(item.path)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.sidebar-fixed {
  position: fixed;
  top: $navbar-height;
  left: 0;
  width: $sidebar-width;
  height: calc(100vh - $navbar-height);
  background: $color-card;
  border-right: 1px solid $color-border-light;
  overflow-y: auto;
  z-index: $z-sidebar;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 12px;
  height: 100%;
}

/* User card with subtle gradient background */
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-fast;
  margin-bottom: 8px;
  background: $gradient-sidebar-user;
  border: 1px solid rgba(74, 108, 247, 0.06);
  &:hover { border-color: rgba(74, 108, 247, 0.15); }
}

.uc-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(74, 108, 247, 0.15);
  &.ph {
    background: $color-primary-gradient;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
  }
}

.uc-info { flex: 1; min-width: 0; }
.uc-name { font-weight: 600; font-size: $font-size-sm; color: $color-text-primary; }
.uc-meta { font-size: $font-size-xs; color: $color-text-tertiary; margin-top: 1px; }

.sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: $radius-md;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
  font-weight: 500;
  transition: all 0.15s ease;
  text-decoration: none;
  position: relative;

  &:hover { color: $color-primary; background: $color-primary-subtle; }

  &.active {
    color: $color-primary;
    font-weight: 600;
    background: $color-primary-subtle;
  }

  &.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: $color-primary-gradient;
    border-radius: 0 3px 3px 0;
  }
}

.nav-icon { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.nav-label { flex: 1; }

.nav-badge {
  font-size: 0.6rem;
  background: $color-heart;
  color: white;
  padding: 1px 6px;
  border-radius: $radius-round;
  font-weight: 700;
  line-height: 1.4;
}

.sidebar-divider {
  height: 1px;
  background: $color-border-light;
  margin: 8px 0;
}

.sidebar-spacer { flex: 1; }

.sidebar-footer-card {
  padding: 14px;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.04), rgba(94, 196, 172, 0.04));
  border-radius: $radius-md;
  text-align: center;
  border: 1px solid rgba(74, 108, 247, 0.06);
}

.sfc-icon { display: flex; align-items: center; justify-content: center; color: $color-primary; margin-bottom: 6px; }
.sfc-title { font-size: $font-size-sm; font-weight: 600; color: $color-primary; margin-bottom: 2px; }
.sfc-desc { font-size: $font-size-xs; color: $color-text-tertiary; }

@media (max-width: 1024px) { .sidebar-fixed { display: none; } }
</style>
