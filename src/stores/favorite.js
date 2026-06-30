import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoritedPosts = ref(new Set())
  const toggling = ref(false)
  const favoriteList = ref([])

  async function fetchFavoritedPosts(userId) {
    if (!userId) return
    const { data } = await supabase.from('favorites').select('post_id').eq('user_id', userId)
    if (data) favoritedPosts.value = new Set(data.map(f => f.post_id))
  }

  function isFavorited(postId) {
    return favoritedPosts.value.has(postId)
  }

  async function toggleFavorite(postId) {
    if (toggling.value) return
    toggling.value = true
    try {
      const { data: { user } } = await supabase.auth.getSession()
      if (!user) return

      if (isFavorited(postId)) {
        await supabase.from('favorites').delete()
          .eq('post_id', postId).eq('user_id', user.id)
        favoritedPosts.value.delete(postId)
      } else {
        await supabase.from('favorites').insert({ post_id: postId, user_id: user.id })
        favoritedPosts.value.add(postId)
      }
    } catch (e) { console.error('[Favorite]', e) }
    finally { toggling.value = false }
  }

  async function fetchFavoritePosts(userId) {
    if (!userId) return
    const { data } = await supabase.from('favorites')
      .select('post_id').eq('user_id', userId).order('created_at', { ascending: false })
    if (!data || !data.length) { favoriteList.value = []; return }
    const postIds = data.map(f => f.post_id)
    const { data: posts } = await supabase.from('posts')
      .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
      .in('id', postIds).order('created_at', { ascending: false })
    favoriteList.value = posts || []
  }

  return { favoritedPosts, toggling, favoriteList, fetchFavoritedPosts, isFavorited, toggleFavorite, fetchFavoritePosts }
})
