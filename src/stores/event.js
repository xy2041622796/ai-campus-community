import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'

export const useEventStore = defineStore('event', () => {
  const events = ref([])
  const currentEvent = ref(null)
  const myRegistrations = ref([])
  const loading = ref(false)

  async function fetchEvents() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, organizer:organizer_id(id, nickname, avatar_url)')
        .order('event_date', { ascending: true })
      if (error) throw error
      events.value = data || []
      // Get participant counts for each event
      for (const ev of events.value) {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', ev.id)
          .eq('status', 'registered')
        ev.participant_count = count || 0
      }
    } finally { loading.value = false }
  }

  async function fetchEventById(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:organizer_id(id, nickname, avatar_url)')
      .eq('id', eventId)
      .single()
    if (error) throw error
    currentEvent.value = data
    return data
  }

  async function createEvent(eventData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('\u8bf7\u5148\u767b\u5f55')
    const { data, error } = await supabase.from('events').insert({
      ...eventData, organizer_id: user.id
    }).select('*, organizer:organizer_id(id, nickname, avatar_url)').single()
    if (error) throw error
    events.value.push(data)
    return data
  }

  async function joinEvent(eventId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('\u8bf7\u5148\u767b\u5f55')
    const { error } = await supabase.from('event_participants').insert({
      event_id: eventId, user_id: user.id
    })
    if (error) throw error
    await fetchMyRegistrations()
  }

  async function leaveEvent(eventId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('event_participants').delete()
      .eq('event_id', eventId).eq('user_id', user.id)
    await fetchMyRegistrations()
  }

  async function fetchMyRegistrations() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('event_participants')
      .select('event_id').eq('user_id', user.id).eq('status', 'registered')
    myRegistrations.value = data?.map(r => r.event_id) || []
  }

  const registeredIds = computed(() => new Set(myRegistrations.value))
  const upcomingEvents = computed(() => events.value.filter(e => e.status === 'open'))

  return {
    events, currentEvent, myRegistrations, loading, registeredIds, upcomingEvents,
    fetchEvents, fetchEventById, createEvent, joinEvent, leaveEvent, fetchMyRegistrations
  }
})
