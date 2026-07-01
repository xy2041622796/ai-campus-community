import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export const useFollowStore = defineStore('follow', () => {
  const following = ref([])
  const followers = ref([])
  const followingList = ref([])
  const lastFetchTime = ref(null)
  const loading = ref(false)

  async function fetchFollowing(userId) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    following.value = data?.map(f => f.following_id) || []
  }

  function isFollowing(userId) {
    return following.value.includes(userId)
  }

  async function followUser(targetId) {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return
    loading.value = true
    try {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
      following.value.push(targetId)
    } finally { loading.value = false }
  }

  async function unfollowUser(targetId) {
    const { data: { user } } = await supabase.auth.getSession()
    if (!user) return
    loading.value = true
    try {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', targetId)
      following.value = following.value.filter(id => id !== targetId)
    } finally { loading.value = false }
  }

  async function fetchFollowers(userId) {
    if (lastFetchTime.value && Date.now() - lastFetchTime.value < 30000) return
    const { data } = await supabase.from('follows').select('follower_id').eq('following_id', userId)
    if (!data) return
    const ids = data.map(f => f.follower_id)
    if (!ids.length) { followers.value = []; return }
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    followers.value = profiles || []
  }

  async function fetchFollowingProfiles(userId) {
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
    if (!data) return
    const ids = data.map(f => f.following_id)
    if (!ids.length) { followingList.value = []; return }
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    followingList.value = profiles || []
  }

  return { following, followers, followingList, loading, lastFetchTime, fetchFollowing, isFollowing, followUser, unfollowUser, fetchFollowers, fetchFollowingProfiles }
})
