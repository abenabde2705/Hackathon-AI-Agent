'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getProfiles() {
  const supabase = await createClient()
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return profiles
}

export async function inviteUser(userData: {
  email: string
  first_name: string
  last_name: string
  role: 'alumni' | 'staff'
  graduation_year?: number
  degree?: string
  linkedin_url?: string
}) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. Check current user role permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!currentUserProfile) throw new Error('Unauthorized')

    // STRICT RULE 1: Only admin can invite staff
    if (userData.role === 'staff' && currentUserProfile.role !== 'admin') {
      return { error: 'Permission denied: Only administrators can invite Staff.' }
    }

    // STRICT RULE 2: Staff can only invite Alumni
    if (currentUserProfile.role === 'staff' && userData.role !== 'alumni') {
      return { error: 'Permission denied: Staff can only invite Alumni.' }
    }

    // Ensure user is at least staff/admin
    if (currentUserProfile.role !== 'admin' && currentUserProfile.role !== 'staff') {
      throw new Error('Unauthorized')
    }

    // 2. Invite user via Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      userData.email,
      {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`,
      }
    )

    if (inviteError) {
      return { error: inviteError.message }
    }

    // 3. Update the profile with metadata
    if (inviteData.user) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          graduation_year: userData.graduation_year,
          degree: userData.degree,
          linkedin_url: userData.linkedin_url,
        })
        .eq('id', inviteData.user.id)

      if (updateError) {
        console.error('Error updating profile metadata:', updateError)
      }
    }

    revalidatePath('/admin/staff')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Invitation error:', err)
    return { error: err.message || 'An unexpected error occurred during invitation.' }
  }
}

interface BulkInviteUser {
  email: string
  first_name: string
  last_name: string
  graduation_year?: string | number
  degree?: string
  linkedin_url?: string
}

export async function bulkInviteAlumni(users: BulkInviteUser[]) {
  const results = {
    successCount: 0,
    errors: [] as string[],
  }

  for (const user of users) {
    const res = await inviteUser({
      ...user,
      role: 'alumni',
      graduation_year: user.graduation_year ? parseInt(user.graduation_year.toString()) : undefined,
    })

    if (res.success) {
      results.successCount++
    } else {
      results.errors.push(`${user.email}: ${res.error}`)
    }
  }

  revalidatePath('/dashboard')
  return results
}
