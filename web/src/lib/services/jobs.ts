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

export interface JobFilters {
  search?: string
  type?: string
  sort?: 'newest' | 'oldest'
}

export async function getJobs(filters?: JobFilters) {
  const supabase = await createClient()
  let query = supabase.from('jobs').select('*')

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
  }

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  const sortOrder = filters?.sort === 'oldest' ? true : false
  query = query.order('created_at', { ascending: sortOrder })

  const { data, error } = await query

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
