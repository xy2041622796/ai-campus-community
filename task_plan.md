# AI Campus Community - 项目任务计划

> 最后更新: 2026-07-01 16:00

## 项目概览

**项目名称:** AI Campus Community（AI 驱动的校园社交协作系统）
**技术栈:** Vue 3 + JavaScript + Vite + Element Plus + Pinia + Vue Router + Supabase
**AI 引擎:** Coze Workflow（内容分析）+ Agnes AI（图片/润色/审核/Embedding）
**部署:** Vercel（前端+Serverless）+ Supabase（数据库 + Auth + Storage）
**仓库:** https://github.com/xy2041622796/ai-campus-community

**项目定位:** 从"校园社区平台"升级为"AI 驱动的校园社交智能系统"。

---

## 已完成阶段

### 阶段 1: 核心功能
- 用户认证（学号映射邮箱 + 登录/注册）
- 帖子系统（发布/浏览/编辑/删除 + 无限滚动）
- 评论系统（嵌套回复）
- 点赞/收藏系统
- 通知系统
- 全局样式设计系统（SCSS Token）
- 响应式布局（桌面 + 移动端）

### 阶段 2: AI 增强功能
- 文本润色 / 智能标签推荐 / 封面图生成
- 语义搜索（pgvector + embedding）
- 搜索结果摘要 / 推荐理由生成
- AI 活动策划 / 活动智能推荐

### 阶段 3: 高级功能
- 事件/活动系统（创建/报名/管理）
- Buddy 匹配 / 发现页面
- 全文搜索 / 校友匹配

### 阶段 4: AI 驱动升级
- 帖子语义结构化（intent/emotion/topics/summary）
- AI 用户画像 / AI 社区日报 / AI Feed 重排度
- Coze Workflow 集成（Vite Proxy + stream_run）
- 双模式 Feed（为你推荐 / 最新动态）

### 阶段 5: AI 闭环系统
- AI 内容审核（发帖前自动合规检查）
- AI 推荐原因（推荐理由自动生成）
- AI 调用日志（全量 AI 调用追踪）
- AI 评论助手（一键生成评论建议）
- Prompt Version 管理（8 个模板集中管理）

### 阶段 6: 工程化优化
- safeAICall() 统一 AI 调用封装（重试/超时/校验）
- agnesCall() / cozeCall() 专用封装
- 日报页增量刷新（30s 缓存）
- Store 数据缓存（post/event/notification/follow）
- 修复编译错误（重复代码/模板结构/编码问题）

### 阶段 7: UI/UX 优化（2026-07-01 下午）
- Profile 封面与统计融合（渐变卡片内联显示）
- 退出登录后下拉菜单状态更新
- 下拉菜单优化（个人主页/我的收藏/退出登录）
- 通知铃铛：无消息时不显示红点
- 点赞收藏弹性动画（likeBounce + starBounce）
- 首页 Hero 改为渐变背景
- Google Fonts 引入（Inter + Noto Sans SC）
- 日报模块重新设计（面向普通用户）

---

## 路由清单（22 个）

| 路径 | 页面 | 需登录 |
|------|------|--------|
| / | 首页（双模式 Feed + AI 话题推荐） | 是 |
| /posts/new | 发布帖子（含 AI 审核） | 是 |
| /posts/:id | 帖子详情（含 AI 评论助手） | 是 |
| /posts/:id/edit | 编辑帖子 | 是 |
| /profile/:id | 个人主页 | 是 |
| /settings/profile | 编辑资料 | 是 |
| /notifications | 通知中心 | 是 |
| /discover | 发现页 | 是 |
| /people | 用户列表（含推荐理由） | 是 |
| /buddies | Buddy 匹配 | 是 |
| /search | 搜索页（语义 + 关键词） | 是 |
| /digest | AI 社区日报 | 是 |
| /events | 活动列表 | 是 |
| /events/new | 创建活动 | 是 |
| /events/:id | 活动详情 | 是 |
| /activities | 活动页 | 是 |
| /login | 登录 | 否 |
| /register | 注册 | 否 |

---

## 数据库表清单（17 个迁移）

| 表名 | 说明 | 迁移 |
|------|------|------|
| profiles | 用户资料 | 001 |
| follows | 关注关系 | 001 |
| posts | 帖子（含 AI 字段） | 002+012 |
| likes / favorites | 点赞 / 收藏 | 002 |
| comments | 评论 | 003 |
| notifications | 通知 | 004 |
| post_embeddings / user_embeddings | AI 向量 | 005 |
| events / event_participants | 事件/活动 | 008 |
| user_behavior | 用户行为追踪 | 013 |
| user_interest_profile / post_rank_score | Feed 排序 | 014 |
| user_relationships | 社交关系图谱 | 016 |
| ai_logs | AI 调用日志 | 017 |

---

## Store 清单（14 个）

| Store | 说明 | 缓存 |
|-------|------|------|
| ai.js | AI 能力封装（润色/图片/搜索） | - |
| ai-profile.js | 用户 AI 画像 | - |
| ai-topics.js | AI 话题生成（主动系统） | - |
| digest.js | AI 社区日报（增量刷新） | 30s |
| recommend.js | 智能推荐（含关系图谱） | - |
| post.js | 帖子管理（含结构化字段） | 30s |
| event.js | 事件/活动管理 | 30s |
| notification.js | 通知管理 | 30s |
| follow.js | 关注管理 | 30s |
| auth / comment / favorite / like / profile | 业务管理 | - |

---

## 组件清单（14 个）

| 组件 | 说明 |
|------|------|
| common/PostCard | 帖子卡片（含 AI 标签） |
| common/CommentForm | 评论表单（含 AI 建议） |
| common/CommentList | 评论列表 |
| common/ImageUploader | 图片上传 |
| common/TagSelector | 标签选择器 |
| common/FollowButton | 关注按钮 |
| common/UserAvatar | 用户头像 |
| common/ImagePreview | 图片预览 |
| layout/AppLayout | 页面布局 |
| layout/AppNavbar | 顶部导航 |
| layout/AppSidebar | 侧边栏 |
| layout/BottomNav | 底部导航 |

---

## 依赖清单

**运行时:** vue ^3.5.13, vue-router ^4.5.0, pinia ^3.0.0, element-plus ^2.9.0, @supabase/supabase-js ^2.49.0

**开发时:** vite ^6.2.0, @vitejs/plugin-vue ^5.2.0, sass ^1.83.0

---

## 环境配置

### 代理配置
- /agnes → apihub.agnes-ai.com（图片/润色/审核）
- /coze → api.coze.cn（内容分析）
- /api → Vercel Serverless（生产环境 Coze 代理）

### Supabase
- 17 个迁移文件
- Storage buckets: post-images, avatars
- RLS 行级安全策略

---

## 遇到的错误

| 错误 | 解决方案 |
|------|---------|
| CreatePostPage 重复代码 | 删除重复块 + 修复 reviewing.value |
| ai-topics 未定义变量 | 删除引用 topic/adoptTopic 的代码 |
| PostCard 缺失 matchReason | 添加 computed 属性 |
| HomePage 缺失 script 闭合 | 补全 } + </script> |
| 字面量 backslash-n 编码问题 | 全项目批量替换 |
| like.js 乐观更新无回滚 | 添加 catch 块回滚状态 |
| event.js N+1 查询 | 改为批量 IN 查询 |
| ProfilePage 异步时序 | Promise.all + await |
| PeoplePage 多余 closing div | 删除多余的 </div> |
| ActivitiesPage 重复 import | 删除重复行 |
| ref is not defined (PostCard) | 添加 ref 到 import |
| PAGE_SIZE is not defined (post.js) | 恢复丢失的常量 |
| store return 语句缺失 return 关键字 | 修复 notification/post/event.js |
| CSS 闭合括号缺失 | 逐个修复 profile/home/digest 页面 |
| 下拉菜单退出登录状态不更新 | async logout + 条件渲染 |
| 通知无消息时显示红点 | 移除 v-else 的 badge-dot |

---


### 阶段 8: AI 伴随式体验（进行中）

**目标：** 让 AI 从"后台工具"变成"用户身边的助手"，贯穿整个社区体验。

#### 8.1 AI 发帖助手（P0 - 最高优先级）✅
- 用户输入一句话，AI 自动生成完整帖子
- 支持选择帖子类型：吐槽/求助/讨论/分享
- 自动生成：标题、正文、标签、封面图
- 状态：completed

#### 8.2 AI 评论助手升级（P1）✅
- 根据帖子内容生成上下文相关的一键回复
- 预设回复更自然（如"我也想去！什么时候？"）
- 支持自定义回复
- 状态：completed

#### 8.3 AI 首页个性化（P1）
- 首页顶部显示个性化问候
- 根据用户兴趣和行为推荐内容
- 显示关注话题的更新提醒
- 状态：completed

#### 8.4 AI 找搭子（P2）
- 用户描述需求，AI 推荐匹配的人
- 显示推荐理由
- 支持一键发送消息
- 状态：completed

#### 8.5 AI 活动助手（P2）
- 用户描述活动想法，AI 自动生成完整活动
- 包含：标题、时间、地点、预算、人数、介绍、封面
- 一键发布
- 状态：completed

#### 8.6 AI 学习助手（P3）
- 帖子内容触发 AI 推荐
- 推荐相关课程、帖子、学长、资料、活动
- 形成学习闭环
- 状态：completed

## 当前状态

**项目已完成全部 7 个阶段**，构建通过（1736 modules），已推送到 GitHub。

**核心能力矩阵：**
- AI 内容理解 → 结构化分析
- AI 内容审核 → 合规检查
- AI 推荐原因 → Explainable Recommendation
- AI 评论助手 → 一键生成
- AI 社区日报 → 自动生成 + 增量刷新
- AI 话题生成 → 主动系统
- AI 社交图谱 → 关系分析
- AI 调用日志 → 全量追踪
- Prompt 管理 → 版本控制
- 数据缓存 → 30s 去重
- UI/UX → 弹性动画 + 渐变视觉 + 响应式布局
