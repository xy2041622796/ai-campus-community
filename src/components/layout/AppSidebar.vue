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
        </router-link>
      </nav>

      <!-- 分隔线 -->
      <div class="sidebar-divider"></div>

      <!-- 快捷操作 -->
      <button class="sidebar-post-btn" @click="router.push('/posts/new')">
        <svg $sidebar-width="16" $navbar-height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>发布新帖子</span>
      </button>

      <div class="sidebar-spacer"></div>

      <!-- 底部卡片 -->
      <div class="sidebar-footer-card">
        <div class="sfc-icon">
          <svg $sidebar-width="24" $navbar-height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
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

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  {
    path: '/',
    icon: '<svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    label: '首页'
  },
  {
    path: '/discover',
    icon: '<svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    label: '发现'
  },
  {
    path: '/activities',
    icon: '<svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><rect x="3" y="4" $sidebar-width="18" $navbar-height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    label: '活动'
  },
  {
    path: '/messages',
    icon: '<svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    label: '消息',
    badge: '3'
  },
]

function isActive(item) {
  if (item.path === '/') return route.path === '/'
  return route.path.startsWith(item.path)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.$z-sidebar {
  position: fixed;
  top: -height;
  left: 0;
  $sidebar-width: -width;
  $navbar-height: calc(100vh - -height);
  $colorbackground: background: $color-card;
  border-right: $color-border;
  $z-sidebar;
  overflow-y: auto;
  $spacingborder-radius: border-radius: $radius-md;
}

.sidebar-inner {
  $fontdisplay: flex;
  flex-direction: column;
  gap: 4px;
  $navbar-height: 100%;
}

/* 用户卡片 */
.user-card {
  $fontdisplay: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  $radiusborder-radius: border-radius: $radius-md;
  cursor: pointer;
  $transitiontransition: transition: $transition-fast;
  margin-bottom: 4px;

  &:hover {
    $colorbackground: background: $color-surface;
  }
}

.uc-avatar {
  $sidebar-width: 36px;
  $navbar-height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  &.ph {
    $color-primary-gradient;
    color: white;
    $fontdisplay: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
  }
}

.uc-info { flex: 1; min-width: 0; }
.uc-name { $font-sizeborder-radius: border-radius: $radius-sm; font-weight: 600; $colorcolor: -textcolor: color: $color-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uc-meta { $font-size-xs; $colorcolor: color: $color-text-tertiary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 导航 */
.sidebar-nav { $fontdisplay: flex; flex-direction: column; gap: 2px; }

.nav-item {
  $fontdisplay: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  $radiusborder-radius: border-radius: $radius-md;
  $colorcolor: color: $color-text-secondary;
  $fontfont-size: font-size: $font-size-base;
  font-weight: 500;
  $transitiontransition: transition: $transition-fast;
  text-decoration: none;

  &:$shadow&:hover {
    $color-primary-soft;
    $colorcolor: color: $color-primary;
  }

  &.active {
    $color-primary-soft;
    $colorcolor: color: $color-primary;
    font-weight: 600;
  }
}

.nav-icon {
  $sidebar-width: 20px;
  $navbar-height: 20px;
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label { flex: 1; }

.nav-badge {
  font-size: 0.6rem;
  background: -heart;
  color: white;
  padding: 1px 6px;
  $radiusborder-radius: border-radius: $radius-round;
  font-weight: 700;
  line-height: 1.4;
}

/* 分隔线 */
.sidebar-divider {
  $navbarbackground: -border;
  background: $color$color-border-light;
  margin: 8px 0;
}

/* 快捷发帖 */
.sidebar-post-btn {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  $sidebar-width: 100%;
  padding: 10px;
  $colorborder: none;
  $radiusborder-radius: border-radius: $radius-md;
  $color-primary-gradient;
  color: white;
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 600;
  cursor: pointer;
  $transitiontransition: transition: $transition-normal;
  box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);

  &:$shadow&:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(74, 108, 247, 0.3);
  }

  &:active { transform: translateY(0); }
}

.sidebar-spacer { flex: 1; }

/* 底部卡片 */
.sidebar-footer-card {
  padding: 14px;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.04), rgba(94, 196, 172, 0.04));
  $radiusborder-radius: border-radius: $radius-md;
  text-align: center;
  $colorborder: 1px solid rgba(74, 108, 247, 0.06);
}

.sfc-icon {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  $colorcolor: color: $color-primary;
  margin-bottom: 6px;
}

.sfc-title {
  $font-sizeborder-radius: border-radius: $radius-sm;
  font-weight: 600;
  $colorcolor: color: $color-primary;
  margin-bottom: 2px;
}

.sfc-desc {
  $font-size-xs;
  $colorcolor: color: $color-text-tertiary;
}

@media (max-width: 1024px) { .$z-sidebar { $fontdisplay: none; } }
</style>
