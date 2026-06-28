import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useAIStore = defineStore('ai', () => {
  const polishing = ref(false)
  const suggesting = ref(false)
  const embedding = ref(false)

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

  async function generateEmbedding(text) {
    embedding.value = true
    try {
      const res = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('\u5d4c\u5165\u670d\u52a1\u5931\u8d25')
      const data = await res.json()
      return data.embedding || []
    } catch (e) {
      console.error('[AI] embedding error:', e)
      return []
    } finally {
      embedding.value = false
    }
  }

  /** \u8bed\u4e49\u641c\u7d22：\u751f\u6210embedding -> \u67e5pgvector */
  async function semanticSearch(query) {
    const embedding = await generateEmbedding(query)
    if (!embedding.length) return []

    const { data, error } = await supabase.rpc('search_posts', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 20
    })
    if (error) {
      console.error('[AI] search error:', error)
      return []
    }
    return data || []
  }

  return { polishing, suggesting, embedding, polishContent, suggestTags, generateEmbedding, semanticSearch }
})
