<template>
  <!-- 导航栏 Store 初始化 -->
  <header class="$z-navbar">
    <div class="navbar-inner">
      <!-- ===== 左侧：Logo + 品牌 ===== -->
      <div class="nav-left">
        <div class="brand" @click="router.push('/')">
          <div class="brand-icon">
            <svg class="brand-svg" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#brand-grad)"/>
              <path d="M16 6L8 11v10l8 5 8-5V11L16 6z" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
              <rect x="14" y="14" width="4" height="6" rx="1" fill="url(#brand-grad)" opacity="0.9"/>
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stop-color="#4A6CF7"/>
                  <stop offset="100%" stop-color="#5EC4AC"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">校园社区</span>
            <span class="brand-badge">AI</span>
          </div>
        </div>
      </div>

      <!-- ===== 中间：搜索 + 导航 ===== -->
      <div class="nav-center">
        <!-- 搜索 -->
        <div class="search-wrap">
          <el-autocomplete
            v-model="searchQuery"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            placeholder="搜索同学、帖子..."
            :prefix-icon="Search"
            class="nav-search"
            clearable
            popper-class="search-popper"
            @select="handleSelect"
          />
        </div>

        <!-- 主导航 -->
        <div class="nav-tabs">
          <router-link to="/" class="nav-tab" :class="{ active: route.path === '/' }">
            <span class="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span class="tab-label">首页</span>
          </router-link>
          <router-link to="/discover" class="nav-tab">
            <span class="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <span class="tab-label">发现</span>
          </router-link>
          <router-link to="/activities" class="nav-tab">
            <span class="tab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <span class="tab-label">活动</span>
          </router-link>
        </div>
      </div>

      <!-- ===== 右侧：操作 + 用户 ===== -->
      <div class="nav-right">
        <!-- 发帖按钮 -->
        <button class="btn-post" @click="router.push('/posts/new')" title="发布帖子">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>发帖</span>
        </button>

        <!-- 通知 -->
        <router-link to="/notifications" class="btn-icon-only" title="通知中心">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="notifStore.unreadCount > 0" class="badge-num">{{ notifStore.unreadCount > 99 ? "99+" : notifStore.unreadCount }}</span>
          <span v-else class="badge-dot"></span>
        </router-link>

        <!-- 用户 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <button class="btn-user">
            <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" class="u-avatar" />
            <div v-else class="u-avatar ph">{{ authStore.user?.nickname?.[0] || '?' }}</div>
            <span class="u-name">{{ authStore.user?.nickname || '未登录' }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="u-chev">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <template #$z-dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:middle"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                个人主页
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:middle"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                编辑资料
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:middle"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const profileStore = useProfileStore()
const searchQuery = ref('')

async function querySearch(q, cb) {
  if (!q.trim()) { cb([]); return }
  const r = await profileStore.searchUsers(q.trim())
  cb(r || [])
}

function handleSelect(item) {
  searchQuery.value = ''
  router.push('/profile/' + item.id)
}

function handleCommand(cmd) {
  if (cmd === 'profile') router.push('/profile/' + authStore.user?.id)
  else if (cmd === 'settings') router.push('/settings/profile')
  else if (cmd === 'logout') { authStore.logout(); router.push('/login') }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.navbar-fixed {
  position: sticky;
  top: 0;
  z-index: $z-navbar;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid $color-border-light;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: $navbar-height;
  gap: 20px;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.brand-svg {
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand:hover .brand-svg {
  transform: scale(1.1) rotate(-6deg);
}

.brand-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brand-name {
  font-family: $font-display;
  font-size: 1.1rem;
  font-weight: 700;
  background: $color-primary-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.brand-badge {
  font-size: 0.6rem;
  font-weight: 700;
  background: $gradient-accent;
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

/* Center: nav tabs + search */
.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
}

.search-wrap {
  max-width: 280px;
  min-width: 160px;
  order: 2;
}

.nav-search { width: 100%; }

.nav-search :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: $color-surface;
  border: 1.5px solid transparent;
  transition: all 0.25s ease;
  padding: 2px 12px;
  height: 36px;
  box-shadow: none !important;
  &:hover { background: $color-card; border-color: $color-border; }
  &.is-focus { background: $color-card; border-color: $color-primary; box-shadow: 0 0 0 3px $color-primary-subtle !important; }
}

.nav-search :deep(.el-input__inner) { font-size: 0.8125rem; }

.nav-tabs {
  display: flex;
  gap: 2px;
  order: 1;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  color: $color-text-tertiary;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover { color: $color-primary; background: $color-primary-subtle; }

  &.active {
    color: $color-primary;
    font-weight: 600;
    background: $color-primary-subtle;
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background: $color-primary-gradient;
    border-radius: 2px;
  }
}

.tab-icon { display: flex; align-items: center; opacity: 0.8; }
.nav-tab.active .tab-icon { opacity: 1; }

/* Right side */
.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.btn-post {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px 7px 14px;
  border: none;
  border-radius: 10px;
  background: $color-primary-gradient;
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 10px rgba(74, 108, 247, 0.25);
  margin-right: 2px;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(74, 108, 247, 0.35); }
  &:active { transform: translateY(0); }
  svg { stroke: currentColor; }
}

.btn-icon-only {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  color: $color-text-tertiary;
  transition: all 0.2s ease;
  text-decoration: none;
  &:hover { background: $color-primary-subtle; color: $color-primary; }
  &:active { transform: scale(0.9); }
}

.badge-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  background: $color-heart;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.9);
}

.badge-num {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: $color-heart;
  color: white;
  border-radius: 9px;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border: 2px solid rgba(255,255,255,0.9);
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 4px;
  border: 1px solid transparent;
  border-radius: 24px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: $color-primary-subtle; border-color: $color-border; }
  &:active { transform: scale(0.97); }
}

.u-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  &.ph {
    background: $color-primary-gradient;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

.u-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: $color-text-primary;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.u-chev { color: $color-text-tertiary; transition: transform 0.2s ease; }
.btn-user:hover .u-chev { color: $color-primary; }

@media (max-width: 1024px) {
  .navbar-inner { padding: 0 16px; gap: 12px; }
  .nav-tab { padding: 7px 10px; }
  .search-wrap { max-width: 200px; min-width: 120px; }
}

@media (max-width: 768px) {
  .navbar-inner { padding: 0 12px; gap: 8px; }
  .brand-icon { width: 30px; height: 30px; }
  .brand-name { font-size: 1rem; }
  .brand-badge { display: none; }
  .nav-tabs { display: none; }
  .search-wrap { max-width: none; min-width: 80px; }
  .btn-post span { display: none; }
  .btn-post { padding: 7px 10px; }
  .u-name, .u-chev { display: none; }
  .btn-user { padding: 4px; }
}
</style>



