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
    { label: 'Diplômés inscrits', value: profiles.length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Promos représentées', value: new Set(profiles.map(p => p.graduation_year).filter(Boolean)).size, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Invitations ce mois', value: '-', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ]

  return (
    <AnimatedPage className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gestion des Alumni
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Pilotez votre communauté et invitez de nouveaux diplômés.
          </p>
        </div>
        <Button asChild variant="outline" className="h-11 px-6 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all gap-2 group">
          <Link href="/dashboard/import">
            <Upload className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-semibold">Import CSV</span>
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <AnimatedSection stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 p-6 shadow-sm backdrop-blur-sm transition-all duration-300",
              "hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {isLoading ? '—' : stat.value}
                </h3>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
          </div>
        ))}
      </AnimatedSection>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Invite Form */}
        <AnimatedSection delay={0.1} className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="px-6 py-8 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Nouvel Alumni</h3>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Ajoutez manuellement un diplômé à votre réseau.</p>
            </div>

            <form onSubmit={handleInvite} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Coordonnées</label>
                  <Input name="email" type="email" placeholder="Email professionnel ou perso" required disabled={isInviting}
                    className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input name="first_name" placeholder="Prénom" required disabled={isInviting}
                    className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                  <Input name="last_name" placeholder="Nom" required disabled={isInviting}
                    className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Cursus</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="graduation_year" type="number" placeholder="Promo 2024" required disabled={isInviting}
                    className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                  <Input name="degree" placeholder="Diplôme obtenu" required disabled={isInviting}
                    className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Réseaux</label>
                <Input name="linkedin_url" placeholder="URL du profil LinkedIn" disabled={isInviting}
                  className="h-12 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all" />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50 p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Invitation envoyée avec succès !
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isInviting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isInviting
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Traitement...</>
                  : <><Plus className="mr-2 h-5 w-5" />Ajouter au réseau</>
                }
              </Button>
            </form>
          </div>
        </AnimatedSection>

        {/* Alumni Table */}
        <AnimatedSection delay={0.15} className="lg:col-span-8">
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="px-8 py-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Base de données</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Consultez et filtrez vos membres.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                <Users className="h-4 w-4" />
                <span className="text-sm font-bold tracking-tight">
                  {profiles.length} Alumni{profiles.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Diplômé</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Promotion</TableHead>
                    <TableHead className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Cursus</TableHead>
                    <TableHead className="w-16 px-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-zinc-100 dark:border-zinc-800">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j} className="px-8 py-6">
                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                          </TableCell>
                        ))}
                        <TableCell />
                      </TableRow>
                    ))
                  ) : profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="w-20 h-20 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
                            <Users className="h-10 w-10 text-zinc-300" />
                          </div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Aucun résultat</h4>
                          <p className="text-sm text-zinc-500 max-w-[240px] mt-2">Commencez par importer une liste CSV ou ajoutez un alumni manuellement.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id} className="group border-zinc-100 dark:border-zinc-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                              {(profile.first_name?.[0] ?? '')}{(profile.last_name?.[0] ?? '')}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px]">
                                {profile.first_name} {profile.last_name}
                              </span>
                              <span className="text-[13px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">
                                {profile.degree}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{profile.email}</span>
                            <span className="text-xs text-zinc-500 font-medium">Email vérifié</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <span className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 px-3 py-1 text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                            Promo {profile.graduation_year}
                          </span>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <span className="text-sm text-zinc-500 font-medium">Diplômé Master</span>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          {profile.linkedin_url && (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-100">
                              <ExternalLink className="h-4 w-4" />
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
