import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([])
  const loading = ref(false)

  async function fetchComments(postId) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      comments.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function addComment(postId, content, parentId = null) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('请先登录')

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, content: content.trim(), parent_id: parentId })
      .select('*, author:author_id(id, nickname, avatar_url, college, grade)')
      .single()
    if (error) throw error
    comments.value.push(data)
    return data
  }

  async function deleteComment(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
    comments.value = comments.value.filter(c => c.id !== commentId && c.parent_id !== commentId)
  }

  return { comments, loading, fetchComments, addComment, deleteComment }
})
