# 项目进展日志

> 最后更新: 2026-06-30 11:48

## 2026-06-30

### Coze Workflow 集成
- 通过 Vite proxy 解决 Coze CORS 问题
- Token 在服务端添加，浏览器不可见
- 修复 SSE 流式响应解析（event.data.content）
- 切换原生 fetch + stream_run 端点
- 更新 PAT token

### 编码问题修复
- ActivitiesPage: 校圖->校园, 么么->什么
- DiscoverPage: 探累->探索, 精索->精彩
- EventsPage: 枚观校圖->发现校园

### digest.js Bug 修复
- 修复 fetchActiveUsers count 排序错误
- 修复 fetchNewUserCount 不存在的 postCount 字段
- 修复 catch 块变量作用域问题

### PostCard 调整
- 移除 summary 徽章显示（保留搜索用）

### GitHub 推送
- branch: codex/coze-proxy-fix -> merged to main
- 仓库: xy2041622796/ai-campus-community

## 2026-06-29

### 三层推进升级
- 帖子语义结构化（intent/emotion/topics/summary）
- AI 画像 + 智能推荐（ai-profile store）
- AI 社区日报（DailyDigestPage /digest）
- AI Feed 重排序系统（get_personalized_feed）
- 双模式 Feed（为你推荐 / 最新动态）

### 文件变更
- 新增 13 个文件，修改 22 个文件
- 14 个数据库迁移文件

## 当前状态

### 项目完整性
- 54 个源文件，14 个 store，14 个迁移文件
- AI 功能: Coze 分析 + Agnes 图片 + 语义搜索

### 待处理
- 图片上传到 Supabase Storage 不完整
- Notification 表可能未创建
- 生产环境需要配置 Coze token
