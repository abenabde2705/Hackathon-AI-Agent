'use client'

import { useEffect, useState } from 'react'
import { getProfiles, inviteUser } from '@/lib/services/user-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Upload, Loader2, GraduationCap, Users, Mail, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { AnimatedPage, AnimatedSection } from '@/components/ui/animated-section'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email?: string | null
  role: 'alumni' | 'staff' | 'admin'
  graduation_year: number | null
  degree?: string | null
  linkedin_url?: string | null
}

export default function StaffUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => { loadProfiles() }, [])

  async function loadProfiles() {
    setIsLoading(true)
    const data = await getProfiles()
    setProfiles((data as Profile[]).filter(p => p.role === 'alumni'))
    setIsLoading(false)
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsInviting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(event.currentTarget)
    const result = await inviteUser({
      email: formData.get('email') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      role: 'alumni',
      graduation_year: formData.get('graduation_year') ? parseInt(formData.get('graduation_year') as string) : undefined,
      degree: formData.get('degree') as string,
      linkedin_url: formData.get('linkedin_url') as string,
    })

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      event.currentTarget.reset()
      loadProfiles()
    }
    setIsInviting(false)
  }

  const statCards = [
    { label: 'Diplômés inscrits', value: profiles.length, icon: GraduationCap, color: 'blue' },
    { label: 'Promos représentées', value: new Set(profiles.map(p => p.graduation_year).filter(Boolean)).size, icon: Users, color: 'violet' },
    { label: 'Invitations ce mois', value: '-', icon: Mail, color: 'emerald' },
  ]

  return (
    <AnimatedPage className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gestion des Alumni
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Invitez et gérez les diplômés de votre réseau.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 shadow-sm border-zinc-200 hover:border-zinc-300 transition-all">
          <Link href="/dashboard/import">
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm',
              'hover:shadow-md transition-shadow duration-200'
            )}
          >
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              stat.color === 'blue' && 'bg-blue-50 dark:bg-blue-900/30',
              stat.color === 'violet' && 'bg-violet-50 dark:bg-violet-900/30',
              stat.color === 'emerald' && 'bg-emerald-50 dark:bg-emerald-900/30',
            )}>
              <stat.icon className={cn(
                'h-5 w-5',
                stat.color === 'blue' && 'text-blue-600',
                stat.color === 'violet' && 'text-violet-600',
                stat.color === 'emerald' && 'text-emerald-600',
              )} />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{isLoading ? '—' : stat.value}</p>
            </div>
          </div>
        ))}
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invite Form */}
        <AnimatedSection delay={0.1} className="lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="text-base font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Inviter un Alumni
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Un email d'invitation sera envoyé.</p>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</label>
                <Input name="email" type="email" placeholder="alumni@exemple.com" required disabled={isInviting}
                  className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prénom</label>
                  <Input name="first_name" placeholder="Prénom" required disabled={isInviting}
                    className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom</label>
                  <Input name="last_name" placeholder="Nom" required disabled={isInviting}
                    className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Promo</label>
                  <Input name="graduation_year" type="number" placeholder="2024" required disabled={isInviting}
                    className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Diplôme</label>
                  <Input name="degree" placeholder="Master…" required disabled={isInviting}
                    className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">LinkedIn (optionnel)</label>
                <Input name="linkedin_url" placeholder="https://linkedin.com/in/…" disabled={isInviting}
                  className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Invitation envoyée !</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isInviting}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
              >
                {isInviting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours…</>
                  : <><Plus className="mr-2 h-4 w-4" />Créer le compte Alumni</>
                }
              </Button>
            </form>
          </div>
        </AnimatedSection>

        {/* Alumni Table */}
        <AnimatedSection delay={0.15} className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Liste des Alumni</h3>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                {profiles.length} diplômé{profiles.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Nom</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Promo</TableHead>
                    <TableHead className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Diplôme</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i} className="border-zinc-100 dark:border-zinc-800">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                          </TableCell>
                        ))}
                        <TableCell />
                      </TableRow>
                    ))
                  ) : profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                            <Users className="h-6 w-6 text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-500">Aucun alumni pour l'instant</p>
                          <p className="text-xs text-zinc-400 mt-1">Invitez votre premier diplômé avec le formulaire.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                              {(profile.first_name?.[0] ?? '')}{(profile.last_name?.[0] ?? '')}
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                              {profile.first_name} {profile.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">{profile.email || '—'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {profile.graduation_year || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">{profile.degree || '—'}</TableCell>
                        <TableCell>
                          {profile.linkedin_url && (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-blue-600 transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </AnimatedPage>
  )
}
