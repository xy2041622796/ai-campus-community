import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useAIStore = defineStore('ai', () => {
  const polishing = ref(false)
  const suggesting = ref(false)

  async function polishContent(text) {
    polishing.value = true
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('\u6da6\u8272\u670d\u52a1\u5931\u8d25')
      const data = await res.json()
      return data.polished || text
    } catch (e) {
      console.error('[AI] polish error:', e)
      return text
    } finally {
      polishing.value = false
    }
  }

  async function suggestTags(text) {
    suggesting.value = true
    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('\u6807\u7b7e\u670d\u52a1\u5931\u8d25')
      const data = await res.json()
      return data.tags || []
    } catch (e) {
      console.error('[AI] suggest-tags error:', e)
      return []
    } finally {
      suggesting.value = false
    }
  }

  /** \u5168\u6587\u641c\u7d22\uff08\u4f7f\u7528 PostgreSQL \u5185\u7f6e\u641c\u7d22\uff0c\u65e0\u9700 embedding API\uff09 */
  async function searchPosts(query) {
    const { data, error } = await supabase.rpc('search_posts_text', {
      search_query: query,
      match_count: 20
    })
    if (error) {
      console.error('[AI] search error:', error)
      return []
    }
    return data || []
  }

  return { polishing, suggesting, polishContent, suggestTags, searchPosts }
})
