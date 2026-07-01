# 项目发现与研究记录

> 最后更新: 2026-07-01 16:00

## 架构决策

### 技术架构
- **前端:** Vue 3 + Vite + Element Plus + Pinia
- **后端:** Supabase（Auth + PostgreSQL + Storage + RLS）
- **AI:** Coze Workflow（内容分析）+ Agnes AI（图片/润色/审核/Embedding）
- **部署:** Vercel（前端+Serverless）+ Supabase（数据库+认证）

### 认证方案
- 学号映射邮箱 s{学号}@campus.auth 兼容 Supabase Auth
- 触发器自动创建 profiles 记录

### AI 集成策略
- 内容分析: Coze Workflow → /coze proxy → api.coze.cn
- 图片/润色/审核: Agnes AI → /agnes proxy → apihub.agnes-ai.com
- 两种代理模式：开发环境 Vite proxy + 生产环境 Vercel API 路由
- Token 在服务端，浏览器不可见

### Prompt 管理
- 集中在 src/utils/prompts.js，8 个模板
- 支持版本追踪（v1.0）和 description
- 可按需 A/B 测试不同版本

---

## AI 闭环系统

### AI 内容审核（Moderator）
- 发帖前自动调 Agnes AI 检查合规性
- 规则：广告/辱骂/色情/政治/重复
- 失败时默认放行（不影响正常使用）
- 已集成到 ai-log.js 记录日志

### AI 推荐原因（Explainable Recommendation）
- PostCard：基于 matched_topics/intent/emotion 展示推荐理由
- PeoplePage：展示关系图谱摘要（共同兴趣/同校/共同喜欢）
- 两种数据源：AI 生成 + 关系图谱

### AI 评论助手
- CommentForm 新增"AI 建议"按钮
- 支持回复建议和帖子评论建议
- 20 字以内的简洁友好回复

### AI 社交关系图谱
- batch_analyze_relationships 批量 RPC（1 次替代 N+1 次）
- 关系类型：common_tags / same_college / mutual_like / follower
- PeoplePage 自动展示关系详情

### AI 主动系统
- ai-topics store 检测社区活跃度（6 小时阈值）
- 冷清时生成通用话题，活跃时基于热帖延伸
- 首页 Feed 顶部显示 AI 话题卡片

### AI 调用日志
- ai_logs 表记录所有 AI API 调用
- 集成到 moderation 和 topic generation
- 支持统计查询（服务/操作/成功率/延迟）

---

## 工程化 AI 调用层

### safeAICall()
- 统一的 AI 调用封装，处理重试、超时、校验
- 超时控制：默认 30s，可通过 timeout 参数调整
- 自动重试：最多 2 次，指数退避（1s → 2s → 4s）
- JSON 校验：失败时尝试从文本中提取 JSON
- 日志自动记录：每次调用自动记录延迟和成功率

### agnesCall() / cozeCall()
- Agnes AI 和 Coze Workflow 的专用封装
- 开发环境：/coze proxy → api.coze.cn
- 生产环境：/api/coze → Vercel Serverless Function

### 架构决策
- 1 个 Coze Workflow 负责内容理解（设计合理）
- 图片/润色/审核用 Agnes AI 处理（避免 Workflow 膨胀）
- 逻辑计算放在 Supabase RPC（Embedding + 排序）
- AI 调用统一走 safeAICall（重试 + 超时 + 校验）

---

## 数据缓存策略

### Store 缓存（30s TTL）
- post.js: fetchPosts() 非 reset 模式下 30s 内不重复请求
- event.js: fetchEvents() 30s 内不重复请求，支持 force 参数
- notification.js: fetchNotifications() 30s 内不重复请求
- follow.js: fetchFollowers() 30s 内不重复请求

### 日报增量刷新
- digest.js: incrementalRefresh() 不清理已有数据
- Object.assign 就地合并，无闪烁
- 只有当帖子数/评论数/新用户数有变化时才重新调用 AI 生成

---

## 组件结构

### common/ (10 个)
- PostCard: 帖子卡片（含 AI 标签/匹配度/推荐理由）
- CommentForm: 评论表单（含 AI 建议按钮）
- CommentList: 评论列表（嵌套回复）
- ImageUploader: 图片上传（多图模式）
- TagSelector: 标签选择器（AI 推荐）
- FollowButton: 关注按钮
- LikeButton: 点赞按钮
- FavoriteButton: 收藏按钮
- UserAvatar: 用户头像
- ImagePreview: 图片预览

### layout/ (4 个)
- AppLayout: 页面布局（侧边栏 + 主内容区）
- AppNavbar: 顶部导航（搜索 + 通知 + 用户菜单）
- AppSidebar: 侧边栏（用户卡片 + 导航菜单）
- BottomNav: 底部导航（移动端）

### views/ (20 个页面)
- auth/: LoginPage, RegisterPage
- home/: HomePage（双模式 Feed）
- posts/: CreatePostPage, PostDetailPage, EditPostPage
- profile/: ProfilePage, EditProfilePage, FollowListPage
- discover/: DiscoverPage, PeoplePage
- buddies/: BuddiesPage
- events/: EventsPage, EventDetailPage, CreateEventPage, EditEventPage
- digest/: DailyDigestPage
- activities/: ActivitiesPage
- notifications/: NotificationsPage
- search/: SearchPage

---

## 数据库设计

### 17 个迁移文件覆盖完整数据模型
- 001: profiles + follows（用户系统）
- 002: posts + likes + favorites（内容系统）
- 003: comments（评论系统）
- 004: notifications（通知系统）
- 005: post_embeddings + user_embeddings + post_ai_tags（AI 向量）
- 008: events + event_participants（活动系统）
- 012: posts AI 字段扩展（intent/emotion/topics/summary）
- 013: user_behavior（用户行为追踪）
- 014: user_interest_profile + post_rank_score（Feed 排序）
- 016: user_relationships（社交关系图谱）
- 017: ai_logs（AI 调用日志）

### 关键设计决策
- pgvector 支持语义搜索
- RLS 行级安全策略控制数据访问
- 触发器处理通知和时间戳
- 学号映射邮箱兼容 Supabase Auth

---

## 已知问题

### SQL 文件编码
- 部分 SQL 迁移文件注释乱码（不影响功能）

### Vite Proxy 硬编码
- /agnes 和 /coze proxy 有 fallback token
- 生产环境需要 Vercel 环境变量

### 字面量换行符
- 部分 Vue 文件曾有字面量 backslash-n（已修复）
- 根因：编辑器保存时编码转换问题

---

## 环境配置

### Supabase
- 17 个迁移文件
- Storage buckets: post-images, avatars
- RLS 行级安全策略

### 代理配置
- /agnes → apihub.agnes-ai.com（图片/润色/审核）
- /coze → api.coze.cn（内容分析）
- /api → Vercel Serverless（生产环境 Coze 代理）
