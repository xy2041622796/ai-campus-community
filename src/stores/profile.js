import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const loading = ref(false)

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) profile.value = data
  }

  async function updateProfile(userId, form) {
    loading.value = true
    try {
      const { error } = await supabase.from('profiles').update({
        nickname: form.nickname,
        avatar_url: form.avatar_url,
        college: form.college, grade: form.grade,
        bio: form.bio, interest_tags: form.interest_tags,
        updated_at: new Date().toISOString()
      }).eq('id', userId)
      if (error) throw error
      await fetchProfile(userId)
    } finally { loading.value = false }
  }

  async function searchUsers(query) {
    const { data } = await supabase.from('profiles').select('*')
      .or(`nickname.ilike.%${query}%,student_id.ilike.%${query}%`).limit(20)
    return data || []
  }

  return { profile, loading, fetchProfile, updateProfile, searchUsers }
})
