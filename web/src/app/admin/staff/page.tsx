'use client'

import { useEffect, useState } from 'react'
import { getProfiles, inviteUser, deleteUser, updateUser } from '@/lib/services/user-actions'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, Loader2, ShieldCheck, UserCog, Pencil, Trash2 } from 'lucide-react'
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

  // Edit state
  const [editTarget, setEditTarget] = useState<Profile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => { loadProfiles() }, [])

  async function loadProfiles() {
    setIsLoading(true)
    const data = await getProfiles()
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
      role: 'staff',
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

  async function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editTarget) return
    setIsSaving(true)
    setEditError(null)

    const formData = new FormData(event.currentTarget)
    const result = await updateUser(editTarget.id, {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
    })

    if (result?.error) {
      setEditError(result.error)
    } else {
      setEditTarget(null)
      loadProfiles()
    }
    setIsSaving(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    const result = await deleteUser(deleteTarget.id)
    if (!result?.error) {
      setProfiles(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    }
    setIsDeleting(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion du Staff</h2>
          <p className="text-muted-foreground">Créez et gérez les comptes administratifs.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Invite Form */}
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
              Le rôle sera automatiquement défini sur <strong>staff</strong>.
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
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Chargement...</TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Aucun membre du staff trouvé.</TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id} className="group">
                    <TableCell className="font-medium">{profile.first_name} {profile.last_name}</TableCell>
                    <TableCell>{profile.email || '—'}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        profile.role === 'admin' ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      )}>
                        {profile.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {profile.role !== 'admin' && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditTarget(profile); setEditError(null) }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteTarget(profile)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Modifier le staff</DialogTitle>
            <DialogDescription>Mettez à jour les informations de {editTarget?.first_name} {editTarget?.last_name}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prénom</label>
                <Input name="first_name" defaultValue={editTarget?.first_name ?? ''} required
                  className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom</label>
                <Input name="last_name" defaultValue={editTarget?.last_name ?? ''} required
                  className="h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg" />
              </div>
            </div>
            {editError && <p className="text-sm text-red-600">{editError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)} className="rounded-lg">Annuler</Button>
              <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le membre</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 rounded-lg">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
