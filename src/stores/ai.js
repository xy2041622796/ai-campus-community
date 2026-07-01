import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/api/supabase'

export const useAIStore = defineStore('ai', () => {
  const polishing = ref(false)
  const suggesting = ref(false)
  const generating = ref(false)
  const semanticSearchLoading = ref(false)

  // ============ 文本润色 ============
  async function polishContent(text) {
    polishing.value = true
    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: '你是一个校园社区助手。请润色以下帖子内容，使其更通顺、更吸引人。保持原意和风格，只优化表达，不改变事实。直接返回润色后的结果，不要加任何解释。\n\n' + text }
          ]
        })
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('[AI] Agnes error:', res.status, err)
        throw new Error('润色服务失败（' + res.status + '）')
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || text
    } catch (e) {
      console.error('[AI] error:', e)
      ElMessage.error(e.message || '服务失败')
      return text
    } finally {
      polishing.value = false
    }
  }

  // ============ 标签推荐 ============
  async function suggestTags(text) {
    suggesting.value = true
    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: '根据以下帖子内容，推荐3-5个最相关的校园分类标签。只返回JSON数组格式，如["标签1","标签2","标签3"]。不要加任何解释。\n\n' + text }
          ]
        })
      })
      if (!res.ok) throw new Error('标签服务失败')
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '[]'
      try { return JSON.parse(raw) } catch { return raw.split(/[,，。]/).map(t => t.trim()).filter(Boolean).slice(0, 5) }
    } catch (e) { console.error('[AI] suggest-tags error:', e); return [] }
    finally { suggesting.value = false }
  }

  // ============ 封面图生成 ============
  async function generateCoverImage(prompt) {
    generating.value = true
    try {
      const res = await fetch('/agnes/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-image-2.1-flash',
          prompt: `一键生成关于"${prompt}"的精美配图插画，明亮清新，高清插画风格`,
          extra_body: { response_format: 'url' },
          size: '1024x1024'
        })
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('[AI] Image error:', res.status, err)
        throw new Error('图片生成失败')
      }
      const data = await res.json()
      return data.data?.[0]?.url || null
    } catch (e) {
      console.error('[AI] generate image error:', e)
      ElMessage.error(e.message || '图片生成失败')
      return null
    } finally {
      generating.value = false
    }
  }

  // ============ 语义搜索 ============
  async function semanticSearch(query) {
    semanticSearchLoading.value = true
    try {
      // 1. 用 AI 为搜索意图生成 embedding
      const embRes = await fetch('/agnes/v1/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query
        })
      })
      if (!embRes.ok) throw new Error('Embedding 生成失败')
      const embData = await embRes.json()
      const embedding = embData.data?.[0]?.embedding
      if (!embedding) throw new Error('无 embedding 返回')

      // 2. 用 embedding 在 supabase 中搜索相似帖子
      const { data, error } = await supabase.rpc('search_posts_semantic', {
        query_embedding: embedding,
        match_count: 10
      })
      if (error) throw error
      return data || []
    } catch (e) {
      console.error('[AI] semantic search error:', e)
      return []
    } finally {
      semanticSearchLoading.value = false
    }
  }

  // ============ 搜索结果 AI 摘要 ============
  async function generateSearchSummary(query, results) {
    if (!results.length) return ''
    try {
      const titles = results.map(r => `- ${r.title}`).join('\n')
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: `用户搜索了"${query}"，找到了以下相关帖子：\n${titles}\n\n请用一句话总结这些帖子的共同主题或内容方向，帮助用户快速了解搜索结果概况。直接返回总结，30字以内。` }
          ]
        })
      })
      if (!res.ok) return ''
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (e) {
      console.error('[AI] summary error:', e)
      return ''
    }
  }

  // ============ 推荐理由生成 ============
  async function generateRecommendationReason(user, targetUser) {
    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: `用户A的兴趣标签：${(user.interest_tags || []).join(', ')}, 学院：${user.college || '未知'}\n用户B的兴趣标签：${(targetUser.interest_tags || []).join(', ')}, 学院：${targetUser.college || '未知'}\n\n请用一句话解释为什么这两个人可能合得来，30字以内。直接返回结果。` }
          ]
        })
      })
      if (!res.ok) return ''
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (e) {
      console.error('[AI] recommend reason error:', e)
      return ''
    }
  }

  // ============ AI 活动策划 ============
  async function planEvent(title, details) {
    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: `你是校园活动策划助手。用户想组织一个活动：${title}\n其他信息：${details || '无'}\n\n请生成：1. 活动描述和流程 2. 宣传文案（50字以内）3. 准备事项。使用简洁的格式返回。` }
          ]
        })
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.choices?.[0]?.message?.content || null
    } catch (e) {
      console.error('[AI] plan event error:', e)
      return null
    }
  }

  // ============ 活动推荐 ============
  async function recommendEvents(userInterests, allEvents) {
    if (!allEvents.length) return []
    try {
      const eventsInfo = allEvents.map(e => `- ${e.title}: ${e.description?.slice(0, 50)}`).join('\n')
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: `用户兴趣标签：${(userInterests || []).join(', ')}\n\n当前可用活动：\n${eventsInfo}\n\n请根据用户兴趣推荐3个最合适的活动，只返回JSON数组格式如["活动1","活动3","活动5"]，用活动标题匹配。不要加解释。` }
          ]
        })
      })
      if (!res.ok) return []
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '[]'
      try { return JSON.parse(raw) } catch { return [] }
    } catch (e) {
      console.error('[AI] recommend events error:', e)
      return []
    }
  }

  // ============ 帖子结构化分析 ============
  async function analyzePostStructure(title, content) {
    try {
      const prompt = '你是校园社区AI分析助手。请分析以下帖子的语义结构，返回JSON格式：\n{\n  "intent": "分享|求助|吐槽|招募|交易",\n  "emotion": "positive|negative|neutral",\n  "topics": ["话题1", "话题2", "话题3"],\n  "summary": "一句话总结，20字以内"\n}\n\n帖子标题：' + title + '\n帖子内容：' + content + '\n\n只返回JSON，不要任何解释。'
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [{ role: 'user', content: prompt }]
        })
      })
      if (!res.ok) return null
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '{}'
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      return JSON.parse(cleaned)
    } catch (e) {
      console.error('[AI] analyze post structure error:', e)
      return null
    }
  }


  // ============ AI 发帖助手 ============
  async function generatePost(userInput) {
    try {
      const prompt = "You are a campus post assistant. User typed: " + userInput + ". Judge post type (vent/help/discuss/share), then generate: {postType, title(15chars), content(100-300chars casual), tags(3 campus tags), emotion}. Return pure JSON only."
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [{ role: 'user', content: prompt }]
        })
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '{}'
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      return JSON.parse(cleaned)
    } catch (e) {
      console.error('[AI] generatePost error:', e)
      return null
    }
  }
  return {
    polishing, suggesting, generating, semanticSearchLoading,
    polishContent, suggestTags, generateCoverImage,
    semanticSearch, generateSearchSummary, generateRecommendationReason,
    planEvent, recommendEvents, analyzePostStructure, generatePost
  }
})
