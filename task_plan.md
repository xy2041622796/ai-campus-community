# 校园社区项目 - 任务计划

> 最后更新: 2026-06-30 11:48

## 项目概述

**项目名称:** AI Campus Community（校园社区）
**技术栈:** Vue 3 + JavaScript + Vite + Element Plus + Pinia + Vue Router + Supabase + Coze AI
**AI引擎:** Coze Workflow（内容分析）+ Agnes AI（图片生成）
**部署:** Vercel（前端）+ Supabase（后端/数据库/Auth）
**端口:** 5173（开发服务器）

## 当前阶段

### 阶段 1: 核心功能（已完成）
- [x] 项目初始化（Vite + Vue 3 + Element Plus）
- [x] Supabase 集成（Auth + Database）
- [x] 用户认证（学号映射邮箱 + 登录/注册）
- [x] 用户资料管理（CRUD）
- [x] 关注系统（双向关注）
- [x] 帖子系统（发布/浏览/编辑/删除）
- [x] 评论系统（嵌套回复）
- [x] 点赞/收藏系统
- [x] 通知系统（实时触发器）
- [x] 全局样式设计系统（SCSS Token）
- [x] 响应式布局（桌面/移动端）

### 阶段 2: AI 增强功能（已完成）
- [x] 文本润色（Agnes AI）
- [x] 智能标签推荐（Coze Workflow）
- [x] 封面图生成（Agnes Image）
- [x] 语义搜索（pgvector + embedding）
- [x] 搜索结果摘要
- [x] 推荐理由生成
- [x] AI 活动策划
- [x] 活动智能推荐

### 阶段 3: 高级功能（已完成）
- [x] 事件/活动系统（创建/报名/通知）
- [x] Buddy 匹配（兴趣标签匹配）
- [x] 发现页（推荐用户）
- [x] 全文搜索（PostgreSQL tsvector）
- [x] 校友匹配
- [x] 季节活动建议

### 阶段 4: AI 驱动升级（已完成）
- [x] 帖子语义结构化（intent/emotion/topics/summary 字段）
- [x] AI 自动分析发帖内容（Coze Workflow）
- [x] PostCard 展示结构化标签（意图徽章、情绪emoji）
- [x] 用户行为追踪表（user_behavior）
- [x] AI 用户画像系统（ai-profile store）
- [x] 智能推荐升级（结合 AI 画像）
- [x] AI 社区日报（/digest）
- [x] AI Feed 重排序系统（get_personalized_feed）
- [x] Coze Workflow 集成（Vite Proxy + stream_run）
- [x] 首页双模式 Feed（为你推荐 / 最新动态）

### 阶段 5: 待办事项
- [ ] 图片上传到 Supabase Storage
- [ ] 头像裁剪/压缩优化
- [ ] 帖子分页加载优化（无限滚动）
- [ ] WebSocket 实时通知推送
- [ ] 深色模式支持
- [ ] PWA 离线缓存
- [ ] 国际化（i18n）
- [ ] AI 社交关系图谱
- [ ] AI 主动系统（自动生成话题、连接用户）

## 路由清单

| 路径 | 页面 | 需登录 |
|------|------|--------|
| /login | 登录页 | 否 |
| /register | 注册页 | 否 |
| / | 首页（双模式Feed） | 是 |
| /posts/new | 发布帖子 | 是 |
| /posts/:id | 帖子详情 | 是 |
| /posts/:id/edit | 编辑帖子 | 是 |
| /profile/:id | 个人主页 | 是 |
| /settings/profile | 编辑资料 | 是 |
| /profile/:id/followers | 粉丝列表 | 是 |
| /profile/:id/following | 关注列表 | 是 |
| /notifications | 通知中心 | 是 |
| /discover | 发现页 | 是 |
| /people | 用户列表 | 是 |
| /buddies | Buddy 匹配 | 是 |
| /search | 搜索页 | 是 |
| /activities | 活动页 | 是 |
| /events | 事件列表 | 是 |
| /events/new | 创建事件 | 是 |
| /events/:id/edit | 编辑事件 | 是 |
| /events/:id | 事件详情 | 是 |
| /digest | AI 社区日报 | 是 |
| /messages | 重定向到通知 | 是 |

## 数据库表清单

| 表名 | 说明 | 迁移文件 |
|------|------|----------|
| profiles | 用户资料 | 001_init.sql |
| follows | 关注关系 | 001_init.sql |
| posts | 帖子（含intent/emotion/topics/summary） | 002 + 012 |
| likes | 点赞 | 002_posts.sql |
| favorites | 收藏 | 002_posts.sql |
| comments | 评论 | 003_comments.sql |
| notifications | 通知 | 004_notifications.sql |
| post_embeddings | 帖子向量 | 005_ai_features.sql |
| user_embeddings | 用户向量 | 005_ai_features.sql |
| post_ai_tags | AI 标签 | 005_ai_features.sql |
| events | 事件/活动 | 008_events.sql |
| event_participants | 事件参与者 | 008_events.sql |
| user_behavior | 用户行为追踪 | 013 |
| user_interest_profile | 用户兴趣画像 | 014 |
| post_rank_score | 帖子排名分数缓存 | 014 |

## Store 清单（14 个）

| Store 文件 | 说明 | 状态 |
|-----------|------|------|
| ai.js | AI 能力封装 | 线上 |
| ai-profile.js | 用户 AI 画像 | 新增 |
| digest.js | AI 社区日报 | 新增 |
| recommend.js | 智能推荐 | 升级 |
| post.js | 帖子管理 | 升级 |
| auth.js | 认证管理 | - |
| comment.js | 评论管理 | - |
| event.js | 事件管理 | - |
| favorite.js | 收藏管理 | - |
| follow.js | 关注管理 | - |
| like.js | 点赞管理 | - |
| notification.js | 通知管理 | - |
| profile.js | 用户资料 | - |

## 依赖清单

**运行时依赖:**
- vue ^3.5.13
- vue-router ^4.5.0
- pinia ^3.0.0
- element-plus ^2.9.0
- @element-plus/icons-vue ^2.3.1
- @supabase/supabase-js ^2.49.0
- @coze/api ^1.3.9

**开发依赖:**
- vite ^6.2.0
- @vitejs/plugin-vue ^5.2.0
- sass ^1.83.0
- unplugin-auto-import ^21.0.0
- unplugin-vue-components ^32.1.0
