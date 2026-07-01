import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import { analyzePost } from '@/api/coze'
import { logAICall } from '@/utils/ai-log'

export const useAITopicsStore = defineStore('ai-topics', () => {
  const topics = ref([])
  const loading = ref(false)
  const lastGenerated = ref(null)
  const quietMode = ref(false)

  // 检查社区是否冷清（过去N小时内帖子数少于阈值）
  async function checkCommunityActivity(hours = 6, threshold = 3) {
    try {
      const since = new Date()
      since.setHours(since.getHours() - hours)

      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since.toISOString())

      if (error) throw error
      quietMode.value = (count || 0) < threshold
      return quietMode.value
    } catch (e) {
      console.error('[AITopics] Check activity failed:', e)
      return false
    }
  }

  // 获取近期热门话题（从已有帖子中提取）
  async function fetchHotTopics(days = 3, limit = 10) {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const { data, error } = await supabase
        .from('posts')
        .select('tags, topics')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // 统计话题出现频率
      const tagCount = {}
      for (const post of data || []) {
        const allTags = [...(post.tags || []), ...(post.topics || [])]
        for (const tag of allTags) {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      }

      return Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }))
    } catch (e) {
      console.error('[AITopics] Fetch hot topics failed:', e)
      return []
    }
  }

  // 生成 AI 话题建议
  async function generateTopicSuggestions() {
    loading.value = true
    try {
      const hotTopics = await fetchHotTopics()
      const isQuiet = await checkCommunityActivity()

      // 有热帖时基于热帖生成话题，冷清时直接生成通用话题
      let prompt
      if (hotTopics.length > 0) {
        const topicsStr = hotTopics.map(t => t.tag).join('、')
        prompt = `校园社区近期热门话题有：${topicsStr}。请基于这些话题生成 3 个讨论主题，每个主题包括标题和简短描述，适合学生在社区中讨论。返回 JSON 数组格式：[{"title":"...","description":"...","tags":["标签1","标签2"]}]`
      } else {
        prompt = '你是校园社区运营助手。社区最近比较冷清，请生成 3 个有趣的校园讨论主题来活跃气氛，每个主题包括标题和简短描述。话题要贴近大学生活（学习、实习、社团、情感、美食等）。返回 JSON 数组格式：[{"title":"...","description":"...","tags":["标签1","标签2"]}]'
      }

      const start = Date.now()
      const result = await analyzePost(prompt)
      logAICall({ service: 'coze', action: 'generate_topic', latencyMs: Date.now() - start, success: !!result })

      if (result && Array.isArray(result)) {
        topics.value = result
      } else if (result && result.topics) {
        topics.value = result.topics
      }
      lastGenerated.value = new Date().toISOString()
    } catch (e) {
      console.error('[AITopics] Generate failed:', e)
      logAICall({ service: 'coze', action: 'generate_topic', latencyMs: 0, success: false, errorMessage: e.message })
    } finally {
      loading.value = false
    }
  }

  return {
    topics, loading, lastGenerated, quietMode,
    generateTopicSuggestions, checkCommunityActivity
  }
})
