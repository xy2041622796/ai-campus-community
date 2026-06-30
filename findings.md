# 项目发现与研究记录

> 最后更新: 2026-06-30 11:48

## 架构决策

### 认证方案
- 学号映射为邮箱格式 `s{{学号}}@campus.auth` 兼容 Supabase Auth
- 触发器自动在注册时创建 profiles 记录

### 数据库设计
- PostgreSQL RLS 行级安全策略控制数据访问
- 触发器自动处理通知和更新时间戳
- pgvector 支持语义搜索
- tsvector 支持全文搜索

### AI 集成
- 内容分析: Coze Workflow（/coze proxy -> api.coze.cn）
- 图片生成: Agnes AI（/agnes proxy -> apihub.agnes-ai.com）
- 文本润色 / embedding: Agnes AI

### Coze 集成细节
- SDK: @coze/api, 方法: workflows.runs.stream()
- 通过 Vite proxy 转发请求（解决 CORS）
- Token 在服务端 vite.config.js 中，浏览器不可见
- 工作流 ID: 7656724184508792895
- 返回格式: {{ intent, emotion, topics, summary }}
- 端点: POST /v1/workflow/stream_run（SSE 流）

## 已知问题

### 1. SQL 文件编码
- 部分 SQL 迁移文件注释乱码（不影响功能）

### 2. Notification 表缺失
- notification.js store 中有 PGRST205 错误处理

### 3. 图片上传
- ImageUploader 组件存在，Storage bucket 配置不明确

### 4. Vite Proxy
- /agnes 和 /coze proxy 有硬编码的 fallback token

## AI 驱动升级细节

### 帖子语义结构化
- posts 表扩展: intent/emotion/topics/summary
- 发帖时自动调用 Coze 分析（不阻塞提交）
- PostCard 显示 intent 徽章和 emotion 图标

### AI 用户画像
- ai-profile.js 分析行为数据生成画像
- 包含: 兴趣标签、活跃时段、社交倾向、行为分数

### AI 社区日报
- digest.js 聚合今日数据 + AI 生成日报
- 失败时有降级方案（静态数据）

### Feed 排序
- RPC: calculate_post_rank_score / get_personalized_feed
- 评分: 热度 + 时间 + 兴趣匹配 + 社交关系

## 技术细节

### 组件结构
- common/: 通用业务组件
- layout/: 导航栏、侧边栏、底部导航
- views/: 按功能模块分组的页面组件

### Store 结构（14 个）
- 各业务领域独立 store，模块化设计

## 环境配置

### Supabase
- URL: https://lomdzbulgkowyomrjygr.supabase.co
- 14 个迁移文件

### 代理配置
- /agnes -> apihub.agnes-ai.com
- /coze -> api.coze.cn
- /api -> Vercel
