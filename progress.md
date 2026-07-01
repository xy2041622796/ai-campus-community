
## 2026-07-01 工程化改进

### AI 调用层重构
- safeAICall()：统一的 AI 调用封装
  - 超时控制（默认 30s）
  - 自动重试（指数退避，最多 2 次）
  - JSON 校验 + 失败时尝试提取
  - 日志自动记录
- agnesCall()：Agnes AI 专用封装
- cozeCall()：Coze Workflow 专用封装

### 清理
- 删除误创建的文件 "28"
- 移除未使用的 moderation store
# 项目进展日志  > 最后更新: 2026-07-01 11:00  ## 2026-07-01  ### P0: AI 闭环系统 - AI 内容审核：发帖前自动合规检查（已集成到 CreatePostPage） - AI 推荐原因：PostCard + PeoplePage 展示推荐理由 - AI 调用日志：017_ai_logs.sql + ai-log.js  ### P1: 提升作品质量 - AI 评论助手：CommentForm 新增 AI 建议按钮 - AI Buddy 推荐理由：BuddiesPage 展示共同兴趣 - Prompt Version 管理：prompts.js 集中管理 8 个模板  ## 2026-06-30  ### Coze 集成 + 修复 - Vite proxy 解决 Coze CORS - 编码修复（ActivitiesPage/DiscoverPage/EventsPage） - digest.js bug 修复（作用域/字段/排序） - 图片上传改进 + SQL 迁移 - 无限滚动（IntersectionObserver）  ### GitHub 推送 - branch: codex/coze-proxy-fix → merged to main - 仓库: xy2041622796/ai-campus-community  ## 2026-06-29  ### 三层 AI 驱动升级 - 帖子语义结构化 - AI 画像 + 智能推荐 - AI 社区日报 - AI Feed 重排序（双模式 Feed）  ## 项目统计  | 指标 | 数值 | |------|------| | 源文件 | 58 | | Store | 14 | | 页面 | 20 | | 组件 | 14 | | Utils | 3 | | 数据库迁移 | 17 | | Prompt 模板 | 8 |  ## 当前状态  **项目已完成全部 P0/P1 功能**，实现了完整的 AI 闭环系统。  **核心能力：** - AI 内容理解 → 结构化分析 - AI 内容审核 → 合规检查 - AI 推荐原因 → Explainable Recommendation - AI 评论助手 → 一键生成 - AI 社区日报 → 自动生成 - AI 话题生成 → 主动系统 - AI 社交图谱 → 关系分析 - AI 调用日志 → 全量追踪 - Prompt 管理 → 版本控制
