import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { studentIdToEmail } from '@/utils/helpers'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const isLoggedIn = computed(() => user.value !== null)

  async function initSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await fetchProfile(session.user.id)
  }

  async function fetchProfile(userId) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      user.value = data
      return
    }
    // 未找到 profile，尝试从 auth 元数据自动创建（兼容老旧未修复的触发器）
    if (error && error.code === 'PGRST116') {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser?.user_metadata) {
        const meta = authUser.user_metadata
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          student_id: meta.student_id || 'unknown',
          nickname: meta.nickname || '新用户',
          college: meta.college || null,
          grade: meta.grade || null,
        })
        if (!insertError) {
          const { data: newProfile } = await supabase.from('profiles').select('*').eq('id', userId).single()
          if (newProfile) user.value = newProfile
        }
      }
    }
    // 如果仍然没有 profile，则设置一个基础的临时对象
    if (!user.value) {
      user.value = { id: userId, nickname: '新用户', student_id: '', avatar_url: null }
    }
  }

  async function register(studentId, password, nickname, college, grade) {
    loading.value = true
    try {
      const email = studentIdToEmail(studentId)
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { student_id: studentId, nickname, college, grade } }
      })
      if (error) throw error
      await login(studentId, password)
    } finally { loading.value = false }
  }

  async function login(studentId, password) {
    loading.value = true
    try {
      const email = studentIdToEmail(studentId)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) await fetchProfile(data.user.id)
    } finally { loading.value = false }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isLoggedIn, initSession, register, login, logout, fetchProfile }
})