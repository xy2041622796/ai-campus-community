<template>
  <div class="discover-page">
    <div class="discover-header">
      <h1 class="discover-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        发现
      </h1>
      <p class="discover-desc">探索校园的精彩</p>
    </div>

    <div class="tag-filter">
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-filter-btn"
        :class="{ active: activeTag === tag }"
        @click="activeTag = tag"
      >{{ tag === 'all' ? '全郢' : tag }}</button>
    </div>

    <div v-if="loading" class="discover-loading">
      <div class="dl-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="filteredPosts.length" class="discover-grid">
      <div v-for="post in filteredPosts" :key="post.id" class="discover-card" @click="router.push('/posts/' + post.id)">
        <div v-if="post.images?.length" class="dc-image">
          <img :src="post.images[0]" alt="" loading="lazy" />
        </div>
        <div class="dc-body">
          <div class="dc-tags">
            <span v-for="tag in post.tags?.slice(0, 2)" :key="tag" class="dc-tag">{{ tag }}</span>
          </div>
          <h3 class="dc-title">{{ post.title }}</h3>
          <p class="dc-desc">{{ post.content?.slice(0, 80) }}{{ post.content?.length > 80 ? '...' : '' }}</p>
          <div class="dc-meta">
            <span class="dc-author">{{ post.author?.nickname || '未知用户' }}</span>
            <span class="dc-time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="discover-empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <h3>暂有相条的帖子</h3>
      <p>试试一个校超吧吗吧吗吧吗</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { formatTime } from '@/utils/helpers'

const router = useRouter()
const postStore = usePostStore()
const activeTag = ref('all')
const loading = ref(true)

const allTags = computed(() => {
  const tags = new Set()
  tags.add('all')
  postStore.posts.forEach(p => p.tags?.forEach(t => tags.add(t)))
  return Array.from(tags)
})

const filteredPosts = computed(() => {
  if (activeTag.value === 'all') return postStore.posts
  return postStore.posts.filter(p => p.tags?.includes(activeTag.value))
})

onMounted(async () => {
  await postStore.fetchPosts(true)
  loading.value = false
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.discover-page { animation: pageFadeIn 0.4s ease; }
@keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.discover-header { margin-bottom: 24px; }

.discover-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: $font-display;
  font-size: $font-size-xl;
  font-weight: 700;
  color: $color-text-primary;
  margin: 0 0 4px;
  svg { color: $color-primary; }
}

.discover-desc { font-size: $font-size-sm; color: $color-text-tertiary; margin: 0; }

.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.tag-filter-btn {
  padding: 5px 14px;
  border: 1px solid $color-border-light;
  border-radius: $radius-round;
  background: $color-card;
  color: $color-text-tertiary;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover { border-color: $color-primary; color: $color-primary; background: $color-primary-subtle; }

  &.active {
    background: $color-primary-gradient;
    color: white;
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(74, 108, 247, 0.2);
  }
}

.discover-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: $color-text-tertiary;
}

.dl-spinner {
  width: 20px; height: 20px;
  border: 2px solid $color-border;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.discover-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.discover-card {
  background: $color-card;
  border: 1px solid $color-border-light;
  border-radius: $radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: $shadow-card;

  &:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-2px);
  }
}

.dc-image {
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  background: $color-surface;
  img { width: 100%; height: 100%; object-fit: cover; }
}

.dc-body { padding: 14px; }

.dc-tags { display: flex; gap: 4px; margin-bottom: 6px; }

.dc-tag {
  font-size: 0.65rem;
  padding: 1px 8px;
  background: $color-primary-subtle;
  color: $color-primary;
  border-radius: $radius-round;
  font-weight: 500;
}

.dc-title {
  font-family: $font-display;
  font-size: 0.95rem;
  font-weight: 650;
  color: $color-text-primary;
  line-height: $line-height-tight;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-desc {
  font-size: $font-size-sm;
  color: $color-text-tertiary;
  line-height: $line-height-normal;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dc-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: $color-text-tertiary;
}

.dc-author { font-weight: 500; color: $color-text-secondary; }

.discover-empty {
  text-align: center;
  padding: 80px 20px;
  color: $color-text-tertiary;
  h3 { font-size: $font-size-lg; font-weight: 600; color: $color-text-primary; margin: 12px 0 4px; }
  p { font-size: $font-size-sm; margin: 0; }
}

@media (max-width: 768px) {
  .discover-grid { grid-template-columns: 1fr; }
}
</style>

