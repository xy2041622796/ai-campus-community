import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const page = ref(0)
  const hasMore = ref(true)
  const lastFetchTime = ref(null)
  const PAGE_SIZE = 10
  const feedMode = ref('recommended')

  async function fetchPosts(reset = false) {
    if (loading.value) return
    if (!reset && lastFetchTime.value && Date.now() - lastFetchTime.value < 30000) { loading.value = false; return }
    loading.value = true
    try {
      if (reset) { page.value = 0; posts.value = []; hasMore.value = true }
      const from = page.value * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      if (data && data.length < PAGE_SIZE) hasMore.value = false
      posts.value = reset ? (data || []) : [...posts.value, ...(data || [])]
      page.value++
    } finally { loading.value = false; lastFetchTime.value = Date.now() }
  }

  async function fetchPostById(postId) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
        .eq('id', postId)
        .single()
      if (error) throw error
      currentPost.value = data
      return data
    } finally { loading.value = false }
  }


  async function createPost({ title, content, images, tags, intent, emotion, topics, summary }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('璇峰厛鐧诲綍')
    const { data, error } = await supabase.from('posts').insert({
      author_id: user.id,
      title: title.trim(),
      content: content.trim(),
      images: images || [],
      tags: tags || [],
      intent: intent || null,
      emotion: emotion || null,
      topics: topics || [],
      summary: summary || null
    }).select('*, author:author_id(id, nickname, avatar_url, college, grade)').single()
    if (error) throw error
    posts.value.unshift(data)
    return data
  }

  async function updatePost(postId, { title, content, images, tags }) {
    const { data, error } = await supabase.from('posts').update({
      title: title.trim(), content: content.trim(),
      images: images || [], tags: tags || []
    }).eq('id', postId).select('*, author:author_id(id, nickname, avatar_url, college, grade)').single()
    if (error) throw error
    const idx = posts.value.findIndex(p => p.id === postId)
    if (idx !== -1) posts.value[idx] = data
    if (currentPost.value?.id === postId) currentPost.value = data
    return data
  }

  async function deletePost(postId) {
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error
    posts.value = posts.value.filter(p => p.id !== postId)
    if (currentPost.value?.id === postId) currentPost.value = null
  }

  async function fetchPostsByAuthor(authorId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  // AI 涓€у寲 Feed锛堟寜鍒嗘暟鎺掑簭锛?
  async function fetchPersonalizedFeed(reset = false) {
    if (loading.value) return
    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (reset) { page.value = 0; posts.value = []; hasMore.value = true }
      const from = page.value * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase.rpc('get_personalized_feed', {
        target_user_id: user.id,
        limit_count: PAGE_SIZE,
        offset_count: from
      })

      if (error) throw error

      // 鏄犲皠鏁版嵁缁撴瀯锛屼笌 fetchPosts 淇濇寔涓€鑷?
      const mappedData = (data || []).map(p => ({
        ...p,
        author: {
          id: p.author_id,
          nickname: p.author_nickname,
          avatar_url: p.author_avatar
        }
      }))

      if (mappedData.length < PAGE_SIZE) hasMore.value = false
      posts.value = reset ? mappedData : [...posts.value, ...mappedData]
      page.value++
    } catch (e) {
      console.error('[PostStore] Personalized feed error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    posts, currentPost, loading, hasMore, lastFetchTime,
    fetchPosts, fetchPostById, createPost, updatePost, deletePost, fetchPostsByAuthor,
    fetchPersonalizedFeed
  }
})
