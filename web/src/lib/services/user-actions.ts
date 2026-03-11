'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { AlumniEntry } from '@/app/api/alumni/directory/route'

export async function deleteUser(userId: string) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: currentProfile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'staff')) {
      throw new Error('Unauthorized')
    }

    const { data: targetProfile } = await adminClient
      .from('profiles').select('role').eq('id', userId).single()

    if (currentProfile.role === 'staff' && targetProfile?.role !== 'alumni') {
      return { error: 'Permission denied: Staff can only delete Alumni.' }
    }

    await adminClient.from('profiles').delete().eq('id', userId)
    await adminClient.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard')
    revalidatePath('/admin/staff')
    revalidatePath('/dashboard/directory')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Unexpected error' }
  }
}

export async function updateUser(userId: string, data: {
  first_name?: string
  last_name?: string
  graduation_year?: number | null
  degree?: string | null
  linkedin_url?: string | null
}) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: currentProfile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'staff')) {
      throw new Error('Unauthorized')
    }

    const { error } = await adminClient.from('profiles').update(data).eq('id', userId)
    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/admin/staff')
    revalidatePath('/dashboard/directory')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Unexpected error' }
  }
}

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

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`

    // 2. Invite user via Supabase Auth Admin API
    let { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      userData.email,
      {
        data: { first_name: userData.first_name, last_name: userData.last_name },
        redirectTo,
      }
    )

    // Track invite link (only generated for existing users — calling generateLink after
    // inviteUserByEmail for a NEW user would invalidate the emailed token)
    let inviteLink: string | null = null

    // If user already exists in auth, generate a fresh invite link manually
    if (inviteError) {
      if (inviteError.message.toLowerCase().includes('already been registered')) {
        const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
        const existingUser = listData?.users.find((u) => u.email === userData.email)
        if (!existingUser) return { error: inviteError.message }

        try {
          const { data: linkData } = await adminClient.auth.admin.generateLink({
            type: 'invite',
            email: userData.email,
            options: { redirectTo },
          })
          inviteLink = linkData?.properties?.action_link ?? null
        } catch {
          // Non-blocking
        }

        inviteData = { user: existingUser } as typeof inviteData
        inviteError = null
      } else {
        return { error: inviteError.message }
      }
    }

    // 4. Update the profile with metadata
    if (inviteData?.user) {
      const { error: updateError } = await adminClient
        .from('profiles')
        .upsert({
          id: inviteData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          graduation_year: userData.graduation_year ?? null,
          degree: userData.degree ?? null,
          linkedin_url: userData.linkedin_url ?? null,
        })

      if (updateError) {
        console.error('Error updating profile metadata:', updateError)
      }
    }

    revalidatePath('/admin/staff')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/directory')
    return { success: true, inviteLink }
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
  revalidatePath('/dashboard/directory')
  return results
}

export async function updateAlumniAfterScrape(
  id: string,
  data: { current_position?: string | null; current_company?: string | null; avatar_url?: string | null }
) {
  const adminClient = createAdminClient()
  await adminClient
    .from('profiles')
    .update({
      current_position: data.current_position ?? null,
      current_company: data.current_company ?? null,
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
    })
    .eq('id', id)
  revalidatePath('/dashboard/directory')
}

export async function getAlumniWithLinkedin(): Promise<AlumniEntry[]> {
  const adminClient = createAdminClient()

  const [usersResult, profilesResult] = await Promise.all([
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
    adminClient
      .from('profiles')
      .select('*')
      .eq('role', 'alumni')
      .not('linkedin_url', 'is', null),
  ])

  if (profilesResult.error) return []

  const emailMap = new Map(
    (usersResult.data?.users ?? []).map((u) => [u.id, u.email ?? null])
  )

  return (profilesResult.data ?? []).map((p) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    email: emailMap.get(p.id) ?? null,
    graduation_year: p.graduation_year,
    degree: p.degree,
    current_position: p.current_position,
    current_company: p.current_company,
    linkedin_url: p.linkedin_url,
    avatar_url: p.avatar_url,
    type: 'alumni' as const,
  }))
}

export async function inviteAndEnrichAlumni(
  csvRow: {
    email: string
    firstName: string
    lastName: string
    graduationYear: number | null
    diploma: string
    linkedinUrl: string
  },
  scraped: { company?: string | null; position?: string | null; avatar_url?: string | null }
): Promise<{ success: true; profile: AlumniEntry } | { error: string }> {
  try {
    const adminClient = createAdminClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm`

    // 1. Find existing user by email
    const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    const existingUser = listData?.users.find((u) => u.email === csvRow.email)

    let userId: string

    if (existingUser) {
      // Re-generate invite link for existing user
      await adminClient.auth.admin.generateLink({
        type: 'invite',
        email: csvRow.email,
        options: { redirectTo },
      })
      userId = existingUser.id
    } else {
      // Invite new user
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        csvRow.email,
        {
          data: { first_name: csvRow.firstName, last_name: csvRow.lastName },
          redirectTo,
        }
      )
      if (inviteError || !inviteData?.user) {
        return { error: inviteError?.message ?? 'Failed to invite user' }
      }
      userId = inviteData.user.id
    }

    // 2. Upsert profile with scraped data
    const profileData = {
      id: userId,
      first_name: csvRow.firstName,
      last_name: csvRow.lastName,
      role: 'alumni' as const,
      graduation_year: csvRow.graduationYear ?? null,
      degree: csvRow.diploma || null,
      linkedin_url: csvRow.linkedinUrl || null,
      current_company: scraped.company ?? null,
      current_position: scraped.position ?? null,
      avatar_url: scraped.avatar_url ?? null,
    }

    const { error: upsertError } = await adminClient.from('profiles').upsert(profileData)
    if (upsertError) {
      return { error: upsertError.message }
    }

    revalidatePath('/dashboard/directory')

    const profile: AlumniEntry = {
      id: userId,
      first_name: csvRow.firstName,
      last_name: csvRow.lastName,
      email: csvRow.email,
      graduation_year: csvRow.graduationYear ?? null,
      degree: csvRow.diploma || null,
      linkedin_url: csvRow.linkedinUrl || null,
      current_company: scraped.company ?? null,
      current_position: scraped.position ?? null,
      avatar_url: scraped.avatar_url ?? null,
      type: 'alumni',
    }

    return { success: true, profile }
  } catch (err: any) {
    return { error: err.message ?? 'Unexpected error' }
  }
}
