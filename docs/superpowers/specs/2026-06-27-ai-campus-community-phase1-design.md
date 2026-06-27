# AI 智能化校园社区 — Phase 1 设计文档

> 日期: 2026-06-27
> 技术栈: Vue 3 + JavaScript + Pinia + Vite + Element Plus + Supabase
> AI 服务: Agnes AI (agnes-2.0-flash) via Supabase Edge Functions

## 一、项目概述

全栈 AI 智能化校园社区，无需自建后端服务。所有数据持久化、鉴权、存储、AI 逻辑均通过 Supabase 实现。AI 接口调用和密钥管理全部放在 Supabase Edge Functions 中，前端不暴露任何 API Key。

## 二、Phase 1 范围

Phase 1 是整个项目的基础骨架和用户体系，是所有后续功能的依赖。

### 包含内容

1. 项目脚手架搭建 (Vite + Vue 3 + TS + Pinia + Element Plus + Router)
2. Supabase SDK 集成与配置文件
3. 认证系统 (Supabase Auth — 学号 + 密码登录/注册)
4. 用户资料系统 (profiles 表 CRUD)
5. 关注系统 (follows 表)
6. 基础布局与导航框架
7. 响应式 UI 适配（含移动端）
8. 前端设计体系（色彩、字体、布局风格）

### 数据库表

**profiles 表**
- id: uuid (PK, references auth.users)
- student_id: text (唯一 — 学号)
- nickname: text
- avatar_url: text
- college: text (学院)
- grade: text (年级)
- bio: text (个人简介)
- interest_tags: text[] (兴趣标签数组)
- created_at: timestamptz
- updated_at: timestamptz

**follows 表**
- id: uuid (PK)
- follower_id: uuid (references profiles.id)
- following_id: uuid (references profiles.id)
- created_at: timestamptz
- Unique constraint: (follower_id, following_id)

### 认证流程详解

由于 Supabase Auth 原生基于邮箱认证，采用**学号映射邮箱**的方案：

**注册流程：**
1. 用户填写：学号 + 密码 + 昵称 + 学院 + 年级
2. 前端构造内部邮箱 `s${student_id}@campus.auth` 调用 `supabase.auth.signUp()`
3. 学号存入 `profiles.student_id` 和 `auth.users.raw_user_meta_data`
4. 注册成功后自动创建 profiles 记录

**登录流程：**
1. 用户填写：学号 + 密码
2. 前端构造内部邮箱 `s${student_id}@campus.auth` 调用 `supabase.auth.signInWithPassword()`
3. 登录成功后跳转首页

**优势：** 对用户完全透明，全程使用学号；后端充分利用 Supabase Auth 完整的会话管理、RLS 集成和密码重置能力。

### 页面清单

1. **登录页** `/login` — 学号 + 密码登录
2. **注册页** `/register` — 学号、密码、昵称、学院、年级
3. **首页** `/` — 布局骨架 + 导航 + 内容区占位
4. **个人主页** `/profile/:id` — 用户信息展示、帖子/收藏/关注粉丝 Tab
5. **编辑资料** `/settings/profile` — 编辑昵称、头像、学院、年级、简介、兴趣标签
6. **关注列表** `/profile/:id/following` 和 `/profile/:id/followers`

### 路由布局

- 公共路由: Login, Register（无侧边栏布局，全屏居中卡片）
- 主布局路由: Home, Profile, EditProfile（侧边栏 + 顶栏布局）
- 守卫: 未登录用户重定向到 /login

## 三、前端设计体系 (Frontend Design)

### 设计定位

校园社区，目标用户为在校大学生。整体风格：**年轻、清爽、有活力**，避免过于商务或过于稚嫩。色彩上采用标志性的校园蓝绿渐变，搭配暖色点缀。

### 色彩体系

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | #4A90D9 → #5EC4AC (渐变) | 主品牌色、按钮、链接 |
| Surface | #F8FAFB | 页面背景 |
| Card | #FFFFFF | 卡片背景 |
| Text Primary | #1A2332 | 主文字 |
| Text Secondary | #6B7A8F | 辅助文字 |
| Accent | #FF7E5F | 操作高亮、点赞、通知徽标 |
| Border | #E8EDF2 | 分割线、边框 |

### 字体体系

- **展示字体 (Display):** Noto Sans SC — 大标题、品牌标识，粗体大字号
- **正文字体 (Body):** Inter — 内容阅读、表单、列表，清晰现代
- **辅助字体 (Utility):** JetBrains Mono — 代码块、数据展示

### 布局规则

- 最大内容宽度 1200px，居中
- 侧边栏固定 240px
- 卡片圆角 12px，阴影层级 subtle
- 移动端侧边栏收为底部 Tab 导航

### 签名元素 (Signature)

- **校园动态渐变条：** 首页顶部一条蓝绿渐变的动态横幅，展示校园金句/当日推荐，底部附带波浪形渐变装饰
- 这个元素在登录页也有呈现作为品牌识别

## 四、组件设计

### 公共组件
- **AppNavbar** — 顶部导航栏（Logo、搜索框占位、用户头像下拉菜单）
- **AppSidebar** — 侧边栏导航（快捷菜单）
- **UserAvatar** — 用户头像组件（支持默认头像，圆形）
- **FollowButton** — 关注/取消关注按钮（Accent 色）
- **TagSelector** — 标签选择器（用于兴趣标签编辑）
- **ImageUploader** — 图片上传组件（Supabase Storage 封装，支持裁剪预览）

## 五、状态管理 (Pinia Stores)

- **useAuthStore** — 用户登录状态、token 管理、登录/注册/登出操作
- **useProfileStore** — 用户资料获取与更新
- **useFollowStore** — 关注/取消关注、关注列表、粉丝列表

## 六、Supabase Edge Functions (Phase 1 暂不涉及)

Edge Functions 将在 Phase 4 引入 AI 功能时创建。Phase 1 仅使用 Supabase Client SDK 操作数据库和 Auth。

## 七、目录结构

```
ai-campus-community/
├── src/
│   ├── api/
│   │   └── supabase.ts          # Supabase 客户端初始化
│   ├── assets/
│   │   └── styles/
│   │       └── global.css       # 全局样式、CSS 变量、设计 Token
│   ├── components/
│   │   ├── common/
│   │   │   ├── UserAvatar.vue
│   │   │   ├── FollowButton.vue
│   │   │   ├── TagSelector.vue
│   │   │   └── ImageUploader.vue
│   │   └── layout/
│   │       ├── AppNavbar.vue
│   │       ├── AppSidebar.vue
│   │       ├── BottomNav.vue    # 移动端底部导航
│   │       └── AppLayout.vue
│   ├── composables/
│   │   └── useAuth.ts           # 认证逻辑组合式函数
│   ├── router/
│   │   └── index.ts             # 路由配置
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   └── follow.ts
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   ├── utils/
│   │   └── helpers.ts           # 工具函数
│   ├── views/
│   │   ├── auth/
│   │   │   ├── LoginPage.vue
│   │   │   └── RegisterPage.vue
│   │   ├── home/
│   │   │   └── HomePage.vue
│   │   └── profile/
│   │       ├── ProfilePage.vue
│   │       ├── EditProfilePage.vue
│   │       └── FollowListPage.vue
│   ├── App.vue
│   └── main.ts
├── supabase/
│   └── migrations/
│       └── 001_init.sql         # 数据库迁移脚本
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.js
├── 
└── .env
```

## 八、环境变量 (.env)

```
VITE_SUPABASE_URL=https://lomdzbulgkowyomrjygr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NNfhYvXyW9P2fb-k5zGDFA_LYJRPxDV
```

## 九、实现顺序

1. 初始化 Vite + Vue 3 + JavaScript 项目
2. 安装依赖 (Element Plus, Pinia, Vue Router, @supabase/supabase-js)
3. 配置 TypeScript, Vite 别名, CSS 变量
4. 创建 Supabase 客户端封装
5. 定义 TypeScript 类型
6. 实现全局样式与设计 Token
7. 创建 Pinia stores (auth, profile, follow)
8. 实现路由配置与守卫
9. 实现布局组件 (Navbar, Sidebar, BottomNav, Layout)
10. 实现公共组件 (UserAvatar, FollowButton 等)
11. 实现登录/注册页面（学号密码）
12. 实现个人主页
13. 实现编辑资料页面
14. 实现关注列表页面
15. 创建首页骨架
16. 数据库迁移脚本 + Supabase 配置
17. 整体联调与验证

## 十、Supabase 配置注意事项

### 认证设置 (Supabase Dashboard → Authentication → Settings)
- **关闭 Email Confirmations** ✓ (已在后台配置)
- 学号通过 `auth.users.raw_user_meta_data.student_id` 存储
- Site URL 配置为 `http://localhost:5173`

### RLS 安全策略

- profiles: 所有人可读，仅本人可写
- follows: 登录用户可读写自己的关注关系
- Supabase Auth 触发器: 用户注册后自动创建 profiles 记录（含 student_id）

## 十一、Agnes AI 预留配置 (Phase 4+)

```
AGNES_API_KEY=sk-CLFcGKTH0rP0vFxGQfZZjh8dn3aV2gEDg4uVJhPhQm6HuPW0
```

> 此 Key 用于 Supabase Edge Functions 环境变量，不会出现在前端代码中。
