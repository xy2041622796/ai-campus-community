import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const unreadCount = ref(0)
  const lastFetchTime = ref(null)

  async function fetchNotifications() {
    if (lastFetchTime.value && Date.now() - lastFetchTime.value < 30000) return
    loading.value = true
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(id, nickname, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.warn('[通知] notifications 表尚未创建，请运行迁移 SQL')
        notifications.value = []
        unreadCount.value = 0
        return
      }
      throw error
    }
      notifications.value = data || []
      unreadCount.value = notifications.value.filter(n => !n.read).length
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(notificationId) {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
    const n = notifications.value.find(n => n.id === notificationId)
    if (n && !n.read) {
      n.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    notifications.value.forEach(n => { n.read = true })
    unreadCount.value = 0
  }

  const latestNotifications = computed(() => notifications.value.slice(0, 5))

  return { notifications, loading, unreadCount, latestNotifications, lastFetchTime, fetchNotifications, markAsRead, markAllAsRead }
})
