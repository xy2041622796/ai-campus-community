# Phase 1: 项目骨架与用户体系 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 搭建 Vue 3 + Vite + Element Plus + Supabase 项目骨架，实现学号密码登录注册、用户资料管理和关注系统

**Architecture:** 前端 SPA 架构，通过 Supabase JS SDK 直接操作数据库和 Auth。认证使用学号映射内部邮箱格式 s@campus.auth 兼容 Supabase Auth。前端设计采用蓝绿渐变主色调 + 暖橙点缀色的校园清新风格。

**Tech Stack:** Vue 3 + JavaScript + Pinia + Vue Router + Vite + Element Plus + Supabase JS SDK

---

### Task 1: 初始化 Vite + Vue 3 + JavaScript 项目

**Files:**
- Create: package.json, ite.config.js, index.html, src/main.js, src/App.vue

- [ ] **Step 1: 使用 Vite 创建项目（纯 JS 模板）**

Run:
`
cd C:\Users\2041622796\Desktop\ai-campus-community
& "C:\Users\2041622796\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd" create vite@latest . --template vue
`

Expected: Scaffolds Vite + Vue 3 + JavaScript project structure.

- [ ] **Step 2: 安装核心依赖**
`
& "C:\Users\2041622796\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd" add element-plus @element-plus/icons-vue pinia vue-router@4 @supabase/supabase-js
`

- [ ] **Step 3: 安装开发依赖**
`
& "C:\Users\2041622796\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd" add -D sass
`

- [ ] **Step 4: 验证**
`
& "C:\Users\2041622796\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules/.bin/vite --version
`

### Task 2: 配置项目

**Files:**
- Create: .env
- Modify: ite.config.js

- [ ] **Step 1: 配置 Vite 路径别名**

ite.config.js:
`js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: { port: 5173 }
})
`

- [ ] **Step 2: 创建环境变量**

.env:
`
VITE_SUPABASE_URL=https://lomdzbulgkowyomrjygr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NNfhYvXyW9P2fb-k5zGDFA_LYJRPxDV
`

### Task 3: 创建 Supabase 客户端和工具函数

**Files:**
- Create: src/api/supabase.js
- Create: src/utils/helpers.js

- [ ] **Step 1: 创建 Supabase 客户端**

src/api/supabase.js:
`js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`

- [ ] **Step 2: 创建工具函数**

src/utils/helpers.js:
`js
export function studentIdToEmail(studentId) {
  return s@campus.auth
}

export function getStorageUrl(bucket, path) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return ${supabaseUrl}/storage/v1/object/public//
}

export function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return ${minutes}分钟前
  if (hours < 24) return ${hours}小时前
  if (days < 7) return ${days}天前
  return date.toLocaleDateString('zh-CN')
}
`

### Task 4: 实现全局样式与设计 Token

**Files:**
- Create: src/assets/styles/variables.scss
- Create: src/assets/styles/global.scss
- Modify: src/main.js

- [ ] **Step 1: 创建 SCSS 变量**

src/assets/styles/variables.scss:
`scss
// Colors
-primary: #4A90D9;
-primary-light: #5EC4AC;
-primary-gradient: linear-gradient(135deg, #4A90D9, #5EC4AC);
-surface: #F8FAFB;
-card: #FFFFFF;
-text-primary: #1A2332;
-text-secondary: #6B7A8F;
-accent: #FF7E5F;
-border: #E8EDF2;

// Spacing
-sm: 8px;
-md: 16px;
-lg: 24px;
-xl: 32px;

// Radius
-md: 8px;
-lg: 12px;
-xl: 16px;

// Shadow
-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
-lg: 0 8px 24px rgba(0, 0, 0, 0.1);

// Breakpoints
-mobile: 768px;

// Layout
-width: 240px;
-height: 60px;
-max-width: 1200px;
`

- [ ] **Step 2: 创建全局样式**

src/assets/styles/global.scss:
`scss
@use './variables' as *;

:root {
  --color-primary: #{-primary};
  --color-primary-light: #{-primary-light};
  --color-accent: #{-accent};
  --color-surface: #{-surface};
  --color-card: #{-card};
  --color-text-primary: #{-text-primary};
  --color-text-secondary: #{-text-secondary};
  --color-border: #{-border};
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  height: 100%;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  background: var(--color-surface);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}

#app { height: 100%; }
a { text-decoration: none; color: var(--color-primary); }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

.el-button--primary {
  background: -primary-gradient !important;
  border: none !important;
}
`

- [ ] **Step 3: 更新 main.js**

src/main.js:
`js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/styles/global.scss'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.mount('#app')
`

### Task 5: 创建 Pinia Stores

**Files:**
- Create: src/stores/auth.js
- Create: src/stores/profile.js
- Create: src/stores/follow.js

- [ ] **Step 1: Auth Store**

src/stores/auth.js:
`js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { studentIdToEmail } from '@/utils/helpers'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const isLoggedIn = computed(() => user.value !== null)

  async function initSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await fetchProfile(session.user.id)
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) user.value = data
  }

  async function register(studentId, password, nickname, college, grade) {
    loading.value = true
    try {
      const email = studentIdToEmail(studentId)
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { student_id: studentId, nickname, college, grade } }
      })
      if (error) throw error
      await login(studentId, password)
    } finally { loading.value = false }
  }

  async function login(studentId, password) {
    loading.value = true
    try {
      const email = studentIdToEmail(studentId)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) await fetchProfile(data.user.id)
    } finally { loading.value = false }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isLoggedIn, initSession, register, login, logout, fetchProfile }
})
`

- [ ] **Step 2: Profile Store**

src/stores/profile.js:
`js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) profile.value = data
  }

  async function updateProfile(userId, form) {
    loading.value = true
    try {
      const { error } = await supabase.from('profiles').update({
        nickname: form.nickname,
        avatar_url: form.avatar_url,
        college: form.college,
        grade: form.grade,
        bio: form.bio,
        interest_tags: form.interest_tags,
        updated_at: new Date().toISOString()
      }).eq('id', userId)
      if (error) throw error
      await fetchProfile(userId)
    } finally { loading.value = false }
  }

  async function searchUsers(query) {
    const { data } = await supabase.from('profiles').select('*')
      .or(
ickname.ilike.%%,student_id.ilike.%%).limit(20)
    return data || []
  }

  return { profile, loading, fetchProfile, updateProfile, searchUsers }
})
`

- [ ] **Step 3: Follow Store**

src/stores/follow.js:
`js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useFollowStore = defineStore('follow', () => {
  const following = ref([])
  const followers = ref([])
  const followingList = ref([])
  const loading = ref(false)

  async function fetchFollowing(userId) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    following.value = data?.map(f => f.following_id) || []
  }

  function isFollowing(userId) {
    return following.value.includes(userId)
  }

  async function followUser(targetId) {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return
    loading.value = true
    try {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
      following.value.push(targetId)
    } finally { loading.value = false }
  }

  async function unfollowUser(targetId) {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return
    loading.value = true
    try {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
      following.value = following.value.filter(id => id !== targetId)
    } finally { loading.value = false }
  }

  async function fetchFollowers(userId) {
    const { data } = await supabase.from('follows').select('follower_id').eq('following_id', userId)
    if (!data) return
    const ids = data.map(f => f.follower_id)
    if (!ids.length) { followers.value = []; return }
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    followers.value = profiles || []
  }

  async function fetchFollowingProfiles(userId) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    if (!data) return
    const ids = data.map(f => f.following_id)
    if (!ids.length) { followingList.value = []; return }
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    followingList.value = profiles || []
  }

  return { following, followers, followingList, loading, fetchFollowing, isFollowing, followUser, unfollowUser, fetchFollowers, fetchFollowingProfiles }
})
`

### Task 6: 实现路由配置与守卫

**Files:**
- Create: src/router/index.js

- [ ] **Step 1: 创建路由**

src/router/index.js:
`js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabase'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginPage.vue'), meta: { layout: 'auth' } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterPage.vue'), meta: { layout: 'auth' } },
  { path: '/', name: 'Home', component: () => import('@/views/home/HomePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id', name: 'Profile', component: () => import('@/views/profile/ProfilePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/settings/profile', name: 'EditProfile', component: () => import('@/views/profile/EditProfilePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id/followers', name: 'Followers', component: () => import('@/views/profile/FollowListPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id/following', name: 'Following', component: () => import('@/views/profile/FollowListPage.vue'), meta: { layout: 'default', requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) next('/login')
  else if ((to.path === '/login' || to.path === '/register') && session) next('/')
  else next()
})

export default router
`

### Task 7: 实现布局组件

**Files:**
- Create: src/components/layout/AppNavbar.vue
- Create: src/components/layout/AppSidebar.vue
- Create: src/components/layout/BottomNav.vue
- Create: src/components/layout/AppLayout.vue
- Modify: src/App.vue

(均为 .vue 文件，Script 部分使用 <script setup> + JS，不再列出完整代码——参考设计文档)

关键点：
- AppNavbar: Logo + 搜索框 + 用户下拉菜单 (el-dropdown)
- AppSidebar: 导航菜单 + 底部校园渐变 banner，移动端隐藏
- BottomNav: 移动端底部 5 Tab 导航，桌面端隐藏
- AppLayout: 组合 Navbar + Sidebar + router-view + BottomNav
- App.vue: 根据 
oute.meta.layout 切换布局 (auth: 无侧边栏卡片; default: 主布局)，onMounted 调用 authStore.initSession()

### Task 8: 实现公共组件

**Files:**
- Create: src/components/common/UserAvatar.vue
- Create: src/components/common/FollowButton.vue
- Create: src/components/common/TagSelector.vue
- Create: src/components/common/ImageUploader.vue

关键点:
- UserAvatar: props: src(String), nickname(String), size(Number, default 40)
- FollowButton: props: userId(String), size(String), round(Boolean); 使用 followStore
- TagSelector: v-model 绑定 string[]; 添加/删除标签
- ImageUploader: v-model 绑定图片 URL; upload 到 Supabase Storage; 预览/删除

### Task 9: 实现登录/注册页面

**Files:**
- Create: src/views/auth/LoginPage.vue
- Create: src/views/auth/RegisterPage.vue

关键点:
- LoginPage: 学号 + 密码表单，brand section（Logo + 标题），el-form 验证，登录后跳转 /
- RegisterPage: 学号/密码/确认密码/昵称/学院/年级，学院和年级为 el-select，验证通过后注册并登录

### Task 10: 实现首页骨架

**Files:**
- Create: src/views/home/HomePage.vue

关键点:
- 渐变条签名元素（今日校园 + 文案 + 统计数据）
- el-empty 占位（后续 Phase 2 填充帖子列表）

### Task 11: 实现个人资料页面

**Files:**
- Create: src/views/profile/ProfilePage.vue
- Create: src/views/profile/EditProfilePage.vue
- Create: src/views/profile/FollowListPage.vue

关键点:
- ProfilePage: 头像/信息/统计/标签/帖子+收藏 Tab
- EditProfilePage: 编辑所有字段，ImageUploader 上传头像，TagSelector 编辑标签
- FollowListPage: 关注/粉丝列表，支持返回，FollowButton 操作

### Task 12: 创建数据库迁移脚本

**Files:**
- Create: supabase/migrations/001_init.sql

SQL 内容:
`sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  college TEXT, grade TEXT, bio TEXT,
  interest_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_profiles_student_id ON profiles(student_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users delete own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS 
BEGIN
  INSERT INTO profiles (id, student_id, nickname, college, grade)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'student_id',
    COALESCE(NEW.raw_user_meta_data->>'nickname', '新用户'),
    NEW.raw_user_meta_data->>'college', NEW.raw_user_meta_data->>'grade');
  RETURN NEW;
END;
;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`

### Task 13: 初始化 Git + 验证构建

- [ ] **Step 1: Git init + .gitignore**
`
node_modules/
dist/
.env
.superpowers/
`

- [ ] **Step 2: 运行 pnpm build 验证无错误
