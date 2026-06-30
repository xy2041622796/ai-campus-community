# 项目发现与研究记录

> 最后更新: 2026-06-29

## 架构决策

### 认证方案
- 使用学号映射为邮箱格式 `s{学号}@campus.auth` 兼容 Supabase Auth
- Supabase Auth 自动触发器在用户注册时创建 profiles 记录

### 数据库设计
- 使用 PostgreSQL RLS（行级安全策略）控制数据访问
- 使用触发器自动处理通知和更新时间戳
- 使用 pgvector 扩展支持语义搜索
- 使用 PostgreSQL tsvector 支持全文搜索

### AI 集成
- 通过 Vite proxy 代理到 Agnes AI API（apihub.agnes-ai.com）
- 使用模型 `agnes-2.0-flash` 进行文本生成
- 使用模型 `agnes-image-2.1-flash` 进行图片生成
- 使用模型 `text-embedding-3-small` 进行 embedding 生成

## 已知问题

## AI 驱动升级发现（2026-06-29）

### 帖子语义结构化
- posts 表已扩展：intent/emotion/topics/summary 字段
- AI 分析使用 agnes-2.0-flash 模型
- 结构化数据支持 Feed 按意图/情绪/主题筛选
- PostCard 组件展示 AI 标签（意图徽章、情绪emoji、摘要）

### 用户行为追踪
- 新建 user_behavior 表记录用户互动行为
- 支持追踪：read/like/comment/follow/favorite 动作
- 行为数据用于生成用户 AI 画像

### AI 用户画像
- ai-profile store 分析用户兴趣、活跃时间、社交倾向
- 计算行为分数（0-100）
- 支持用户相似度计算（基于标签+学院）

### AI 社区日报
- digest store 聚合当日帖子、评论、新用户数据
- 调用 AI 生成结构化日报（JSON 格式）
- 包含：概览统计、情绪趋势、热门话题、热帖TOP5、活跃用户、AI建议
- 页面位于 /digest，侧边栏有导航入口

### 性能考虑
- AI 分析在发帖时异步执行，不阻塞提交
- 日报数据实时生成，无缓存机制
- 用户画像按需更新，非实时更新


### 1. 编码问题
- `helpers.js` 中的中文时间格式化字符串显示为乱码（"刚刚"等）
- `009_event_notifications.sql` 中的注释显示为乱码
- `011_ai_search_and_matching.sql` 中的 VALUES 语句中文显示为乱码

### 2. Notification 表缺失
- `notification.js` store 中包含对 `PGRST205` 错误的处理
- 说明 notifications 表可能在某些环境中未创建

### 3. 图片上传
- `ImageUploader.vue` 组件存在，但 Supabase Storage bucket 配置不明确
- `getStorageUrl` 工具函数存在，但实际上传逻辑可能不完整

### 4. 代理配置
- Vite proxy 目标硬编码了 Vercel 部署地址
- `.env` 文件中 `VITE_AGNES_KEY` 和 `AGNES_API_KEY` 两个变量名同时存在

### 5. 自动导入插件
- 使用了 `unplugin-auto-import` 和 `unplugin-vue-components`
- 这两个插件会自动导入 Element Plus 组件和 API
- 可能导致某些组件的显式 import 冗余

## 技术细节

### SCSS 设计 Token
- 完整的色彩系统（主色、强调色、中性色、状态色）
- 间距系统（4px~48px 五级刻度）
- 圆角系统（6px~999px）
- 阴影系统（sm~xl 四级）
- 字体系统（Display/Body/Mono 三种字族）
- 过渡动画（fast/normal/slow/bounce 四种节奏）

### 组件结构
- **common/**: 通用业务组件（评论、点赞、关注、图片上传等）
- **layout/**: 布局组件（导航栏、侧边栏、底部导航、主布局）
- **views/**: 页面级组件，按功能模块分组

### Store 结构
- 12 个 Pinia store，每个对应一个业务领域
- auth/store 管理用户状态和认证流程
- ai/store 封装所有 Agnes AI API 调用
- 其余 store 分别管理 posts/comments/likes/favorites/notifications/follows/profile/recommend/events

## 环境配置

### Supabase 项目
- URL: `https://lomdzbulgkowyomrjygr.supabase.co`
- 匿名密钥存储在 `.env` 中
- 11 个迁移文件覆盖完整数据模型

### Vercel 部署
- `vercel.json` 存在，配置了 SPA 路由重写
- 代理目标指向 Vercel 生产环境
