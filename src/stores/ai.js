import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/api/supabase'

export const useAIStore = defineStore('ai', () => {
  const polishing = ref(false)
  const suggesting = ref(false)

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

  async function suggestTags(text) {
    suggesting.value = true
    try {
      const res = await fetch('/agnes/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'agnes-2.0-flash',
          messages: [
            { role: 'user', content: '根据用户的帖子内容，推荐3-5个最相关的标签。只返回JSON数组格式，例如：[\“标签1\”,\“标签2\”,\“标签3\”]。不要加任何解释。\n\n' + text }
          ]
        })
      })
      if (!res.ok) throw new Error('标签服务失败')
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || '[]'
      try { return JSON.parse(raw) } catch { return raw.split(/[,,、]/).map(t => t.trim()).filter(Boolean).slice(0, 5) }
    } catch (e) { console.error('[AI] suggest-tags error:', e); return [] }
    finally { suggesting.value = false }
  }

  async function searchPosts(query) {
    const { data, error } = await supabase.rpc('search_posts_text', { search_query: query, match_count: 20 })
    if (error) { console.error('[AI] search error:', error); return [] }
    return data || []
  }

  return { polishing, suggesting, polishContent, suggestTags, searchPosts }
})
