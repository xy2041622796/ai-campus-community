import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useAIProfileStore = defineStore('ai-profile', () => {
  const profile = ref(null)
  const loading = ref(false)
  const lastUpdated = ref(null)

  // 用户兴趣画像
  const interests = computed(() => profile.value?.interests || [])
  const behaviorScore = computed(() => profile.value?.behaviorScore || 0)
  const activeHours = computed(() => profile.value?.activeHours || {})
  const socialTendency = computed(() => profile.value?.socialTendency || '潜水')

  // 根据用户行为更新画像
  async function trackInteraction(userId, targetType, targetId, actionType) {
    try {
      const { data, error } = await supabase
        .from('user_behavior')
        .insert({
          user_id: userId,
          target_type: targetType, // 'post' | 'user' | 'event'
          target_id: targetId,
          action_type: actionType, // 'read' | 'like' | 'comment' | 'follow' | 'favorite'
          created_at: new Date().toISOString()
        })
      if (error) throw error
      // 触发画像更新
      await updateUserProfile(userId)
    } catch (e) {
      console.error('[AI-Profile] Track interaction failed:', e)
    }
  }

  // 分析用户画像
  async function updateUserProfile(userId) {
    if (!userId) return
    loading.value = true
    try {
      // 获取用户所有互动记录
      const { data: behaviors, error: behErr } = await supabase
        .from('user_behavior')
        .select('action_type, created_at, target_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (behErr) throw behErr
      
      const actions = behaviors || []
      
      // 统计各种行为数量
      const actionCounts = { like: 0, comment: 0, follow: 0, favorite: 0, read: 0 }
      const hours = {}
      
      for (const action of actions) {
        actionCounts[action.action_type] = (actionCounts[action.action_type] || 0) + 1
        const hour = new Date(action.created_at).getHours()
        hours[hour] = (hours[hour] || 0) + 1
      }
      
      // 计算社交倾向
      const totalInteractions = Object.values(actionCounts).reduce((a, b) => a + b, 0)
      let socialTendency = '潜水'
      if (totalInteractions > 20) socialTendency = '活跃'
      else if (totalInteractions > 5) socialTendency = '互动'
      
      // 计算活跃时间段
      let peakHour = 12
      let maxCount = 0
      for (const [hour, count] of Object.entries(hours)) {
        if (count > maxCount) {
          maxCount = count
          peakHour = parseInt(hour)
        }
      }
      
      // 计算行为分数
      const behaviorScore = Math.min(100, actionCounts.like * 2 + actionCounts.comment * 3 + actionCounts.follow * 1 + actionCounts.favorite * 2)
      
      // 获取用户兴趣标签
      const { data: userProfile, error: profErr } = await supabase
        .from('profiles')
        .select('interest_tags')
        .eq('id', userId)
        .single()
      
      if (profErr) throw profErr
      
      profile.value = {
        interests: userProfile?.interest_tags || [],
        behaviorScore,
        activeHours: hours,
        peakHour,
        socialTendency,
        actionCounts,
        totalInteractions,
        lastUpdated: new Date().toISOString()
      }
      
      lastUpdated.value = profile.value.lastUpdated
    } catch (e) {
      console.error('[AI-Profile] Update profile failed:', e)
    } finally {
      loading.value = false
    }
  }

  // 获取用户兴趣向量（简化版：基于行为和标签）
  function getInterestVector(userId) {
    // 这里可以先返回基于标签的简单向量
    // 后续可以接入 embedding API 生成真正的向量
    return {
      userId,
      tags: profile.value?.interests || [],
      behaviorScore: profile.value?.behaviorScore || 0
    }
  }

  // 计算两个用户的相似度（基于标签和行为）
  function calculateSimilarity(userA, userB) {
    if (!userA || !userB) return 0
    
    const tagsA = userA.interest_tags || []
    const tagsB = userB.interest_tags || []
    
    // 标签重叠度
    const commonTags = tagsA.filter(tag => tagsB.includes(tag)).length
    const maxTags = Math.max(tagsA.length, tagsB.length, 1)
    const tagSimilarity = commonTags / maxTags
    
    // 学院相同加分
    const collegeBonus = (userA.college === userB.college && userA.college) ? 0.2 : 0
    
    return Math.min(1, tagSimilarity * 0.8 + collegeBonus)
  }

  return {
    profile, loading, lastUpdated,
    interests, behaviorScore, activeHours, socialTendency,
    trackInteraction, updateUserProfile, getInterestVector, calculateSimilarity
  }
})
