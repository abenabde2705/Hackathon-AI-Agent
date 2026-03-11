import { createClient } from '@/lib/supabase/server'

export interface Event {
  id: string
  title: string
  description: string | null
  location: string | null
  event_date: string
  image_url: string | null
  created_by: string | null
  created_at: string
}

export interface Participant {
  id: string
  user_id: string
  profiles: {
    first_name: string | null
    last_name: string | null
    role: string
  }
}

export async function getEvents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data as Event[]
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return null
  }

  return data as Event
}

export async function getEventParticipants(eventId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      id,
      user_id,
      profiles (
        first_name,
        last_name,
        role
      )
    `)
    .eq('event_id', eventId)

  if (error) {
    console.error('Error fetching participants:', error)
    return []
  }

  return data as unknown as Participant[]
}

export async function isUserRegistered(eventId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single()

  return !!data
}
