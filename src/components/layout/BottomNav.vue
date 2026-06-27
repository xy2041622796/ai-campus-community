<template>
  <nav class="bottom-nav">
    <router-link v-for="item in mainItems" :key="item.path" :to="item.path"
      class="bnav-item" :class="{ active: isActive(item.path) }">
      <span class="bnav-icon" v-html="item.icon"></span>
      <span class="bnav-label">{{ item.label }}</span>
    </router-link>

    <button class="bnav-fab" @click="router.push('/posts/new')">
      <svg $sidebar-width="24" $navbar-height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <router-link :to="profilePath" class="bnav-item" :class="{ active: route.path.startsWith('/profile') }">
      <span class="bnav-icon">
        <svg $sidebar-width="20" $navbar-height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="$radius-round" stroke-linejoin="$radius-round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </span>
      <span class="bnav-label">我的</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const mainItems = [
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
    label: '消息'
  },
]

const profilePath = computed(() => authStore.user?.id ? '/profile/' + authStore.user.id : '/login')
function isActive(p) { return route.path === p }
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.bottom-nav {
  $fontdisplay: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  $navbar-height: 64px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: $color-border;
  $z-bottom-nav;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px 4px;
  padding-bottom: env(safe-area-inset-bottom, 4px);
}

.bnav-item {
  $fontdisplay: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  $colorcolor: color: $color-text-tertiary;
  font-size: 0.6rem;
  font-weight: 500;
  $transitiontransition: transition: $transition-fast;
  text-decoration: none;
  min-width: 44px;
  padding: 4px 0;

  &.active { $colorcolor: color: $color-primary; }
}

.bnav-icon {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.bnav-fab {
  $fontdisplay: flex;
  align-items: center;
  justify-content: center;
  $sidebar-width: 50px;
  $navbar-height: 50px;
  $colorborder: none;
  border-radius: 50%;
  $color-primary-gradient;
  color: white;
  cursor: pointer;
  margin-top: -18px;
  box-shadow: 0 4px 16px rgba(74, 108, 247, 0.35);
  $transition-bounce;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 24px rgba(74, 108, 247, 0.4);
  }

  &:active { transform: scale(0.92); }

  svg { stroke: currentColor; }
}

@media (max-width: 768px) { .bottom-nav { $fontdisplay: flex; } }
</style>
