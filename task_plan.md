# 校园社区项目 - 任务计划

> 最后更新: 2026-07-01 11:00

## 项目概述

**项目名称:** AI Campus Community（AI驱动的校园社交操作系统）
**技术栈:** Vue 3 + JavaScript + Vite + Element Plus + Pinia + Vue Router + Supabase
**AI引擎:** Coze Workflow（内容分析）+ Agnes AI（图片/润色/审核）
**部署:** Vercel（前端）+ Supabase（后端/数据库/Auth）
**端口:** 5173（开发服务器）

**项目定位:** 从"校园社区平台"升级为"AI 驱动的校园社交智能系统"

## 当前阶段（全部已完成）

### 阶段 1: 核心功能 ✅
- 用户认证（学号映射邮箱 + 登录/注册）
- 帖子系统（发布/浏览/编辑/删除）
- 评论系统（嵌套回复）
- 点赞/收藏系统
- 通知系统
- 全局样式设计系统（SCSS Token）
- 响应式布局（桌面/移动端）

### 阶段 2: AI 增强功能 ✅
- 文本润色 / 智能标签推荐 / 封面图生成
- 语义搜索（pgvector + embedding）
- 搜索结果摘要 / 推荐理由生成
- AI 活动策划 / 活动智能推荐

### 阶段 3: 高级功能 ✅
- 事件/活动系统 / Buddy 匹配 / 发现页
- 全文搜索 / 校友匹配 / 季节活动建议

### 阶段 4: AI 驱动升级 ✅
- 帖子语义结构化（intent/emotion/topics/summary）
- AI 用户画像 / AI 社区日报 / AI Feed 重排序
- Coze Workflow 集成（Vite Proxy + stream_run）
- 双模式 Feed（为你推荐 / 最新动态）

### 阶段 5: AI 闭环系统 ✅
- AI 内容审核（发帖前自动合规检查）
- AI 推荐原因（推荐理由自动生成）
- AI 调用日志（全量 AI 调用追踪）
- AI 评论助手（一键生成评论建议）
- AI Buddy 推荐理由（搭子匹配展示原因）
- Prompt Version 管理（8 个模板集中管理）

## 路由清单（22 个）

| 路径 | 页面 | 需登录 |
|------|------|--------|
| / | 首页（双模式Feed + AI 话题推荐） | 是 |
| /posts/new | 发布帖子（含AI审核） | 是 |
| /posts/:id | 帖子详情（含AI评论助手） | 是 |
| /profile/:id | 个人主页 | 是 |
| /notifications | 通知中心 | 是 |
| /discover | 发现页 | 是 |
| /people | 用户列表（含推荐理由） | 是 |
| /buddies | Buddy 匹配（含推荐理由） | 是 |
| /search | 搜索页 | 是 |
| /digest | AI 社区日报 | 是 |
| /events/* | 事件系统（4个路由） | 是 |
| /activities | 活动页 | 是 |
| /login, /register | 认证页面 | 否 |

## 数据库表清单（17 个迁移）

| 表名 | 说明 | 迁移 |
|------|------|------|
| profiles | 用户资料 | 001 |
| follows | 关注关系 | 001 |
| posts | 帖子（含AI字段） | 002+012 |
| likes / favorites | 点赞 / 收藏 | 002 |
| comments | 评论 | 003 |
| notifications | 通知 | 004 |
| post_embeddings / user_embeddings / post_ai_tags | AI 向量 | 005 |
| events / event_participants | 事件/活动 | 008 |
| user_behavior | 用户行为追踪 | 013 |
| user_interest_profile / post_rank_score | Feed 排序 | 014 |
| user_relationships | 社交关系图谱 | 016 |
| ai_logs | AI 调用日志 | 017 |

## Store 清单（14 个）

| Store | 说明 |
|-------|------|
| ai.js | AI 能力封装（润色/图片/搜索） |
| ai-profile.js | 用户 AI 画像 |
| ai-topics.js | AI 话题生成（主动系统） |
| digest.js | AI 社区日报 |
| recommend.js | 智能推荐（含关系图谱） |
| post.js | 帖子管理（含结构化字段） |
| auth / comment / event / favorite / follow / like / notification / profile | 业务管理 |

## Utils 清单（3 个）

| Utils | 说明 |
|-------|------|
| prompts.js | Prompt 版本管理（8 个模板） |
| ai-log.js | AI 调用日志工具 |
| helpers.js | 工具函数（推荐理由生成） |

## 依赖清单

**运行时:** vue ^3.5.13, vue-router ^4.5.0, pinia ^3.0.0, element-plus ^2.9.0, @supabase/supabase-js ^2.49.0, @coze/api ^1.3.9

**开发:** vite ^6.2.0, @vitejs/plugin-vue ^5.2.0, sass ^1.83.0, unplugin-auto-import ^21.0.0, unplugin-vue-components ^32.1.0
