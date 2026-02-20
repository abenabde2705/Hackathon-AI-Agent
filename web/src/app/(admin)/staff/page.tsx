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
import { Plus, Loader2, ShieldCheck, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email?: string | null
  role: 'alumni' | 'staff' | 'admin'
  graduation_year: number | null
}

export default function AdminUsersPage() {
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
    // Admin manages Staff/Admin roles here
    setProfiles((data as Profile[]).filter(p => p.role === 'staff' || p.role === 'admin'))
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
      role: 'staff', // Forced for this form
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
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion du Staff</h2>
            <p className="text-muted-foreground">
              Créez et gérez les comptes administratifs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Staff Invitation Form */}
        <Card className="p-6 h-fit lg:col-span-1 border-red-100 dark:border-red-900/20">
          <form onSubmit={handleInvite} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <UserCog className="h-5 w-5 text-red-600" />
              Inviter un Staff
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email professionnel</label>
              <Input name="email" type="email" placeholder="staff@ecole.com" required disabled={isInviting} />
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

            <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-xs text-red-800 dark:text-red-400">
              Note: Le rôle sera automatiquement défini sur <strong>staff</strong>.
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Invitation staff envoyée !</p>}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isInviting}>
              {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Inviter au Staff
            </Button>
          </form>
        </Card>

        {/* Staff List */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Équipe Administrative</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aucun membre du staff trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell>{profile.email || '-'}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        profile.role === 'admin' ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {profile.role}
                      </span>
                    </TableCell>
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
