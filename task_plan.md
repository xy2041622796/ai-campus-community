# 任务计划：ai-campus-community 校园社区平台

## 目标
构建一个完整的 AI 智能化校园交流平台，包含用户系统、帖子社区、互动通知、AI 辅助功能等核心功能模块

## 当前阶段
Phase 3 完成 — 评论 + 通知中心已实现

Phase 2 完成 — SCSS 编译错误已修复
下一阶段推荐：Phase 3（互动与通知系统：评论 + 通知中心）

## 各阶段

### Phase 1：项目骨架与基础用户体系
- [x] Vite 6 + Vue 3.5 + Pinia 3 + Vue Router 4 脚手架
- [x] Supabase 集成（Auth + Database + Storage）
- [x] Auth 登录注册（学号邮箱映射 s{id}@campus.auth）
- [x] 用户资料 CRUD + 关注系统（FollowButton）
- [x] 用户搜索功能
- [x] 路由守卫与权限控制
- [x] 布局系统（Navbar / Sidebar / BottomNav / AppLayout）
- [x] 全站 UI 重设计（SVG 图标、渐变、毛玻璃效果）
- [x] 自适应移动端布局（768px 断点）
状态：complete

### Phase 2：帖子社区核心功能
- [x] 数据库迁移（posts / likes / favorites 表 + RLS）
- [x] Pinia Stores（post / like / favorite）
- [x] 帖子 CRUD（创建/列表/详情/编辑/删除）
- [x] PostCard / LikeButton / FavoriteButton / ImageUploader 组件
- [x] 图片上传（Supabase Storage post-images bucket）
- [x] 无限滚动加载（IntersectionObserver）
- [x] 首页 Feed 流 + 用户资料页帖子/收藏 Tab
- [x] SCSS 编译错误全面修复（21 文件，20+ 模式，7 轮迭代）
状态：complete

### Phase 3：互动与通知系统
- [x] 评论回复（comments 表 + CommentList/CommentForm 组件）
- [x] 通知中心（notifications 表 + Badge + /notifications 页）
- [x] 未读数标记 + 导航栏集成
状态：complete

### Phase 4：AI 辅助发帖 & 语义搜索
- [x] AI 润色 UI（按钮 + Store 框架）
- [x] pgvector 迁移 + embedding 表结构`n- [ ] 混合搜索 + AI 摘要（对接 pgvector + Embedding API）
状态：in_progress

### Phase 5：AI 社交匹配系统
- [ ] 智能用户推荐 / 搭子匹配 / 校友匹配
状态：in_progress

### Phase 6：AI 活动策划推荐
- [ ] 活动发布报名（events / participants 表）
- [x] AI 策划助手（创建活动页“AI 策划助手”按钮）
- [ ] 个性化推荐
状态：in_progress

## 关键问题
1. Supabase 需启用 Email Auth Provider 才能注册
2. Storage RLS 需手动配置（公开读 + 认证写）
3. SCSS 损坏已提交 git，后续修改注意变量引用格式
4. /activities /messages 仅 redirect 无独立页面 — /discover 已创建独立页面
5. 无测试框架 / CI/CD / Docker

## 已做决策
| 决策 | 理由 |
|------|------|
| Vue 3 + Composition API + Pinia | 现代前端技术栈 |
| Element Plus 2.x | Vue 3 兼容，组件丰富 |
| Supabase（Auth + DB + Storage） | 全栈一体化 |
| SCSS + 设计系统 Token | 统一主题管理 |
| SVG 内联图标 | 无网络请求，可着色 |
| 学号邮箱映射 s{id}@campus.auth | 校园场景无需真实邮箱 |
| 蓝绿渐变主色 | 年轻清爽风格 |
| 帖子图片独立 Bucket | 与头像分离管理 |



