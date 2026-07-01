# 项目发现与研究记录

> 最后更新: 2026-07-01 11:00

## 架构决策

### 技术架构
- **前端:** Vue 3 + Vite + Element Plus + Pinia
- **后端:** Supabase（Auth + PostgreSQL + Storage + RLS）
- **AI:** Coze Workflow（内容分析）+ Agnes AI（图片/润色/审核）
- **部署:** Vercel（前端+Serverless）+ Supabase（数据库+认证）

### 认证方案
- 学号映射邮箱 `s{学号}@campus.auth` 兼容 Supabase Auth
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

## AI 闭环系统

### AI 内容审核（Moderator）
- 发帖前自动调 Agnes AI 检查合规性
- 规则：广告/辱骂/色情/政治/重复
- 失败时默认放行（不影响正常使用）
- 已集成到 ai-log.js 记录日志

### AI 推荐原因（Explainable Recommendation）
- PostCard：基于 matched_topics/intent/emotion 显示推荐理由
- PeoplePage：显示关系图谱摘要（共同兴趣/同校/共同喜欢）
- 两种数据源：AI 生成 + 关系图谱
- PostDetailPage：CommentForm 新增 AI 评论建议按钮

### AI 评论助手
- CommentForm 新增"AI 建议"按钮
- 支持回复建议和帖子评论建议
- 20 字以内的简短友好回复

### AI 社交关系图谱
- batch_analyze_relationships 批量 RPC（2 次替代 N+1 次）
- 关系类型：common_tags / same_college / mutual_like / follower
- PeoplePage 自动展示关系详情

### AI 主动系统
- ai-topics store 检测社区活跃度（6小时阈值）
- 冷清时生成通用话题，活跃时基于热帖延伸
- 首页 Feed 顶部显示 AI 话题卡片

### AI 调用日志
- ai_logs 表记录所有 AI API 调用
- 集成到 moderation 和 topic generation
- 支持统计查询（服务/操作/成功率/延迟）

## 已知问题

### SQL 文件编码
- 部分 SQL 迁移文件注释乱码（不影响功能）

### Vite Proxy 硬编码
- /agnes 和 /coze proxy 有 fallback token
- 生产环境需要 Vercel 环境变量

## 技术细节

### 组件结构
- common/: CommentForm, CommentList, PostCard, TagSelector, ImageUploader 等
- layout/: AppNavbar, AppSidebar, BottomNav
- views/: 按功能模块分组（20 个页面）

### Store 结构（14 个）
- ai.js: AI 能力封装
- ai-profile.js: 用户 AI 画像
- ai-topics.js: AI 话题生成
- digest.js: AI 社区日报
- recommend.js: 智能推荐（含关系图谱）
- post.js: 帖子管理（含结构化字段）
- 其他业务 store

### 数据库设计
- 17 个迁移文件覆盖完整数据模型
- pgvector 支持语义搜索
- RLS 行级安全策略控制数据访问
- 触发器处理通知和时间戳

## 环境配置

### Supabase
- URL: https://lomdzbulgkowyomrjygr.supabase.co
- 17 个迁移文件
- Storage buckets: post-images, avatars

### 代理配置
- /agnes → apihub.agnes-ai.com（图片/润色/审核）
- /coze → api.coze.cn（内容分析）
- /api → Vercel（生产环境 Coze 代理）
