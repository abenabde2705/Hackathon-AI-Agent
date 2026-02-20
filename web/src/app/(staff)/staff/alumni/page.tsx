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
import { Card } from '@/components/ui/card'
import { Plus, Upload, Loader2, GraduationCap, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'

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

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setIsLoading(true)
    const data = await getProfiles()
    // Staff/Admin manages Alumni roles here
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
      role: 'alumni', // Forced for this backoffice
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Alumni</h2>
            <p className="text-muted-foreground">
              Invitez de nouveaux diplômés sur la plateforme.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="shadow-sm">
            <Link href="/staff/alumni/scrape">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              Magic Scraper
            </Link>
          </Button>
          <Button asChild variant="outline" className="shadow-sm">
            <Link href="/staff/alumni/import">
              <Upload className="mr-2 h-4 w-4" />
              Import Bulk CSV
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Alumni Invitation Form */}
        <Card className="p-6 h-fit lg:col-span-1 shadow-sm">
          <form onSubmit={handleInvite} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Nouvel Alumni
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="alumni@exemple.com" required disabled={isInviting} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input name="first_name" placeholder="Prénom" required disabled={isInviting} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input name="last_name" placeholder="Nom" required disabled={isInviting} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Promo (Année)</label>
                <Input name="graduation_year" type="number" placeholder="2024" required disabled={isInviting} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Diplôme</label>
                <Input name="degree" placeholder="Master..." required disabled={isInviting} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL (Optionnel)</label>
              <Input name="linkedin_url" placeholder="https://linkedin.com/in/..." disabled={isInviting} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">Invitation envoyée avec succès !</p>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]" disabled={isInviting}>
              {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Créer le compte Alumni
            </Button>
          </form>
        </Card>

        {/* Alumni List */}
        <Card className="lg:col-span-2 overflow-hidden shadow-sm">
          <div className="p-6 border-b flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="text-lg font-semibold">Annuaire Alumni</h3>
            <span className="text-xs font-medium text-muted-foreground bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
              {profiles.length} Diplômés
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Promo</TableHead>
                <TableHead>Diplôme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun diplômé trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile: Profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell className="text-zinc-500">{profile.email || '-'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium">
                        {profile.graduation_year || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500">{profile.degree || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
