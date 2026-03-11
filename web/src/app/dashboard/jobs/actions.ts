'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJob(formData: FormData) {
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
  const company = formData.get('company') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as 'CDI' | 'CDD' | 'Freelance'
  const description = formData.get('description') as string
  const apply_url = formData.get('apply_url') as string

  const { error } = await supabase.from('jobs').insert({
    title,
    company,
    location,
    type,
    description,
    apply_url,
    created_by: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/jobs')
  redirect('/dashboard/jobs')
}

export async function deleteJob(id: string) {
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

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/jobs')
  redirect('/dashboard/jobs')
}
