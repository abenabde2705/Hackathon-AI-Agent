'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // 1. Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // 2. Récupérer le rôle pour la redirection
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Utilisateur non trouvé après mise à jour.")

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // 3. Redirection selon le rôle
      const role = profile?.role
      if (role === 'admin') {
        router.push('/admin/staff')
      } else if (role === 'staff') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard/jobs')
      }

    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la mise à jour.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950">
      <Card className="max-w-md w-full shadow-lg border dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold dark:text-zinc-100">Créer votre mot de passe</CardTitle>
          <CardDescription className="dark:text-zinc-400">
            Veuillez définir votre mot de passe pour accéder à la plateforme.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-zinc-300">Nouveau mot de passe</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-zinc-300">Confirmer le mot de passe</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Confirmer le mot de passe"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
