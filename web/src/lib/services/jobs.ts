import { createClient } from '@/lib/supabase/server'

export interface Job {
  id: string
  title: string
  company: string
  location: string | null
  description: string | null
  type: 'CDI' | 'CDD' | 'Freelance'
  apply_url: string | null
  created_by: string | null
  created_at: string
}

export async function getJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    return []
  }

  return data as Job[]
}

export async function getJobById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    return null
  }

  return data as Job
}
