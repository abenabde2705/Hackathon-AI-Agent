'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    throw new Error('Permission denied')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const event_date = formData.get('event_date') as string
  const image_url = formData.get('image_url') as string

  const { error } = await supabase.from('events').insert({
    title,
    description,
    location,
    event_date,
    image_url,
    created_by: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/events')
  redirect('/dashboard/events')
}

export async function registerForEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('event_participants').insert({
    event_id: eventId,
    user_id: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}

export async function unregisterFromEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/events/${eventId}`)
}
