import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useLikeStore = defineStore('like', () => {
  const likedPosts = ref(new Set())
  const likeCounts = ref({})

  async function fetchLikedPosts(userId) {
    if (!userId) return
    const { data } = await supabase.from('likes').select('post_id').eq('user_id', userId)
    if (data) likedPosts.value = new Set(data.map(l => l.post_id))
  }

  function isLiked(postId) {
    return likedPosts.value.has(postId)
  }

  async function toggleLike(postId) {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return

    if (isLiked(postId)) {
      await supabase.from('likes').delete()
        .eq('post_id', postId).eq('user_id', user.id)
      likedPosts.value.delete(postId)
      if (likeCounts.value[postId]) likeCounts.value[postId]--
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      likedPosts.value.add(postId)
      if (likeCounts.value[postId]) likeCounts.value[postId]++
    }
  }

  async function fetchLikeCount(postId) {
    const { count, error } = await supabase.from('likes')
      .select('*', { count: 'exact', head: true }).eq('post_id', postId)
    if (!error) likeCounts.value[postId] = count || 0
    return count || 0
  }

  async function fetchLikeCounts(postIds) {
    if (!postIds.length) return
    const { data, error } = await supabase.from('likes')
      .select('post_id').in('post_id', postIds)
    if (error) return
    const counts = {}
    postIds.forEach(id => { counts[id] = 0 })
    data.forEach(l => { counts[l.post_id] = (counts[l.post_id] || 0) + 1 })
    Object.assign(likeCounts.value, counts)
  }

  return { likedPosts, likeCounts, fetchLikedPosts, isLiked, toggleLike, fetchLikeCount, fetchLikeCounts }
})