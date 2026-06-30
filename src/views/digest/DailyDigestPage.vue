<template>
  <div class="digest-page">
    <!-- 顶部 -->
    <div class="digest-header">
      <div class="dh-top">
        <div class="dh-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H2"/>
            <path d="M17 14l-5-5-5 5"/>
            <path d="M12 9v9"/>
          </svg>
        </div>
        <div>
          <h2 class="dh-title">AI 社区日报</h2>
          <p class="dh-sub">{{ formatDate(currentDate) }}</p>
        </div>
      </div>
      <button class="dh-refresh" :disabled="digestStore.loading" @click="refresh">
        <svg v-if="!digestStore.loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <span v-if="digestStore.loading" class="loading-spinner"></span>
        <span>{{ digestStore.loading ? '生成中...' : '刷新' }}</span>
      </button>
    </div>

    <!-- 加载中骨架屏 -->
    <div v-if="digestStore.loading && !digestStore.digest" class="digest-skeleton">
      <div class="sk-section">
        <div class="sk-line sk-title"></div>
        <div class="sk-line sk-bar w-60"></div>
      </div>
      <div class="sk-section">
        <div class="sk-line sk-title"></div>
        <div v-for="i in 3" :key="i" class="sk-card">
          <div class="sk-bar w-80"></div>
          <div class="sk-bar w-50"></div>
        </div>
      </div>
      <div class="sk-section">
        <div class="sk-line sk-title"></div>
        <div class="sk-tags">
          <div v-for="i in 4" :key="i" class="sk-tag"></div>
        </div>
      </div>
    </div>

    <!-- 日报内容 -->
    <template v-else-if="digestStore.digest">
      <!-- 整体概览 -->
      <section class="digest-section overview">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          今日概览
        </h3>
        <div class="overview-summary">{{ digestStore.digest.summary }}</div>
        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-num">{{ digestStore.digest.postCount ?? '-' }}</div>
            <div class="stat-label">今日发帖</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">{{ digestStore.digest.commentCount ?? '-' }}</div>
            <div class="stat-label">全部评论</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">{{ digestStore.digest.newUserCount ?? '-' }}</div>
            <div class="stat-label">新注册用户</div>
          </div>
        </div>
      </section>

      <!-- 情绪趋势 -->
      <section class="digest-section mood">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          社区情绪
        </h3>
        <div class="mood-bar">
          <div v-for="mood in digestStore.digest.moods" :key="mood.label" class="mood-item">
            <div class="mood-fill" :class="mood.colorClass" :style="{ width: mood.percent + '%' }"></div>
            <div class="mood-info">
              <span class="mood-label">{{ mood.label }}</span>
              <span class="mood-pct">{{ mood.percent }}%</span>
            </div>
          </div>
        </div>
        <div class="mood-insight">{{ digestStore.digest.moodInsight }}</div>
      </section>

      <!-- 热门话题 -->
      <section class="digest-section topics">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          热门话题
        </h3>
        <div class="topic-tags">
          <span v-for="t in digestStore.digest.topics" :key="t" class="topic-tag">{{ t }}</span>
        </div>
      </section>

      <!-- 热帖 TOP 5 -->
      <section class="digest-section hot-posts">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          今日热帖 TOP 5
        </h3>
        <div v-if="digestStore.digest.hotPosts?.length" class="hot-list">
          <div v-for="(post, idx) in digestStore.digest.hotPosts" :key="post.id"
            class="hot-item" :class="'top' + (idx + 1)"
            @click="$router.push('/posts/' + post.id)">
            <div class="hot-rank">{{ idx + 1 }}</div>
            <div class="hot-content">
              <div class="hot-title">{{ post.title }}</div>
              <div class="hot-meta">
                <span class="hot-author">{{ post.author?.nickname || '未知' }}</span>
                <span class="hot-dot">·</span>
                <span class="hot-stats">❤️ {{ post.likes || 0 }} · 💬 {{ post.comments || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">暂无热帖数据</div>
      </section>

      <!-- 活跃用户 -->
      <section class="digest-section active-users">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          新晋活跃用户
        </h3>
        <div v-if="digestStore.digest.activeUsers?.length" class="user-list">
          <div v-for="u in digestStore.digest.activeUsers" :key="u.id"
            class="user-item" @click="$router.push('/profile/' + u.id)">
            <img v-if="u.avatar_url" :src="u.avatar_url" class="user-avatar" />
            <div v-else class="user-avatar-placeholder">{{ u.nickname?.[0] || '?' }}</div>
            <div class="user-info">
              <div class="user-name">{{ u.nickname || '未知用户' }}</div>
              <div class="user-detail">{{ u.college || '未知学院' }} · {{ u.postCount }} 篇帖子</div>
            </div>
          </div>
        </div>
        <div v-else class="no-data">暂无活跃用户数据</div>
      </section>

      <!-- AI 建议 -->
      <section v-if="digestStore.digest.aiAdvice" class="digest-section advice">
        <h3 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          AI 建议
        </h3>
        <div class="advice-text">{{ digestStore.digest.aiAdvice }}</div>
      </section>
    </template>

    <!-- 空状态 -->
    <div v-else class="digest-empty">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H2"/>
        <path d="M17 14l-5-5-5 5"/>
        <path d="M12 9v9"/>
      </svg>
      <h3>暂无日报数据</h3>
      <p>社区数据不足，暂时无法生成日报</p>
      <button class="empty-btn" @click="refresh">再试一次</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDigestStore } from '@/stores/digest'

const router = useRouter()
const digestStore = useDigestStore()
const currentDate = ref(new Date())

function formatDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

async function refresh() {
  currentDate.value = new Date()
  await digestStore.fetchDailyDigest()
}

onMounted(async () => {
  await refresh()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.digest-page {
  animation: pageFadeIn 0.4s ease;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

@keyframes pageFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== Header ===== */
.digest-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.dh-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dh-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: $color-primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.dh-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0;
}

.dh-sub {
  font-size: 0.85rem;
  color: $color-text-tertiary;
  margin: 2px 0 0;
}

.dh-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid $color-border;
  border-radius: 10px;
  background: white;
  color: $color-text-secondary;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: $transition-fast;

  &:hover:not(:disabled) {
    border-color: $color-primary;
    color: $color-primary;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid $color-border-light;
  border-top: 2px solid $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Sections ===== */
.digest-section {
  background: white;
  border: 1px solid $color-border-light;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: $shadow-hover;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0 0 14px;

  svg {
    color: $color-primary;
  }
}

/* ===== Overview ===== */
.overview-summary {
  font-size: 0.95rem;
  color: $color-text-secondary;
  line-height: 1.7;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(74, 108, 247, 0.04);
  border-radius: 10px;
  border-left: 3px solid $color-primary;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  text-align: center;
  padding: 14px 8px;
  background: $color-surface;
  border-radius: 10px;

  .stat-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: $color-primary;
  }

  .stat-label {
    font-size: 0.8rem;
    color: $color-text-tertiary;
    margin-top: 4px;
  }
}

/* ===== Mood ===== */
.mood-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.mood-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mood-fill {
  height: 8px;
  border-radius: 4px;
  transition: width 0.6s ease;
  flex-shrink: 0;

  &.positive { background: #4CAF50; }
  &.calm { background: #2196F3; }
  &.anxious { background: #FF9800; }
  &.excited { background: #E91E63; }
}

.mood-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.mood-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: $color-text-secondary;
}

.mood-pct {
  font-size: 0.8rem;
  font-weight: 600;
  color: $color-text-primary;
}

.mood-insight {
  font-size: 0.9rem;
  color: $color-text-secondary;
  line-height: 1.6;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid $color-border-light;
}

/* ===== Topics ===== */
.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag {
  padding: 6px 14px;
  background: $color-primary-subtle;
  color: $color-primary;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: $color-primary;
    color: white;
  }
}

/* ===== Hot Posts ===== */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: $color-surface;
  }
}

.hot-rank {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  background: $color-surface;
  color: $color-text-tertiary;
  flex-shrink: 0;
}

.hot-item.top1 .hot-rank { background: linear-gradient(135deg, #FFD700, #FFA500); color: white; }
.hot-item.top2 .hot-rank { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: white; }
.hot-item.top3 .hot-rank { background: linear-gradient(135deg, #CD7F32, #B8860B); color: white; }

.hot-content { flex: 1; min-width: 0; }

.hot-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  font-size: 0.8rem;
  color: $color-text-tertiary;
}

.hot-dot { opacity: 0.5; }

.no-data {
  text-align: center;
  color: $color-text-tertiary;
  font-size: 0.9rem;
  padding: 20px 0;
}

/* ===== Active Users ===== */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: $color-surface;
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $color-primary-gradient;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: $color-text-primary;
}

.user-detail {
  font-size: 0.8rem;
  color: $color-text-tertiary;
  margin-top: 2px;
}

/* ===== Advice ===== */
.advice-text {
  font-size: 0.95rem;
  color: $color-text-secondary;
  line-height: 1.7;
  padding: 14px 18px;
  background: rgba(76, 175, 80, 0.06);
  border-radius: 10px;
  border-left: 3px solid #4CAF50;
}

/* ===== Skeleton ===== */
.digest-skeleton {
  .sk-section {
    background: white;
    border: 1px solid $color-border-light;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .sk-line {
    background: linear-gradient(90deg, $color-surface 25%, rgba(74, 108, 247, 0.06) 50%, $color-surface 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }

  .sk-title {
    height: 18px;
    width: 40%;
    margin-bottom: 12px;
  }

  .sk-bar {
    height: 12px;
    margin-bottom: 8px;
  }

  .sk-card {
    padding: 10px;
    background: $color-surface;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .sk-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sk-tag {
    width: 60px;
    height: 28px;
    border-radius: 14px;
  }

  .w-60 { width: 60%; }
  .w-80 { width: 80%; }
  .w-50 { width: 50%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Empty ===== */
.digest-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: $color-text-tertiary;

  svg {
    margin-bottom: 16px;
    opacity: 0.4;
  }

  h3 {
    font-weight: 600;
    color: $color-text-primary;
    margin: 0 0 4px;
  }

  p { margin: 0 0 20px; }
}

.empty-btn {
  padding: 10px 24px;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: $transition-fast;

  &:hover { opacity: 0.9; }
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .digest-page { padding: 16px 12px 40px; }

  .overview-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .stat-card .stat-num { font-size: 1.2rem; }

  .digest-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
