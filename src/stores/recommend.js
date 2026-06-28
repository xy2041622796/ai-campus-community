import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useRecommendStore = defineStore('recommend', () => {
  const users = ref([])
  const loading = ref(false)

  async function fetchRecommendations() {
    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.rpc('get_recommended_users', {
        current_user_id: user.id,
        match_limit: 20
      })
      if (error) throw error
      users.value = data || []
    } catch (e) {
      console.error('[Recommend]', e)
    } finally {
      loading.value = false
    }
  }

  return { users, loading, fetchRecommendations }
})
