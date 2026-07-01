# 项目进展日志

> 最后更新: 2026-07-01 16:00

## 2026-07-01 下午：Bug 修复 + 体验优化

### P0 编译错误修复
- CreatePostPage.vue：删除重复 handleSubmit 代码块，修复 reviewing.value
- ai-topics.js：删除引用未定义 topic 变量的 return 语句，移除未定义 adoptTopic
- PostCard.vue：添加缺失 matchReason computed 属性
- HomePage.vue：修复重复 feed-end 代码块、缺失 </script> 闭合、switchFeedMode 闭合括号
- PeoplePage.vue：删除多余的 </div> 修复 v-if/v-else 结构
- ActivitiesPage.vue：删除重复 useRouter import 和 const router 声明
- 全项目：修复字面量 \n 编码问题（所有 .vue 文件）

### P1 性能优化
- like.js：乐观更新失败时状态回滚
- event.js：N+1 查询改为批量 IN 查询
- ProfilePage.vue：Promise.all 并行加载关注数据
- post.js / event.js / notification.js / follow.js：30s 数据缓存防重复请求

### P2 增量更新
- digest.js：新增 incrementalRefresh()，不清理已有数据，只更新变化部分
- DailyDigestPage.vue：refresh() 智能判断首次/增量

### P3 UI/UX 改进
- ProfilePage.vue：profile-stats 融合进 profile-cover（渐变卡片内联显示）
- AppNavbar.vue：退出登录后下拉菜单状态更新 + async logout
- AppNavbar.vue：下拉菜单改为"个人主页/我的收藏/退出登录"
- 通知铃铛：无消息时不再显示红点
- PostCard.vue + PostDetailPage.vue：点赞 likeBounce 弹性动画、收藏 starBounce 旋转弹性动画
- 首页 Hero：白底卡片改为蓝绿渐变背景
- Profile 封面：增强渐变层次 + 投影
- Google Fonts：引入 Inter + Noto Sans SC

### 日报模块重新设计
- 移除管理后台数据（新注册用户数、新晋活跃用户）
- 新增"今日亮点"模块
- AI 建议改为给同学们的一句话小建议
- 更新 AI prompt 生成更贴近同学视角的内容

### 遇到的错误
| 错误 | 解决方案 |
|------|---------|
| ref is not defined (PostCard) | 添加 ref 到 import |
| PAGE_SIZE is not defined (post.js) | 恢复丢失的常量 |
| store return 语句缺失 return 关键字 | 修复 notification/post/event.js |
| HomePage 字面量 \n | 全项目批量替换 |
| CSS 闭合括号缺失 | 逐个修复 profile/home/digest 页面 |
| 下拉菜单退出登录状态不更新 | async logout + 条件渲染 |

---

## 2026-07-01 上午：工程化改进

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

---

## 2026-07-01 上午：P0 AI 闭环系统

- AI 内容审核：发帖前自动合规检查（已集成到 CreatePostPage）
- AI 推荐原因：PostCard + PeoplePage 展示推荐理由
- AI 调用日志：017_ai_logs.sql + ai-log.js

### P1 提升作品质量
- AI 评论助手：CommentForm 新增 AI 建议按钮
- AI Buddy 推荐理由：BuddiesPage 展示共同兴趣
- Prompt Version 管理：prompts.js 集中管理 8 个模板

---

## 2026-06-30

### Coze 集成 + 修复
- Vite proxy 解决 Coze CORS
- 编码修复（ActivitiesPage/DiscoverPage/EventsPage）
- digest.js bug 修复（作用域/字段/排序）
- 图片上传改进 + SQL 迁移
- 无限滚动（IntersectionObserver）

### GitHub 推送
- branch: codex/coze-proxy-fix → merged to main
- 仓库: xy2041622796/ai-campus-community

---

## 2026-06-29

### 三层 AI 驱动升级
- 帖子语义结构化
- AI 画像 + 智能推荐
- AI 社区日报
- AI Feed 重排序（双模式 Feed）

---

## 项目统计

| 指标 | 数值 |
|------|------|
| 源文件 | 58 |
| Store | 14 |
| 页面 | 20 |
| 组件 | 14 |
| Utils | 3 |
| 数据库迁移 | 17 |
| Prompt 模板 | 8 |

## 当前状态

**项目已完成全部 P0/P1 功能**，实现了完整的 AI 闭环系统。

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
