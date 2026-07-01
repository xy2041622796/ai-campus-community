import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import { useAIProfileStore } from '@/stores/ai-profile'

export const useRecommendStore = defineStore('recommend', () => {
  const users = ref([])
  const loading = ref(false)
  const graphRelationships = ref(new Map())
  const aiProfileStore = useAIProfileStore()

  async function fetchRecommendations() {
    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 先更新当前用户的 AI 画像
      await aiProfileStore.updateUserProfile(user.id)

      // 获取推荐用户列表
      const { data, error } = await supabase.rpc('get_recommended_users', {
        current_user_id: user.id,
        match_limit: 20
      })
      if (error) throw error
      users.value = data || []

      // 批量分析关系图谱（一次 RPC 查询所有用户）
      graphRelationships.value.clear()
      if (data && data.length > 0) {
        const userIds = data.map(u => u.id)
        const { data: rels, error: relError } = await supabase.rpc('batch_analyze_relationships', {
          target_user_id: user.id,
          candidate_ids: userIds
        })
        if (!relError && rels) {
          rels.forEach(r => {
            if (r.total_strength > 0) {
              graphRelationships.value.set(r.user_id, {
                relationships: r.relationships,
                totalStrength: r.total_strength
              })
            }
          })
        }
      }
    } catch (e) {
      console.error('[Recommend]', e)
    } finally {
      loading.value = false
    }
  }

  return { users, loading, fetchRecommendations, graphRelationships }
})
